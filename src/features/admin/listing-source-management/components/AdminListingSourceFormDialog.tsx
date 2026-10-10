import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useController, type UseFormRegister } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { ListingIngestionMethodData, ReferralConfigurationData } from "@/client";
import { AdminPartyPicker } from "@/features/admin/party-management/components/AdminPartyPicker.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { toSupportedCurrency } from "@/data/internal/common/Currency.ts";
import {
    ADMIN_LISTING_SOURCE_INGESTION_METHODS,
    type AdminListingSourceCreateValues,
    type AdminListingSourceDetail,
    type AdminListingSourceUpdateValues,
    createDefaultConfiguration,
    defaultUpdateConfigurations,
} from "@/data/internal/listing-source/AdminListingSource.ts";
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

const configurationFieldsSchema = z.object({
    type: z.enum(["UNCONFIGURED", "WEB_CRAWL", "SHOPIFY", "WOOCOMMERCE", "PARTNER_API"]),
    ingestionMethod: z.enum(ADMIN_LISTING_SOURCE_INGESTION_METHODS),
    fallbackCurrency: z.string(),
    domain: z.string(),
    currency: z.string(),
    language: z.string(),
    webhookSecret: z.string(),
});

const createFormSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "adminListingSources.validation.nameRequired")
            .refine(fitsName, {
                message: "adminListingSources.validation.nameTooLong",
            }),
        operatorType: z.enum(["EXISTING", "NEW"]),
        operatorPartyId: z.string(),
        operatorName: z.string(),
        operatorPhone: z.string(),
        operatorEmail: z
            .string()
            .trim()
            .pipe(z.union([z.literal(""), z.email("adminListingSources.validation.invalidEmail")])),
        configurations: z
            .array(configurationFieldsSchema)
            .min(1, "adminListingSources.validation.configurationRequired"),
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
        const methods = values.configurations.map((configuration) =>
            configuration.type === "UNCONFIGURED"
                ? configuration.ingestionMethod
                : configuration.type,
        );
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
        name: z
            .string()
            .trim()
            .min(1, "adminListingSources.validation.nameRequired")
            .refine(fitsName, {
                message: "adminListingSources.validation.nameTooLong",
            }),
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

type CreateFormValues = z.infer<typeof createFormSchema>;
type UpdateFormValues = z.infer<typeof updateFormSchema>;

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
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            create.reset();
            update.reset();
        }
        onOpenChange(nextOpen);
    };
    const create = useCreateAdminListingSource();
    const update = useUpdateAdminListingSource();

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
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
            </DialogContent>
        </Dialog>
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
    const form = useForm<CreateFormValues>({
        resolver: zodResolver(createFormSchema),
        defaultValues: {
            name: "",
            operatorType: "EXISTING",
            operatorPartyId: "",
            operatorName: "",
            operatorPhone: "",
            operatorEmail: "",
            configurations: [createDefaultConfiguration()],
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
    const configurationError = form.formState.errors.configurations?.message;
    const [requestError, setRequestError] = useState<string>();

    const submit = (values: CreateFormValues) => {
        mutation.reset();
        setRequestError(undefined);
        mutation.mutate(values as AdminListingSourceCreateValues, {
            onSuccess: (reference) => {
                form.setValue(
                    "configurations",
                    values.configurations.map((configuration) => ({
                        ...configuration,
                        webhookSecret: "",
                    })),
                );
                toast.success(t("adminListingSources.success.created"));
                onOpenChange(false);
                onCreated(reference.listingSourceId);
            },
            onError: (error) => {
                setRequestError(error.message);
                form.setValue(
                    "configurations",
                    values.configurations.map((configuration) => ({
                        ...configuration,
                        webhookSecret: "",
                    })),
                );
                mutation.reset();
            },
        });
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>{t("adminListingSources.form.createTitle")}</DialogTitle>
                <DialogDescription>
                    {t("adminListingSources.form.createDescription")}
                </DialogDescription>
            </DialogHeader>
            <form noValidate onSubmit={form.handleSubmit(submit)} className="grid gap-5">
                <FormField
                    id="admin-listing-source-name"
                    label={t("adminListingSources.fields.name")}
                    error={form.formState.errors.name?.message}
                >
                    <Input id="admin-listing-source-name" {...form.register("name")} />
                </FormField>
                <div className="grid gap-3">
                    <Label htmlFor="admin-listing-source-operator-type">
                        {t("adminListingSources.fields.operator")}
                    </Label>
                    <Select
                        value={operatorType.value}
                        onValueChange={(value) => {
                            operatorType.onChange(value);
                            form.setValue("operatorPartyId", "");
                        }}
                    >
                        <SelectTrigger id="admin-listing-source-operator-type">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EXISTING">
                                {t("adminListingSources.operator.existing")}
                            </SelectItem>
                            <SelectItem value="NEW">
                                {t("adminListingSources.operator.new")}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {operatorType.value === "EXISTING" ? (
                        <>
                            <AdminPartyPicker
                                onSelect={(identity) =>
                                    form.setValue("operatorPartyId", identity?.partyId ?? "", {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                    })
                                }
                            />
                            {form.formState.errors.operatorPartyId?.message && (
                                <p role="alert" className="text-sm text-destructive">
                                    {t(form.formState.errors.operatorPartyId.message)}
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                id="admin-listing-source-operator-name"
                                label={t("adminListingSources.fields.operatorName")}
                                error={form.formState.errors.operatorName?.message}
                            >
                                <Input
                                    id="admin-listing-source-operator-name"
                                    autoComplete="organization"
                                    {...form.register("operatorName")}
                                />
                            </FormField>
                            <FormField
                                id="admin-listing-source-operator-phone"
                                label={t("adminListingSources.fields.phone")}
                            >
                                <Input
                                    id="admin-listing-source-operator-phone"
                                    type="tel"
                                    autoComplete="tel"
                                    {...form.register("operatorPhone")}
                                />
                            </FormField>
                            <FormField
                                id="admin-listing-source-operator-email"
                                label={t("adminListingSources.fields.email")}
                                error={form.formState.errors.operatorEmail?.message}
                            >
                                <Input
                                    id="admin-listing-source-operator-email"
                                    type="email"
                                    autoComplete="email"
                                    {...form.register("operatorEmail")}
                                />
                            </FormField>
                        </div>
                    )}
                </div>
                <section className="grid gap-3" aria-labelledby="admin-source-configurations-title">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 id="admin-source-configurations-title" className="font-medium">
                            {t("adminListingSources.fields.ingestionConfiguration")}
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append(createDefaultConfiguration())}
                        >
                            {t("adminListingSources.actions.addMethod")}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t("adminListingSources.form.configurationDescription")}
                    </p>
                    {configurationError && (
                        <p role="alert" className="text-sm text-destructive">
                            {t(configurationError)}
                        </p>
                    )}
                    {fields.map((field, index) => (
                        <CreateConfigurationEditor
                            key={field.id}
                            index={index}
                            register={form.register}
                            control={form.control}
                            errors={form.formState.errors.configurations?.[index]}
                            canRemove={fields.length > 1}
                            onRemove={() => remove(index)}
                        />
                    ))}
                </section>
                <PresentationFields register={form.register} errors={form.formState.errors} />
                <FormField
                    id="admin-listing-source-camref"
                    label={t("adminListingSources.fields.partnerizeCamref")}
                >
                    <Input
                        id="admin-listing-source-camref"
                        {...form.register("partnerizeCamref")}
                    />
                    <p className="text-xs text-muted-foreground">
                        {t("adminListingSources.form.referralDescription")}
                    </p>
                </FormField>
                {requestError && (
                    <p role="alert" className="text-sm text-destructive">
                        {requestError}
                    </p>
                )}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {t("adminListingSources.actions.cancel")}
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending
                            ? t("adminListingSources.actions.saving")
                            : t("adminListingSources.actions.create")}
                    </Button>
                </DialogFooter>
            </form>
        </>
    );
}

function CreateConfigurationEditor({
    index,
    register,
    control,
    errors,
    canRemove,
    onRemove,
}: {
    readonly index: number;
    readonly register: UseFormRegister<CreateFormValues>;
    readonly control: ReturnType<typeof useForm<CreateFormValues>>["control"];
    readonly errors?: {
        readonly domain?: { readonly message?: string };
        readonly webhookSecret?: { readonly message?: string };
        readonly fallbackCurrency?: { readonly message?: string };
        readonly currency?: { readonly message?: string };
    };
    readonly canRemove: boolean;
    readonly onRemove: () => void;
}) {
    const { t } = useTranslation();
    const base = `configurations.${index}` as const;
    const typeField = useController({ control, name: `${base}.type` }).field;
    const methodField = useController({ control, name: `${base}.ingestionMethod` }).field;
    const type = typeField.value;

    return (
        <div className="grid gap-4 border bg-surface-container-low p-4">
            <div className="flex flex-wrap items-end gap-3">
                <div className="grid min-w-56 flex-1 gap-2">
                    <Label htmlFor={`admin-source-${index}-configuration-type`}>
                        {t("adminListingSources.fields.configurationType")}
                    </Label>
                    <Select value={type} onValueChange={(value) => typeField.onChange(value)}>
                        <SelectTrigger id={`admin-source-${index}-configuration-type`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[
                                "UNCONFIGURED",
                                "WEB_CRAWL",
                                "SHOPIFY",
                                "WOOCOMMERCE",
                                "PARTNER_API",
                            ].map((item) => (
                                <SelectItem key={item} value={item}>
                                    {t(`adminListingSources.configurationTypes.${item}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {type === "UNCONFIGURED" && (
                    <div className="grid min-w-56 flex-1 gap-2">
                        <Label htmlFor={`admin-source-${index}-ingestion-method`}>
                            {t("adminListingSources.fields.ingestionMethod")}
                        </Label>
                        <Select value={methodField.value} onValueChange={methodField.onChange}>
                            <SelectTrigger id={`admin-source-${index}-ingestion-method`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ADMIN_LISTING_SOURCE_INGESTION_METHODS.map((method) => (
                                    <SelectItem key={method} value={method}>
                                        {t(`adminListingSources.methods.${method}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                {canRemove && (
                    <Button type="button" variant="outline" onClick={onRemove}>
                        {t("adminListingSources.actions.removeMethod")}
                    </Button>
                )}
            </div>
            {type === "WEB_CRAWL" && (
                <FormField
                    id={`admin-source-${index}-fallback-currency`}
                    label={t("adminListingSources.fields.fallbackCurrency")}
                    error={errors?.fallbackCurrency?.message}
                >
                    <Input
                        id={`admin-source-${index}-fallback-currency`}
                        maxLength={3}
                        aria-invalid={Boolean(errors?.fallbackCurrency?.message)}
                        {...register(`${base}.fallbackCurrency`)}
                    />
                </FormField>
            )}
            {type === "SHOPIFY" && (
                <div className="grid gap-4 sm:grid-cols-3">
                    <ConfigurationTextField
                        id={`admin-source-${index}-domain`}
                        label={t("adminListingSources.fields.domain")}
                        name={`${base}.domain`}
                        register={register}
                        error={errors?.domain?.message}
                    />
                    <ConfigurationTextField
                        id={`admin-source-${index}-currency`}
                        label={t("adminListingSources.fields.currency")}
                        name={`${base}.currency`}
                        register={register}
                        error={errors?.currency?.message}
                    />
                    <ConfigurationTextField
                        id={`admin-source-${index}-language`}
                        label={t("adminListingSources.fields.language")}
                        name={`${base}.language`}
                        register={register}
                    />
                </div>
            )}
            {type === "WOOCOMMERCE" && (
                <div className="grid gap-4 sm:grid-cols-3">
                    <ConfigurationTextField
                        id={`admin-source-${index}-secret`}
                        label={t("adminListingSources.fields.webhookSecret")}
                        name={`${base}.webhookSecret`}
                        register={register}
                        type="password"
                        error={errors?.webhookSecret?.message}
                        autoComplete="new-password"
                    />
                    <ConfigurationTextField
                        id={`admin-source-${index}-currency`}
                        label={t("adminListingSources.fields.currency")}
                        name={`${base}.currency`}
                        register={register}
                        error={errors?.currency?.message}
                    />
                    <ConfigurationTextField
                        id={`admin-source-${index}-language`}
                        label={t("adminListingSources.fields.language")}
                        name={`${base}.language`}
                        register={register}
                    />
                </div>
            )}
            {errors?.domain?.message && (
                <p role="alert" className="text-sm text-destructive">
                    {t(errors.domain.message)}
                </p>
            )}
            {errors?.webhookSecret?.message && (
                <p role="alert" className="text-sm text-destructive">
                    {t(errors.webhookSecret.message)}
                </p>
            )}
        </div>
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
    const replaceConfiguration = useController({
        control: form.control,
        name: "replaceIngestionConfiguration",
    }).field;
    const [requestError, setRequestError] = useState<string>();

    const submit = (values: UpdateFormValues) => {
        const typedValues = values as AdminListingSourceUpdateValues;
        mutation.reset();
        setRequestError(undefined);
        mutation.mutate(
            { source, values: typedValues },
            {
                onSuccess: (reference) => {
                    form.setValue(
                        "configurations",
                        values.configurations.map((configuration) => ({
                            ...configuration,
                            webhookSecret: "",
                        })),
                    );
                    toast.success(t("adminListingSources.success.updated"));
                    onOpenChange(false);
                    onUpdated(reference.listingSourceId);
                },
                onError: (error) => {
                    form.setValue(
                        "configurations",
                        values.configurations.map((configuration) => ({
                            ...configuration,
                            webhookSecret: "",
                        })),
                    );
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
        <>
            <DialogHeader>
                <DialogTitle>{t("adminListingSources.form.editTitle")}</DialogTitle>
                <DialogDescription>
                    {t("adminListingSources.form.editDescription")}
                </DialogDescription>
            </DialogHeader>
            <form noValidate onSubmit={form.handleSubmit(submit)} className="grid gap-5">
                <FormField
                    id="admin-listing-source-name"
                    label={t("adminListingSources.fields.name")}
                    error={form.formState.errors.name?.message}
                >
                    <Input id="admin-listing-source-name" {...form.register("name")} />
                </FormField>
                <FormField
                    id="admin-listing-source-url"
                    label={t("adminListingSources.fields.url")}
                    error={form.formState.errors.url?.message}
                >
                    <Input id="admin-listing-source-url" type="url" {...form.register("url")} />
                </FormField>
                <FormField
                    id="admin-listing-source-image"
                    label={t("adminListingSources.fields.image")}
                    error={form.formState.errors.image?.message}
                >
                    <Input id="admin-listing-source-image" type="url" {...form.register("image")} />
                </FormField>
                <div className="grid gap-3">
                    <Label htmlFor="admin-listing-source-referral-action">
                        {t("adminListingSources.fields.referralConfiguration")}
                    </Label>
                    <Select value={referralAction.value} onValueChange={referralAction.onChange}>
                        <SelectTrigger id="admin-listing-source-referral-action">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="KEEP">
                                {t("adminListingSources.referral.keep")}
                            </SelectItem>
                            <SelectItem value="SET">
                                {t("adminListingSources.referral.set")}
                            </SelectItem>
                            <SelectItem value="CLEAR">
                                {t("adminListingSources.referral.clear")}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {referralAction.value === "SET" && (
                        <FormField
                            id="admin-listing-source-camref"
                            label={t("adminListingSources.fields.partnerizeCamref")}
                            error={form.formState.errors.partnerizeCamref?.message}
                        >
                            <Input
                                id="admin-listing-source-camref"
                                {...form.register("partnerizeCamref")}
                            />
                        </FormField>
                    )}
                </div>
                <section className="grid gap-3 border bg-surface-container-low p-4">
                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={replaceConfiguration.value}
                            onChange={replaceConfiguration.onChange}
                            className="mt-1 size-4 accent-primary"
                        />
                        <span className="grid gap-1">
                            <span className="font-medium">
                                {t("adminListingSources.form.replaceConfiguration")}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {t("adminListingSources.form.incompleteConfigurationNotice")}
                            </span>
                        </span>
                    </label>
                    {replaceConfiguration.value && (
                        <div className="grid gap-4">
                            {fields.map((field, index) => (
                                <UpdateConfigurationEditor
                                    key={field.id}
                                    index={index}
                                    method={source.ingestionMethods[index]}
                                    register={form.register}
                                    error={form.formState.errors.configurations?.[index]}
                                />
                            ))}
                        </div>
                    )}
                </section>
                <p className="break-all text-xs text-muted-foreground">
                    {t("adminListingSources.fields.immutableSlug")}:{" "}
                    <span className="font-mono">{source.listingSourceSlugId}</span>
                </p>
                {requestError && (
                    <p role="alert" className="text-sm text-destructive">
                        {requestError}
                    </p>
                )}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {t("adminListingSources.actions.cancel")}
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending
                            ? t("adminListingSources.actions.saving")
                            : t("adminListingSources.actions.save")}
                    </Button>
                </DialogFooter>
            </form>
        </>
    );
}

function UpdateConfigurationEditor({
    index,
    method,
    register,
    error,
}: {
    readonly index: number;
    readonly method: ListingIngestionMethodData | undefined;
    readonly register: UseFormRegister<UpdateFormValues>;
    readonly error?: {
        readonly domain?: { readonly message?: string };
        readonly webhookSecret?: { readonly message?: string };
        readonly fallbackCurrency?: { readonly message?: string };
        readonly currency?: { readonly message?: string };
    };
}) {
    const { t } = useTranslation();
    const prefix = `configurations.${index}` as const;
    if (!method) return null;

    return (
        <div className="grid gap-3 border bg-background p-4">
            <h4 className="font-medium">{t(`adminListingSources.methods.${method}`)}</h4>
            {method === "WEB_CRAWL" && (
                <FormField
                    id={`admin-source-update-${index}-fallback`}
                    label={t("adminListingSources.fields.fallbackCurrency")}
                    error={error?.fallbackCurrency?.message}
                >
                    <Input
                        id={`admin-source-update-${index}-fallback`}
                        maxLength={3}
                        aria-invalid={Boolean(error?.fallbackCurrency?.message)}
                        {...register(`${prefix}.fallbackCurrency`)}
                    />
                </FormField>
            )}
            {method === "SHOPIFY" && (
                <div className="grid gap-4 sm:grid-cols-3">
                    <ConfigurationTextField
                        id={`admin-source-update-${index}-domain`}
                        label={t("adminListingSources.fields.domain")}
                        name={`${prefix}.domain`}
                        register={register}
                        error={error?.domain?.message}
                    />
                    <ConfigurationTextField
                        id={`admin-source-update-${index}-currency`}
                        label={t("adminListingSources.fields.currency")}
                        name={`${prefix}.currency`}
                        register={register}
                        error={error?.currency?.message}
                    />
                    <ConfigurationTextField
                        id={`admin-source-update-${index}-language`}
                        label={t("adminListingSources.fields.language")}
                        name={`${prefix}.language`}
                        register={register}
                    />
                </div>
            )}
            {method === "WOOCOMMERCE" && (
                <>
                    <p className="text-sm text-muted-foreground">
                        {t("adminListingSources.form.secretPreservationNotice")}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <ConfigurationTextField
                            id={`admin-source-update-${index}-secret`}
                            label={t("adminListingSources.fields.webhookSecret")}
                            name={`${prefix}.webhookSecret`}
                            register={register}
                            type="password"
                            autoComplete="new-password"
                        />
                        <ConfigurationTextField
                            id={`admin-source-update-${index}-currency`}
                            label={t("adminListingSources.fields.currency")}
                            name={`${prefix}.currency`}
                            register={register}
                            error={error?.currency?.message}
                        />
                        <ConfigurationTextField
                            id={`admin-source-update-${index}-language`}
                            label={t("adminListingSources.fields.language")}
                            name={`${prefix}.language`}
                            register={register}
                        />
                    </div>
                </>
            )}
            {method === "PARTNER_API" && (
                <p className="text-sm text-muted-foreground">
                    {t("adminListingSources.form.partnerApiConfiguration")}
                </p>
            )}
        </div>
    );
}

function PresentationFields({
    register,
    errors,
}: {
    readonly register: UseFormRegister<CreateFormValues>;
    readonly errors: {
        readonly url?: { readonly message?: string };
        readonly image?: { readonly message?: string };
    };
}) {
    const { t } = useTranslation();
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <FormField
                id="admin-listing-source-url"
                label={t("adminListingSources.fields.url")}
                error={errors.url?.message}
            >
                <Input id="admin-listing-source-url" type="url" {...register("url")} />
            </FormField>
            <FormField
                id="admin-listing-source-image"
                label={t("adminListingSources.fields.image")}
                error={errors.image?.message}
            >
                <Input id="admin-listing-source-image" type="url" {...register("image")} />
            </FormField>
        </div>
    );
}

function ConfigurationTextField({
    id,
    label,
    name,
    register,
    error,
    type = "text",
    autoComplete,
}: {
    readonly id: string;
    readonly label: string;
    readonly name: `configurations.${number}.${"domain" | "currency" | "language" | "webhookSecret"}`;
    readonly register: UseFormRegister<CreateFormValues> | UseFormRegister<UpdateFormValues>;
    readonly error?: string;
    readonly type?: "text" | "password";
    readonly autoComplete?: string;
}) {
    return (
        <FormField id={id} label={label} error={error}>
            <Input
                id={id}
                type={type}
                autoComplete={autoComplete}
                aria-invalid={Boolean(error)}
                {...(register as UseFormRegister<CreateFormValues>)(name)}
            />
        </FormField>
    );
}

function FormField({
    id,
    label,
    error,
    children,
}: {
    readonly id: string;
    readonly label: string;
    readonly error?: string;
    readonly children: ReactNode;
}) {
    const { t } = useTranslation();
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {error && (
                <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
                    {t(error)}
                </p>
            )}
        </div>
    );
}
