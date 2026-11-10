import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, TriangleAlert } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import {
    type Control,
    type UseFormRegisterReturn,
    useController,
    useFieldArray,
    useForm,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import type { ListingIngestionMethodData, ReferralConfigurationData } from "@/client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { toSupportedCurrency } from "@/data/internal/common/Currency.ts";
import {
    ADMIN_LISTING_SOURCE_INGESTION_METHODS,
    ADMIN_LISTING_SOURCE_PLATFORM_SUGGESTIONS,
    type AdminListingSourceCreateValues,
    type AdminListingSourceDetail,
    type AdminListingSourceUpdateValues,
    createDefaultConfiguration,
    defaultUpdateConfigurations,
    isOptionalPlatformTechnology,
} from "@/data/internal/listing-source/AdminListingSource.ts";
import { LISTING_SOURCE_TYPES } from "@/data/internal/listing-source/ListingSourceType.ts";
import { AdminSelect } from "@/features/admin/common/components/AdminDirectory.tsx";
import { AdminRecordDialog } from "@/features/admin/common/components/AdminRecordDialog.tsx";
import {
    ADMIN_LEGEND_CLASS,
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    FOCUS_CLASS,
    INLINE_ALERT_CLASS,
    MONO_LABEL_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { AdminPartyPicker } from "@/features/admin/party-management/components/AdminPartyPicker.tsx";
import { cn } from "@/lib/utils.ts";
import {
    AdminListingSourceRequestError,
    useCreateAdminListingSource,
    useUpdateAdminListingSource,
} from "../api/useAdminListingSources.ts";

const MAX_NAME_BYTES = 255;

function fitsName(value: string) {
    return new TextEncoder().encode(value.trim()).length <= MAX_NAME_BYTES;
}

function isOptionalHttpUrl(value: string) {
    if (!value.trim()) return true;
    try {
        const url = new URL(value.trim());
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

const presentationUrlSchema = z.string().refine(isOptionalHttpUrl, {
    message: "adminListingSources.validation.invalidUrl",
});

const platformTechnologySchema = z.string().refine(isOptionalPlatformTechnology, {
    message: "adminListingSources.validation.platformTechnology",
});

const UNSUPPORTED_CURRENCY_MESSAGE = "adminListingSources.validation.unsupportedCurrency";

/** Empty means "not configured"; anything else must be a supported ISO 4217 code. */
function isOptionalSupportedCurrency(value: string): boolean {
    return !value.trim() || toSupportedCurrency(value) !== undefined;
}

function currencyFieldFor(method: string): "fallbackCurrency" | "currency" | undefined {
    if (method === "WEB_CRAWL") return "fallbackCurrency";
    if (method === "SHOPIFY" || method === "WOOCOMMERCE") return "currency";
    return undefined;
}

function addCurrencyIssues(
    configuration: { readonly fallbackCurrency: string; readonly currency: string },
    method: string,
    index: number,
    context: z.RefinementCtx,
) {
    const field = currencyFieldFor(method);
    if (field && !isOptionalSupportedCurrency(configuration[field])) {
        context.addIssue({
            code: "custom",
            path: ["configurations", index, field],
            message: UNSUPPORTED_CURRENCY_MESSAGE,
        });
    }
}

const nameSchema = z
    .string()
    .trim()
    .min(1, "adminListingSources.validation.nameRequired")
    .refine(fitsName, { message: "adminListingSources.validation.nameTooLong" });

const configurationFieldsSchema = z.object({
    type: z.enum(ADMIN_LISTING_SOURCE_INGESTION_METHODS),
    fallbackCurrency: z.string(),
    domain: z.string(),
    currency: z.string(),
    language: z.string(),
    webhookSecret: z.string(),
});

const createFormSchema = z
    .object({
        name: nameSchema,
        // Starts unchosen so an administrator classifies every new source deliberately.
        listingSourceType: z
            .enum(["", ...LISTING_SOURCE_TYPES])
            .refine(
                (value) => value !== "",
                "adminListingSources.validation.listingSourceTypeRequired",
            ),
        operatorType: z.enum(["EXISTING", "NEW"]),
        operatorPartyId: z.string(),
        operatorName: z.string(),
        operatorPhone: z.string(),
        operatorEmail: z
            .string()
            .trim()
            .pipe(z.union([z.literal(""), z.email("adminListingSources.validation.invalidEmail")])),
        platformTechnology: platformTechnologySchema,
        configurations: z.array(configurationFieldsSchema),
        url: presentationUrlSchema,
        image: presentationUrlSchema,
        partnerizeCamref: z.string(),
    })
    .superRefine((values, context) => {
        if (values.operatorType === "EXISTING" && !values.operatorPartyId.trim()) {
            context.addIssue({
                code: "custom",
                path: ["operatorPartyId"],
                message: "adminListingSources.validation.operatorRequired",
            });
        }
        if (values.operatorType === "NEW" && !values.operatorName.trim()) {
            context.addIssue({
                code: "custom",
                path: ["operatorName"],
                message: "adminListingSources.validation.operatorNameRequired",
            });
        }
        const methods = values.configurations.map((configuration) => configuration.type);
        if (new Set(methods).size !== methods.length) {
            context.addIssue({
                code: "custom",
                path: ["configurations"],
                message: "adminListingSources.validation.duplicateMethod",
            });
        }
        values.configurations.forEach((configuration, index) => {
            if (configuration.type === "SHOPIFY" && !configuration.domain.trim()) {
                context.addIssue({
                    code: "custom",
                    path: ["configurations", index, "domain"],
                    message: "adminListingSources.validation.shopifyDomainRequired",
                });
            }
            if (configuration.type === "WOOCOMMERCE" && !configuration.webhookSecret.trim()) {
                context.addIssue({
                    code: "custom",
                    path: ["configurations", index, "webhookSecret"],
                    message: "adminListingSources.validation.webhookSecretRequired",
                });
            }
            addCurrencyIssues(configuration, configuration.type, index, context);
        });
    });

const updateConfigurationSchema = z.object({
    ingestionMethod: z.enum(ADMIN_LISTING_SOURCE_INGESTION_METHODS),
    fallbackCurrency: z.string(),
    domain: z.string(),
    currency: z.string(),
    language: z.string(),
    webhookSecret: z.string(),
});

const updateFormSchema = z
    .object({
        name: nameSchema,
        listingSourceType: z.enum(LISTING_SOURCE_TYPES),
        platformTechnology: platformTechnologySchema,
        url: presentationUrlSchema,
        image: presentationUrlSchema,
        referralAction: z.enum(["KEEP", "SET", "CLEAR"]),
        partnerizeCamref: z.string(),
        replaceIngestionConfiguration: z.boolean(),
        configurations: z.array(updateConfigurationSchema),
    })
    .superRefine((values, context) => {
        if (values.referralAction === "SET" && !values.partnerizeCamref.trim()) {
            context.addIssue({
                code: "custom",
                path: ["partnerizeCamref"],
                message: "adminListingSources.validation.camrefRequired",
            });
        }
        if (values.replaceIngestionConfiguration) {
            values.configurations.forEach((configuration, index) => {
                if (configuration.ingestionMethod === "SHOPIFY" && !configuration.domain.trim()) {
                    context.addIssue({
                        code: "custom",
                        path: ["configurations", index, "domain"],
                        message: "adminListingSources.validation.shopifyDomainRequired",
                    });
                }
                addCurrencyIssues(configuration, configuration.ingestionMethod, index, context);
            });
        }
    });

type CreateFormValues = z.input<typeof createFormSchema>;
type CreateFormData = z.output<typeof createFormSchema>;
type UpdateFormValues = z.infer<typeof updateFormSchema>;

type ConfigurationErrors = {
    readonly domain?: { readonly message?: string };
    readonly webhookSecret?: { readonly message?: string };
    readonly fallbackCurrency?: { readonly message?: string };
    readonly currency?: { readonly message?: string };
};

/** A dialog option card on the raised ground; the checked card gets the oxblood ring. */
const OPTION_CARD_CLASS =
    "flex cursor-pointer items-start gap-2.5 rounded-md bg-surface px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--line)] has-checked:bg-surface-raised has-checked:shadow-[inset_0_0_0_1.5px_var(--oxblood)] has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-brass";

/**
 * Creates or edits a listing source (board "Admin · Listing source form"): four numbered groups —
 * source, operator, presentation and referral, ingestion — and a footer that stays in view.
 */
export function AdminListingSourceFormDialog({
    source,
    referralConfiguration,
    open,
    onOpenChange,
    onCreated,
    onUpdated,
}: {
    readonly source?: AdminListingSourceDetail;
    readonly referralConfiguration?: ReferralConfigurationData | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onCreated: (listingSourceId: string) => void;
    readonly onUpdated: (listingSourceId: string) => void;
}) {
    const { t } = useTranslation();
    const create = useCreateAdminListingSource();
    const update = useUpdateAdminListingSource();
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            create.reset();
            update.reset();
        }
        onOpenChange(nextOpen);
    };

    return (
        <AdminRecordDialog
            open={open}
            onOpenChange={handleOpenChange}
            width="lg"
            title={
                source
                    ? t("adminListingSources.form.editNamed", { name: source.name })
                    : t("adminListingSources.form.newTitle")
            }
        >
            {source ? (
                <UpdateListingSourceForm
                    key={`${source.listingSourceId}:${source.updated.toISOString()}`}
                    source={source}
                    referralConfiguration={referralConfiguration}
                    onOpenChange={handleOpenChange}
                    onUpdated={onUpdated}
                    mutation={update}
                />
            ) : (
                <CreateListingSourceForm
                    key="create"
                    onOpenChange={handleOpenChange}
                    onCreated={onCreated}
                    mutation={create}
                />
            )}
        </AdminRecordDialog>
    );
}

function CreateListingSourceForm({
    onOpenChange,
    onCreated,
    mutation,
}: {
    readonly onOpenChange: (open: boolean) => void;
    readonly onCreated: (listingSourceId: string) => void;
    readonly mutation: ReturnType<typeof useCreateAdminListingSource>;
}) {
    const { t } = useTranslation();
    const form = useForm<CreateFormValues, unknown, CreateFormData>({
        resolver: zodResolver(createFormSchema),
        defaultValues: {
            name: "",
            listingSourceType: "",
            operatorType: "EXISTING",
            operatorPartyId: "",
            operatorName: "",
            operatorPhone: "",
            operatorEmail: "",
            platformTechnology: "",
            configurations: [],
            url: "",
            image: "",
            partnerizeCamref: "",
        },
    });
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "configurations",
    });
    const operatorType = useController({ control: form.control, name: "operatorType" }).field;
    const errors = form.formState.errors;
    const [requestError, setRequestError] = useState<string>();
    const addedMethods = form.watch("configurations").map((configuration) => configuration.type);

    const clearSecrets = (values: CreateFormData) =>
        form.setValue(
            "configurations",
            values.configurations.map((configuration) => ({ ...configuration, webhookSecret: "" })),
        );

    const submit = (values: CreateFormData) => {
        mutation.reset();
        setRequestError(undefined);
        mutation.mutate(values as AdminListingSourceCreateValues, {
            onSuccess: (reference) => {
                clearSecrets(values);
                toast.success(t("adminListingSources.success.created"));
                onOpenChange(false);
                onCreated(reference.listingSourceId);
            },
            onError: (error) => {
                setRequestError(error.message);
                clearSecrets(values);
                mutation.reset();
            },
        });
    };

    return (
        <form noValidate onSubmit={form.handleSubmit(submit)} className="-mt-6 flex flex-col">
            <FormGroup number={1} legend={t("adminListingSources.form.legends.source")}>
                <TextField
                    label={t("adminListingSources.fields.name")}
                    registration={form.register("name")}
                    error={errors.name?.message}
                />
                <SourceTypeField
                    registration={form.register("listingSourceType")}
                    error={errors.listingSourceType?.message}
                />
                <PlatformTechnologyField
                    registration={form.register("platformTechnology")}
                    error={errors.platformTechnology?.message}
                />
            </FormGroup>

            <FormGroup number={2} legend={t("adminListingSources.form.legends.operator")}>
                <div
                    role="radiogroup"
                    aria-label={t("adminListingSources.fields.operator")}
                    className="inline-flex self-start rounded-pill bg-surface-sunken p-1"
                >
                    {(["EXISTING", "NEW"] as const).map((value) => (
                        <label
                            key={value}
                            className="inline-flex min-h-9 cursor-pointer items-center rounded-pill px-3.5 text-meta text-ink-secondary has-checked:bg-surface-raised has-checked:font-medium has-checked:text-ink has-checked:shadow-ring has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brass"
                        >
                            <input
                                type="radio"
                                name="admin-listing-source-operator-type"
                                value={value}
                                checked={operatorType.value === value}
                                onChange={() => {
                                    operatorType.onChange(value);
                                    form.setValue("operatorPartyId", "");
                                }}
                                className="sr-only"
                            />
                            {t(
                                value === "EXISTING"
                                    ? "adminListingSources.operator.existingShort"
                                    : "adminListingSources.operator.newShort",
                            )}
                        </label>
                    ))}
                </div>
                {operatorType.value === "EXISTING" ? (
                    <div className="flex flex-col gap-2">
                        <AdminPartyPicker
                            onSelect={(identity) =>
                                form.setValue("operatorPartyId", identity?.partyId ?? "", {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                })
                            }
                        />
                        {errors.operatorPartyId?.message && (
                            <p role="alert" className={FIELD_ERROR_CLASS}>
                                {t(errors.operatorPartyId.message)}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
                        <TextField
                            className="sm:col-span-2"
                            label={t("adminListingSources.fields.operatorName")}
                            registration={form.register("operatorName")}
                            error={errors.operatorName?.message}
                            autoComplete="organization"
                        />
                        <TextField
                            label={t("adminListingSources.fields.phone")}
                            registration={form.register("operatorPhone")}
                            type="tel"
                            autoComplete="tel"
                        />
                        <TextField
                            label={t("adminListingSources.fields.email")}
                            registration={form.register("operatorEmail")}
                            error={errors.operatorEmail?.message}
                            type="email"
                            autoComplete="email"
                        />
                    </div>
                )}
            </FormGroup>

            <FormGroup number={3} legend={t("adminListingSources.form.legends.presentation")}>
                <PresentationFields
                    url={form.register("url")}
                    image={form.register("image")}
                    urlError={errors.url?.message}
                    imageError={errors.image?.message}
                />
                <TextField
                    label={t("adminListingSources.fields.camref")}
                    registration={form.register("partnerizeCamref")}
                    mono
                />
            </FormGroup>

            <FormGroup number={4} legend={t("adminListingSources.form.legends.ingestion")} last>
                {errors.configurations?.message && (
                    <p role="alert" className={FIELD_ERROR_CLASS}>
                        {t(errors.configurations.message)}
                    </p>
                )}
                {fields.map((field, index) => (
                    <MethodCard key={field.id} method={field.type} onRemove={() => remove(index)}>
                        <ConfigurationFields
                            method={field.type}
                            mode="create"
                            fieldNames={configurationFieldNames(index)}
                            register={(name) =>
                                form.register(name as `configurations.${number}.domain`)
                            }
                            errors={errors.configurations?.[index]}
                        />
                    </MethodCard>
                ))}
                <AddMethodMenu
                    available={ADMIN_LISTING_SOURCE_INGESTION_METHODS.filter(
                        (method) => !addedMethods.includes(method),
                    )}
                    onAdd={(method) => append(createDefaultConfiguration(method))}
                />
            </FormGroup>

            <FormFooter
                requestError={requestError}
                pending={mutation.isPending}
                submitLabel={t("adminListingSources.actions.create")}
                onCancel={() => onOpenChange(false)}
            />
        </form>
    );
}

function UpdateListingSourceForm({
    source,
    referralConfiguration,
    onOpenChange,
    onUpdated,
    mutation,
}: {
    readonly source: AdminListingSourceDetail;
    readonly referralConfiguration?: ReferralConfigurationData | null;
    readonly onOpenChange: (open: boolean) => void;
    readonly onUpdated: (listingSourceId: string) => void;
    readonly mutation: ReturnType<typeof useUpdateAdminListingSource>;
}) {
    const { t } = useTranslation();
    const initialCamref =
        referralConfiguration?.type === "PARTNERIZE" ? referralConfiguration.camref : "";
    const form = useForm<UpdateFormValues>({
        resolver: zodResolver(updateFormSchema),
        defaultValues: {
            name: source.name,
            listingSourceType: source.listingSourceType,
            platformTechnology: source.platformTechnology ?? "",
            url: source.presentation.url ?? "",
            image: source.presentation.image ?? "",
            referralAction: "KEEP",
            partnerizeCamref: initialCamref,
            replaceIngestionConfiguration: false,
            configurations: defaultUpdateConfigurations(source.ingestionMethods),
        },
    });
    const { fields } = useFieldArray({ control: form.control, name: "configurations" });
    const referralAction = useController({ control: form.control, name: "referralAction" }).field;
    const errors = form.formState.errors;
    const [requestError, setRequestError] = useState<string>();

    const submit = (values: UpdateFormValues) => {
        const typedValues = values as AdminListingSourceUpdateValues;
        mutation.reset();
        setRequestError(undefined);
        const clearSecrets = () =>
            form.setValue(
                "configurations",
                values.configurations.map((configuration) => ({
                    ...configuration,
                    webhookSecret: "",
                })),
            );
        mutation.mutate(
            { source, values: typedValues },
            {
                onSuccess: (reference) => {
                    clearSecrets();
                    toast.success(t("adminListingSources.success.updated"));
                    onOpenChange(false);
                    onUpdated(reference.listingSourceId);
                },
                onError: (error) => {
                    clearSecrets();
                    mutation.reset();
                    if (error instanceof AdminListingSourceRequestError && error.status === 409) {
                        toast.error(error.message);
                        onOpenChange(false);
                        onUpdated(source.listingSourceId);
                        return;
                    }
                    setRequestError(error.message);
                },
            },
        );
    };

    return (
        <form noValidate onSubmit={form.handleSubmit(submit)} className="-mt-6 flex flex-col">
            <FormGroup number={1} legend={t("adminListingSources.form.legends.source")}>
                <TextField
                    label={t("adminListingSources.fields.name")}
                    registration={form.register("name")}
                    error={errors.name?.message}
                />
                <SourceTypeField
                    registration={form.register("listingSourceType")}
                    error={errors.listingSourceType?.message}
                />
                <PlatformTechnologyField
                    registration={form.register("platformTechnology")}
                    error={errors.platformTechnology?.message}
                />
            </FormGroup>

            <FormGroup number={2} legend={t("adminListingSources.form.legends.operator")}>
                <p className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface-sunken px-3.5 py-3 text-sm">
                    <span className="break-words">{source.operator.name}</span>
                    <span className={MONO_LABEL_CLASS}>{t("adminListingSources.form.fixed")}</span>
                </p>
            </FormGroup>

            <FormGroup number={3} legend={t("adminListingSources.form.legends.presentation")}>
                <PresentationFields
                    url={form.register("url")}
                    image={form.register("image")}
                    urlError={errors.url?.message}
                    imageError={errors.image?.message}
                />
                <ReferralField
                    value={referralAction.value}
                    onChange={(value) => referralAction.onChange(value)}
                />
                {referralAction.value === "SET" && (
                    <TextField
                        label={t("adminListingSources.fields.camref")}
                        registration={form.register("partnerizeCamref")}
                        error={errors.partnerizeCamref?.message}
                        mono
                    />
                )}
            </FormGroup>

            <FormGroup number={4} legend={t("adminListingSources.form.legends.ingestion")} last>
                <ReplaceSwitch control={form.control} />
                {form.watch("replaceIngestionConfiguration") &&
                    fields.map((field, index) => (
                        <MethodCard key={field.id} method={field.ingestionMethod}>
                            <ConfigurationFields
                                method={field.ingestionMethod}
                                mode="update"
                                fieldNames={configurationFieldNames(index)}
                                register={(name) =>
                                    form.register(name as `configurations.${number}.domain`)
                                }
                                errors={errors.configurations?.[index]}
                            />
                        </MethodCard>
                    ))}
            </FormGroup>

            <FormFooter
                slug={source.listingSourceSlugId}
                requestError={requestError}
                pending={mutation.isPending}
                submitLabel={t("adminListingSources.actions.save")}
                onCancel={() => onOpenChange(false)}
            />
        </form>
    );
}

// ─── Groups and fields ──────────────────────────────────────────────────────

function FormGroup({
    number,
    legend,
    last = false,
    children,
}: {
    readonly number: number;
    readonly legend: string;
    readonly last?: boolean;
    readonly children: ReactNode;
}) {
    return (
        <fieldset className={cn("min-w-0 py-6", !last && "border-b border-line-subtle")}>
            <legend className={cn(ADMIN_LEGEND_CLASS, "float-left")}>
                {String(number).padStart(2, "0")} · {legend}
            </legend>
            <div className="clear-left flex flex-col gap-4">{children}</div>
        </fieldset>
    );
}

function TextField({
    label,
    registration,
    error,
    type = "text",
    mono = false,
    raised = false,
    placeholder,
    autoComplete,
    list,
    maxLength,
    className,
}: {
    readonly label: string;
    readonly registration: UseFormRegisterReturn;
    /** A translation key. */
    readonly error?: string;
    readonly type?: "text" | "email" | "tel" | "url" | "password";
    readonly mono?: boolean;
    readonly raised?: boolean;
    readonly placeholder?: string;
    readonly autoComplete?: string;
    readonly list?: string;
    readonly maxLength?: number;
    readonly className?: string;
}) {
    const { t } = useTranslation();
    const id = useId();
    const errorId = `${id}-error`;
    return (
        <div className={cn("flex min-w-0 flex-col gap-2", className)}>
            <label
                htmlFor={id}
                className={FIELD_LABEL_CLASS}
                data-error={error ? "true" : undefined}
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete ?? "off"}
                list={list}
                maxLength={maxLength}
                spellCheck={mono ? false : undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                {...registration}
                className={cn(
                    FIELD_CLASS,
                    raised && "bg-surface-raised",
                    mono && "font-mono text-sm",
                )}
            />
            {error && (
                <p id={errorId} className={FIELD_ERROR_CLASS}>
                    {t(error)}
                </p>
            )}
        </div>
    );
}

function SourceTypeField({
    registration,
    error,
}: {
    readonly registration: UseFormRegisterReturn;
    readonly error?: string;
}) {
    const { t } = useTranslation();
    const labelId = useId();
    const errorId = `${labelId}-error`;
    return (
        <div className="flex flex-col gap-2">
            <span
                id={labelId}
                className={FIELD_LABEL_CLASS}
                data-error={error ? "true" : undefined}
            >
                {t("adminListingSources.fields.listingSourceType")}
            </span>
            <div
                role="radiogroup"
                aria-labelledby={labelId}
                aria-required="true"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
                {LISTING_SOURCE_TYPES.map((type) => (
                    <label key={type} className={OPTION_CARD_CLASS}>
                        <input
                            type="radio"
                            value={type}
                            {...registration}
                            className="mt-0.5 size-[17px] shrink-0 accent-oxblood"
                        />
                        <span className="text-sm font-medium">
                            {t(`listingSourceTypes.${type}`)}
                        </span>
                    </label>
                ))}
            </div>
            {error && (
                <p id={errorId} className={FIELD_ERROR_CLASS}>
                    {t(error)}
                </p>
            )}
        </div>
    );
}

function PlatformTechnologyField({
    registration,
    error,
}: {
    readonly registration: UseFormRegisterReturn;
    readonly error?: string;
}) {
    const { t } = useTranslation();
    const listId = useId();
    return (
        <>
            <TextField
                label={t("adminListingSources.fields.platformTechnology")}
                registration={registration}
                error={error}
                list={listId}
                mono
            />
            <datalist id={listId}>
                {ADMIN_LISTING_SOURCE_PLATFORM_SUGGESTIONS.map((code) => (
                    <option key={code} value={code} />
                ))}
            </datalist>
        </>
    );
}

function PresentationFields({
    url,
    image,
    urlError,
    imageError,
}: {
    readonly url: UseFormRegisterReturn;
    readonly image: UseFormRegisterReturn;
    readonly urlError?: string;
    readonly imageError?: string;
}) {
    const { t } = useTranslation();
    return (
        <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <TextField
                label={t("adminListingSources.fields.website")}
                registration={url}
                error={urlError}
                type="url"
                placeholder="https://"
            />
            <TextField
                label={t("adminListingSources.fields.imageUrl")}
                registration={image}
                error={imageError}
                type="url"
                placeholder="https://"
            />
        </div>
    );
}

function ReferralField({
    value,
    onChange,
}: {
    readonly value: UpdateFormValues["referralAction"];
    readonly onChange: (value: UpdateFormValues["referralAction"]) => void;
}) {
    const { t } = useTranslation();
    const id = useId();
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={id} className={FIELD_LABEL_CLASS}>
                {t("adminListingSources.fields.referral")}
            </label>
            <AdminSelect
                id={id}
                value={value}
                onChange={(next) => onChange(next as UpdateFormValues["referralAction"])}
                options={[
                    { value: "KEEP", label: t("adminListingSources.referral.keepCurrent") },
                    { value: "SET", label: t("adminListingSources.referral.set") },
                    { value: "CLEAR", label: t("adminListingSources.referral.clear") },
                ]}
            />
        </div>
    );
}

/** The design-system switch: a 34×20 track inside a 44px hit area, oxblood while on. */
function ReplaceSwitch({ control }: { readonly control: Control<UpdateFormValues> }) {
    const { t } = useTranslation();
    const field = useController({ control, name: "replaceIngestionConfiguration" }).field;
    const labelId = useId();
    const hintId = useId();
    const on = field.value;
    return (
        <div className="flex items-start gap-3.5 rounded-md bg-surface px-4 py-3.5 shadow-ring">
            <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-labelledby={labelId}
                aria-describedby={hintId}
                onClick={() => field.onChange(!on)}
                className={cn(
                    "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-pill",
                    FOCUS_CLASS,
                )}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        "relative block h-5 w-[34px] rounded-pill transition-colors motion-reduce:transition-none",
                        on
                            ? "bg-oxblood"
                            : "bg-surface-sunken shadow-[inset_0_0_0_1px_var(--line-strong)]",
                    )}
                >
                    <span
                        className={cn(
                            "absolute top-[3px] size-3.5 rounded-pill transition-[left] motion-reduce:transition-none",
                            on ? "left-[17px] bg-on-oxblood" : "left-[3px] bg-ink-muted",
                        )}
                    />
                </span>
            </button>
            <span className="flex flex-col gap-1 pt-2.5">
                <span id={labelId} className="text-sm font-medium">
                    {t("adminListingSources.form.replaceConfiguration")}
                </span>
                <span id={hintId} className="text-xs leading-normal text-ink-secondary">
                    {t("adminListingSources.form.replaceWarning")}
                </span>
            </span>
        </div>
    );
}

function MethodCard({
    method,
    onRemove,
    children,
}: {
    readonly method: ListingIngestionMethodData;
    readonly onRemove?: () => void;
    readonly children: ReactNode;
}) {
    const { t } = useTranslation();
    const name = t(`adminListingSources.methods.${method}`);
    return (
        <section
            aria-label={name}
            className="flex flex-col gap-3.5 rounded-md bg-surface p-[18px] shadow-ring"
        >
            <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold">{name}</h4>
                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label={t("adminListingSources.form.removeMethod", { method: name })}
                        className={cn(
                            "min-h-9 cursor-pointer px-2.5 text-meta font-medium underline underline-offset-3",
                            FOCUS_CLASS,
                        )}
                    >
                        {t("adminListingSources.actions.removeMethod")}
                    </button>
                )}
            </div>
            {children}
        </section>
    );
}

type ConfigurationFieldName =
    | "fallbackCurrency"
    | "domain"
    | "currency"
    | "language"
    | "webhookSecret";

function configurationFieldNames(index: number) {
    return (name: ConfigurationFieldName) => `configurations.${index}.${name}` as const;
}

function ConfigurationFields({
    method,
    mode,
    fieldNames,
    register,
    errors,
}: {
    readonly method: ListingIngestionMethodData;
    readonly mode: "create" | "update";
    readonly fieldNames: (name: ConfigurationFieldName) => string;
    readonly register: (name: string) => UseFormRegisterReturn;
    readonly errors?: ConfigurationErrors;
}) {
    const { t } = useTranslation();
    const field = (name: ConfigurationFieldName) => register(fieldNames(name));
    const currency = (
        <TextField
            label={t("adminListingSources.fields.currency")}
            registration={field("currency")}
            error={errors?.currency?.message}
            maxLength={3}
            raised
            mono
        />
    );
    const language = (
        <TextField
            label={t("adminListingSources.fields.language")}
            registration={field("language")}
            raised
            mono
        />
    );

    if (method === "WEB_CRAWL") {
        return (
            <TextField
                label={t("adminListingSources.fields.fallbackCurrency")}
                registration={field("fallbackCurrency")}
                error={errors?.fallbackCurrency?.message}
                maxLength={3}
                raised
                mono
            />
        );
    }
    if (method === "SHOPIFY") {
        return (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <TextField
                    label={t("adminListingSources.fields.domain")}
                    registration={field("domain")}
                    error={errors?.domain?.message}
                    raised
                    mono
                />
                {currency}
                {language}
            </div>
        );
    }
    if (method === "WOOCOMMERCE") {
        return (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <TextField
                    label={t("adminListingSources.fields.secret")}
                    registration={field("webhookSecret")}
                    error={errors?.webhookSecret?.message}
                    type="password"
                    autoComplete="new-password"
                    placeholder={
                        mode === "update"
                            ? t("adminListingSources.form.secretPlaceholder")
                            : undefined
                    }
                    raised
                />
                {currency}
                {language}
            </div>
        );
    }
    return (
        <p className="text-meta text-ink-secondary">
            {t("adminListingSources.form.partnerApiConfiguration")}
        </p>
    );
}

function AddMethodMenu({
    available,
    onAdd,
}: {
    readonly available: readonly ListingIngestionMethodData[];
    readonly onAdd: (method: ListingIngestionMethodData) => void;
}) {
    const { t } = useTranslation();
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger
                disabled={available.length === 0}
                className={cn(SMALL_SECONDARY_PILL_CLASS, "self-start pl-3")}
            >
                <Plus aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                {t("adminListingSources.actions.addMethod")}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="min-w-52 rounded-lg border-0 bg-surface-raised p-1.5 text-ink shadow-menu"
            >
                {available.map((method) => (
                    <DropdownMenuItem
                        key={method}
                        onSelect={() => onAdd(method)}
                        className="min-h-10 cursor-pointer rounded-md text-sm focus:bg-surface-sunken data-highlighted:bg-surface-sunken"
                    >
                        {t(`adminListingSources.methods.${method}`)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function FormFooter({
    slug,
    requestError,
    pending,
    submitLabel,
    onCancel,
}: {
    readonly slug?: string;
    readonly requestError?: string;
    readonly pending: boolean;
    readonly submitLabel: string;
    readonly onCancel: () => void;
}) {
    const { t } = useTranslation();
    return (
        <div className="sticky bottom-0 -mx-5 -mb-7 flex flex-col gap-3 border-t border-line bg-surface-raised px-5 py-[18px] sm:-mx-7 sm:px-7">
            {requestError && (
                <p role="alert" className={INLINE_ALERT_CLASS}>
                    <TriangleAlert
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-oxblood"
                        strokeWidth={2}
                    />
                    {requestError}
                </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[10px] tracking-[0.12em] break-all text-ink-muted uppercase">
                    {slug ? t("adminListingSources.form.slug", { slug }) : null}
                </span>
                <div className="flex flex-wrap gap-2.5">
                    <button type="button" onClick={onCancel} className={SECONDARY_PILL_CLASS}>
                        {t("adminCommon.cancel")}
                    </button>
                    <button
                        type="submit"
                        disabled={pending}
                        aria-busy={pending}
                        className={PRIMARY_PILL_CLASS}
                    >
                        {pending ? t("adminCommon.saving") : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
