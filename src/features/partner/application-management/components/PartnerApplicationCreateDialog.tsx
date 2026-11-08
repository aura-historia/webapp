import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { type Control, type UseFormReturn, useController, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
    INGESTION_METHODS,
    type ApplicationListingSource,
} from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import {
    DIALOG_CONTENT_CLASS,
    DIALOG_DESCRIPTION_CLASS,
    DIALOG_TITLE_CLASS,
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    INLINE_ALERT_CLASS,
    MONO_LABEL_CLASS,
    OPTION_CARD_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn } from "@/lib/utils.ts";
import { useCreatePartnerApplication } from "../api/usePartnerApplications.ts";
import { ApplicationListingSourceField } from "./ApplicationListingSourceField.tsx";
import { ListingSourceTypeField } from "./ListingSourceTypeField.tsx";
import {
    buildApplicationProposal,
    createPartnerApplicationFormSchema,
    PARTNER_APPLICATION_CREATE_DEFAULT_VALUES,
    type PartnerApplicationCreateFormData,
    type PartnerApplicationCreateFormValues,
} from "./PartnerApplicationCreateForm.ts";

type ApplicationForm = UseFormReturn<
    PartnerApplicationCreateFormValues,
    unknown,
    PartnerApplicationCreateFormData
>;
type ApplicationControl = Control<
    PartnerApplicationCreateFormValues,
    unknown,
    PartnerApplicationCreateFormData
>;
type TextFieldName =
    | "sourceName"
    | "sourceUrl"
    | "sourceImage"
    | "partyName"
    | "partyPhone"
    | "partyEmail";

const KINDS = [
    {
        type: "EXISTING_LISTING_SOURCE",
        title: "partnerApplications.create.kind.existing",
        description: "partnerApplications.create.kind.existingDescription",
    },
    {
        type: "PROPOSED_LISTING_SOURCE",
        title: "partnerApplications.create.kind.proposed",
        description: "partnerApplications.create.kind.proposedDescription",
    },
] as const;

const GROUP_LEGEND_CLASS = cn(MONO_LABEL_CLASS, "mb-3.5 w-full border-b border-line pb-2.5");

function TextField({
    form,
    name,
    label,
    optional = false,
    type = "text",
    hint,
}: {
    readonly form: ApplicationForm;
    readonly name: TextFieldName;
    readonly label: string;
    readonly optional?: boolean;
    readonly type?: "text" | "url" | "email" | "tel";
    readonly hint?: string;
}) {
    const { t } = useTranslation();
    const error = form.getFieldState(name, form.formState).error?.message;
    const id = `application-${name}`;
    const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={id} data-error={Boolean(error)} className={FIELD_LABEL_CLASS}>
                {label}
                {optional && (
                    <span className="font-normal text-ink-muted">
                        {" "}
                        {t("partnerApplications.create.optional")}
                    </span>
                )}
            </label>
            <input
                id={id}
                type={type}
                {...form.register(name)}
                aria-required={!optional}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy || undefined}
                className={FIELD_CLASS}
            />
            {hint && (
                <span id={`${id}-hint`} className="text-xs text-ink-muted">
                    {hint}
                </span>
            )}
            {error && (
                <span id={`${id}-error`} className={FIELD_ERROR_CLASS}>
                    {error}
                </span>
            )}
        </div>
    );
}

/**
 * Registers the provider type from a child, after the parent has registered the provider fields
 * above it, so react-hook-form focuses invalid fields in page order on submit.
 */
function ProposedListingSourceTypeField({ control }: { readonly control: ApplicationControl }) {
    const { field, fieldState } = useController({
        control,
        name: "listingSourceType",
        defaultValue: "",
    });
    return (
        <ListingSourceTypeField
            name={field.name}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={fieldState.error?.message}
        />
    );
}

/** The operator fields; a child so they register after the provider type above them. */
function ProposedPartyFields({ form }: { readonly form: ApplicationForm }) {
    const { t } = useTranslation();
    return (
        <fieldset className="flex min-w-0 flex-col gap-3.5">
            <legend className={GROUP_LEGEND_CLASS}>
                {t("partnerApplications.create.groups.operator")}
            </legend>
            <TextField
                form={form}
                name="partyName"
                label={t("partnerApplications.create.fields.operator")}
                hint={t("partnerApplications.create.fields.operatorHint")}
            />
            <div className="grid gap-3.5 sm:grid-cols-2">
                <TextField
                    form={form}
                    name="partyPhone"
                    type="tel"
                    optional
                    label={t("partnerApplications.create.fields.phone")}
                />
                <TextField
                    form={form}
                    name="partyEmail"
                    type="email"
                    optional
                    label={t("partnerApplications.create.fields.email")}
                />
            </div>
        </fieldset>
    );
}

function IngestionMethodsField({
    control,
    disabled,
}: {
    readonly control: ApplicationControl;
    readonly disabled: boolean;
}) {
    const { t } = useTranslation();
    const { field } = useController({
        control,
        name: "requestedIngestionMethods",
        defaultValue: [],
    });
    const selected = field.value ?? [];
    return (
        <fieldset className="flex min-w-0 flex-col gap-2.5">
            <legend className={GROUP_LEGEND_CLASS}>
                {t("partnerApplications.create.groups.connections")}
                <span className="tracking-[0.08em]">
                    {" "}
                    · {t("partnerApplications.create.optional")}
                </span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
                {INGESTION_METHODS.map((method) => (
                    <label
                        key={method}
                        className={cn(OPTION_CARD_CLASS, "min-h-12 items-center py-0 text-sm")}
                    >
                        <input
                            type="checkbox"
                            disabled={disabled}
                            checked={selected.includes(method)}
                            onBlur={field.onBlur}
                            onChange={(event) =>
                                field.onChange(
                                    event.target.checked
                                        ? [...selected, method]
                                        : selected.filter((item) => item !== method),
                                )
                            }
                            className="size-4 shrink-0 accent-oxblood"
                        />
                        {t(`partnerApplications.proposals.ingestion.${method}`)}
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

export function PartnerApplicationCreateDialog({
    open,
    onOpenChange,
}: {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const mutation = useCreatePartnerApplication();
    const form = useForm<
        PartnerApplicationCreateFormValues,
        unknown,
        PartnerApplicationCreateFormData
    >({
        resolver: zodResolver(createPartnerApplicationFormSchema(t)),
        defaultValues: PARTNER_APPLICATION_CREATE_DEFAULT_VALUES,
    });
    const [selected, setSelected] = useState<ApplicationListingSource | null>(null);
    const sourceField = useController({
        control: form.control,
        name: "listingSourceId",
        defaultValue: "",
    }).field;
    const type = form.watch("type");
    const reset = () => {
        form.reset(PARTNER_APPLICATION_CREATE_DEFAULT_VALUES);
        setSelected(null);
        mutation.reset();
    };
    const close = (next: boolean) => {
        if (mutation.isPending) return;
        if (!next) reset();
        onOpenChange(next);
    };
    const chooseKind = (next: (typeof KINDS)[number]["type"]) => {
        if (next === type) return;
        form.reset(
            next === "EXISTING_LISTING_SOURCE"
                ? { type: "EXISTING_LISTING_SOURCE", listingSourceId: "" }
                : PARTNER_APPLICATION_CREATE_DEFAULT_VALUES,
        );
        setSelected(null);
        mutation.reset();
    };
    const submit = form.handleSubmit((values) =>
        mutation.mutate(buildApplicationProposal(values), {
            onSuccess: () => {
                toast.success(t("partnerApplications.create.sent"));
                reset();
                onOpenChange(false);
            },
        }),
    );
    const sourceError = form.getFieldState("listingSourceId", form.formState).error?.message;

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent
                className={cn(
                    DIALOG_CONTENT_CLASS,
                    "max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[680px]",
                )}
                closeLabel={t("partnerDashboard.close")}
                showCloseButton={!mutation.isPending}
            >
                <div className="flex flex-col gap-1.5 border-b border-line-subtle px-7 pt-7 pb-5 pr-14">
                    <DialogTitle className={cn(DIALOG_TITLE_CLASS, "text-[28px]")}>
                        {t("partnerApplications.create.open")}
                    </DialogTitle>
                    <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
                        {t("partnerApplications.create.description")}
                    </DialogDescription>
                </div>
                <form noValidate onSubmit={submit}>
                    <fieldset
                        disabled={mutation.isPending}
                        className="flex min-w-0 flex-col gap-7 px-7 py-6"
                    >
                        <fieldset className="flex min-w-0 flex-col gap-2.5">
                            <legend className="mb-2.5 text-meta font-medium">
                                {t("partnerApplications.create.kind.legend")}
                            </legend>
                            <div className="grid gap-2.5 sm:grid-cols-2">
                                {KINDS.map((kind) => (
                                    <label
                                        key={kind.type}
                                        className={cn(OPTION_CARD_CLASS, "items-start")}
                                    >
                                        <input
                                            type="radio"
                                            name="application-kind"
                                            value={kind.type}
                                            checked={type === kind.type}
                                            onChange={() => chooseKind(kind.type)}
                                            aria-describedby={`application-kind-${kind.type}`}
                                            className="mt-0.5 size-4 shrink-0 accent-oxblood"
                                        />
                                        <span className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">
                                                {t(kind.title)}
                                            </span>
                                            <span
                                                id={`application-kind-${kind.type}`}
                                                className="text-meta text-ink-muted"
                                            >
                                                {t(kind.description)}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        {type === "EXISTING_LISTING_SOURCE" ? (
                            <ApplicationListingSourceField
                                value={selected}
                                error={sourceError}
                                onChange={(source) => {
                                    setSelected(source);
                                    sourceField.onChange(source?.listingSourceId ?? "");
                                }}
                            />
                        ) : (
                            <>
                                <fieldset className="flex min-w-0 flex-col gap-3.5">
                                    <legend className={GROUP_LEGEND_CLASS}>
                                        {t("partnerApplications.create.groups.provider")}
                                    </legend>
                                    <TextField
                                        form={form}
                                        name="sourceName"
                                        label={t("partnerApplications.create.fields.providerName")}
                                    />
                                    <div className="grid gap-3.5 sm:grid-cols-2">
                                        <TextField
                                            form={form}
                                            name="sourceUrl"
                                            type="url"
                                            optional
                                            label={t("partnerApplications.create.fields.website")}
                                        />
                                        <TextField
                                            form={form}
                                            name="sourceImage"
                                            type="url"
                                            optional
                                            label={t("partnerApplications.create.fields.image")}
                                        />
                                    </div>
                                    <ProposedListingSourceTypeField control={form.control} />
                                </fieldset>
                                <ProposedPartyFields form={form} />
                                <IngestionMethodsField
                                    control={form.control}
                                    disabled={mutation.isPending}
                                />
                            </>
                        )}

                        {mutation.error && (
                            <p role="alert" className={INLINE_ALERT_CLASS}>
                                <CircleAlert
                                    aria-hidden="true"
                                    className="mt-0.5 size-4 shrink-0 text-oxblood"
                                    strokeWidth={2}
                                />
                                {mutation.error.message}
                            </p>
                        )}
                    </fieldset>
                    <div className="flex flex-wrap justify-end gap-2.5 border-t border-line-subtle px-7 pt-[18px] pb-6">
                        <button
                            type="button"
                            className={SECONDARY_PILL_CLASS}
                            disabled={mutation.isPending}
                            onClick={() => close(false)}
                        >
                            {t("partnerApplications.create.cancel")}
                        </button>
                        <button
                            type="submit"
                            className={PRIMARY_PILL_CLASS}
                            disabled={
                                mutation.isPending ||
                                (type === "EXISTING_LISTING_SOURCE" && !selected)
                            }
                        >
                            {mutation.isPending && <Spinner aria-hidden="true" />}
                            {t(
                                mutation.isPending
                                    ? "partnerApplications.create.sending"
                                    : "partnerApplications.create.send",
                            )}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
