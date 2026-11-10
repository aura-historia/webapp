import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useController, useForm, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AdminSelect } from "@/features/admin/common/components/AdminDirectory.tsx";
import { AdminMark } from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_LEGEND_CLASS,
    ADMIN_RAISED_FIELD_CLASS,
    ADMIN_SMALL_PRIMARY_CLASS,
    FIELD_LABEL_CLASS,
    FOCUS_CLASS,
    INLINE_ALERT_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { isSourceTextLanguage, SOURCE_TEXT_LANGUAGES } from "@/data/internal/common/Language.ts";
import type { AdminProductListingDetail } from "@/data/internal/product/AdminProductListing.ts";
import {
    LISTING_AVAILABILITIES,
    LISTING_AVAILABILITY_TRANSLATION_KEYS,
} from "@/data/internal/product/ListingAvailability.ts";
import { cn } from "@/lib/utils.ts";
import {
    adminProductListingDetailQueryKey,
    useUpdateAdminProductListing,
} from "../api/useAdminProductListings.ts";
import {
    ADMIN_PRODUCT_LISTING_PRICE_KINDS,
    type AdminProductListingFormValues,
    LISTING_TITLE_MAX_CHARACTERS,
    buildAdminProductListingPatch,
    countAdminProductListingChanges,
    createAdminProductListingFormSchema,
    rebaseAdminProductListingDraft,
    toAdminProductListingFormValues,
} from "../lib/adminProductListingForm.ts";
import { AdminProductListingAuctionFields } from "./AdminProductListingAuctionFields.tsx";
import { AdminProductListingImagesField } from "./AdminProductListingImagesField.tsx";
import { FormField, FormFieldError, useLanguageNames } from "./AdminProductListingPresentation.tsx";
import { AdminSegmentedControl } from "./AdminSegmentedControl.tsx";

/** The listing as the draft's changes are measured against, and the version a save submits. */
type DraftBase = {
    readonly values: AdminProductListingFormValues;
    readonly version: number;
};

type ListingForm = UseFormReturn<AdminProductListingFormValues>;

/**
 * Edits the mutable facts of one listing. `listing` is the latest authoritative state; the draft
 * keeps the version it was loaded with. When a newer version arrives while the draft has changes,
 * saving waits until the administrator keeps (reapplies) or discards the draft explicitly.
 */
export function AdminProductListingEditForm({
    listing,
    language,
}: {
    readonly listing: AdminProductListingDetail;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const update = useUpdateAdminProductListing(listing.productListingId);
    const [base, setBase] = useState<DraftBase>(() => ({
        values: toAdminProductListingFormValues(listing),
        version: listing.expectedVersion,
    }));
    // Only groups that differ from the base are validated and sent.
    const resolver = useMemo(
        () => zodResolver(createAdminProductListingFormSchema(base.values)),
        [base.values],
    );
    const form = useForm<AdminProductListingFormValues>({
        resolver,
        defaultValues: base.values,
    });
    const draft = form.watch();
    const changeCount = countAdminProductListingChanges(draft, base.values);
    const hasChanges = changeCount > 0;
    const editable = listing.lifecycle === "ACTIVE";
    // Versions only grow. An older cached record (a refetch after a save failed) is not newer data.
    const stale = listing.expectedVersion > base.version;
    const busy = form.formState.isSubmitting || update.isPending;
    const locked = !editable || busy;

    // Without unsaved changes there is nothing to reconcile, so newer data replaces the form.
    useEffect(() => {
        if (!stale || hasChanges || update.isPending) return;
        const values = toAdminProductListingFormValues(listing);
        setBase({ values, version: listing.expectedVersion });
        form.reset(values);
    }, [stale, hasChanges, update.isPending, listing, form]);

    const adopt = (latest: AdminProductListingDetail) => {
        const values = toAdminProductListingFormValues(latest);
        setBase({ values, version: latest.expectedVersion });
        form.reset(values);
    };

    const keepDraft = () => {
        const latest = toAdminProductListingFormValues(listing);
        const rebased = rebaseAdminProductListingDraft(form.getValues(), base.values, latest);
        setBase({ values: latest, version: listing.expectedVersion });
        form.reset(rebased);
        update.reset();
    };

    const discardDraft = () => {
        adopt(listing);
        update.reset();
    };

    const submit = async (values: AdminProductListingFormValues) => {
        update.reset();
        const patch = buildAdminProductListingPatch(values, base.values);
        if (Object.keys(patch).length === 0) return;
        try {
            const result = await update.mutateAsync({ patch, expectedVersion: base.version });
            const latest = queryClient.getQueryData<AdminProductListingDetail>(
                adminProductListingDetailQueryKey(listing.productListingId),
            );
            if (latest && latest.expectedVersion >= result.expectedVersion) {
                adopt(latest);
            } else {
                // The refetch failed; the submitted values are the state at the returned version.
                setBase({ values, version: result.expectedVersion });
                form.reset(values);
            }
            toast.success(
                t(
                    result.outcome === "CHANGED"
                        ? "adminProductListings.edit.savedToast"
                        : "adminProductListings.edit.unchangedToast",
                ),
            );
        } catch {
            // The mutation exposes a localized, status-based error in the save bar and keeps the draft.
        }
    };

    return (
        <form
            noValidate
            aria-labelledby="admin-product-listing-edit-title"
            onSubmit={form.handleSubmit(submit)}
            className="flex min-w-0 flex-col"
        >
            <h2 id="admin-product-listing-edit-title" className="sr-only">
                {t("adminProductListings.edit.title")}
            </h2>
            {!editable && (
                <output className="mb-6 flex gap-2.5 rounded-md px-4 py-3.5 text-sm leading-normal shadow-[inset_0_0_0_1px_var(--line-strong)]">
                    <Lock
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-ink-secondary"
                        strokeWidth={1.8}
                    />
                    {t(
                        listing.lifecycle === "WITHDRAWN"
                            ? "adminProductListings.edit.lockedWithdrawn"
                            : "adminProductListings.edit.lockedUnknown",
                    )}
                </output>
            )}
            {stale && hasChanges && !busy && (
                <div
                    role="alert"
                    className="mb-6 flex flex-col gap-3 rounded-md bg-surface-raised p-4 shadow-[inset_0_0_0_1.5px_var(--oxblood)]"
                >
                    <p className="text-sm leading-normal">
                        {t("adminProductListings.edit.staleShort", {
                            version: listing.expectedVersion,
                        })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {editable && (
                            <button
                                type="button"
                                onClick={keepDraft}
                                className={ADMIN_SMALL_PRIMARY_CLASS}
                            >
                                {t("adminProductListings.actions.keepDraft")}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={discardDraft}
                            className={SMALL_SECONDARY_PILL_CLASS}
                        >
                            {t("adminProductListings.actions.discardDraft")}
                        </button>
                    </div>
                </div>
            )}

            <FormSection
                number={1}
                title={t("adminProductListings.fields.text")}
                disabled={locked}
                faded={!editable}
            >
                <TextFields form={form} disabled={locked} />
            </FormSection>
            <FormSection
                number={2}
                title={t("adminProductListings.fields.pricing")}
                disabled={locked}
                faded={!editable}
            >
                <PricingFields form={form} disabled={locked} />
            </FormSection>
            <FormSection
                number={3}
                title={t("adminProductListings.edit.availabilityAndLink")}
                disabled={locked}
                faded={!editable}
            >
                <AvailabilityFields
                    form={form}
                    disabled={locked}
                    unrecognized={base.values.availability === "UNKNOWN"}
                />
            </FormSection>
            <FormSection
                number={4}
                title={t("adminProductListings.edit.imagesInOrder")}
                disabled={busy}
                faded={!editable}
            >
                <AdminProductListingImagesField form={form} disabled={locked} />
            </FormSection>
            <FormSection
                number={5}
                title={t("adminProductListings.fields.auction")}
                disabled={locked}
                faded={!editable}
            >
                <AdminProductListingAuctionFields
                    form={form}
                    listingSourceId={listing.source.listingSourceId}
                    language={language}
                    disabled={locked}
                />
            </FormSection>

            <div className="sticky bottom-4 z-10 mt-6 flex flex-col gap-2.5">
                {update.error && (
                    <p role="alert" className={cn(INLINE_ALERT_CLASS, "shadow-menu")}>
                        {update.error.message}
                    </p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] bg-surface-raised py-3 pr-3 pl-5 shadow-menu">
                    <output className="inline-flex items-center gap-2 text-meta text-ink-secondary">
                        {hasChanges && <AdminMark tone="brass" className="size-2 bg-brass" />}
                        {hasChanges
                            ? t("adminProductListings.edit.unsaved", { count: changeCount })
                            : t("adminProductListings.edit.noUnsaved")}
                    </output>
                    <span className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            disabled={busy || !hasChanges || stale}
                            onClick={discardDraft}
                            className={SECONDARY_PILL_CLASS}
                        >
                            {t("adminProductListings.actions.resetDraft")}
                        </button>
                        <button
                            type="submit"
                            disabled={locked || stale || !hasChanges}
                            aria-busy={busy}
                            className={PRIMARY_PILL_CLASS}
                        >
                            {busy && (
                                <Loader2
                                    aria-hidden="true"
                                    className="size-[15px] animate-spin motion-reduce:animate-none"
                                />
                            )}
                            {busy ? t("adminCommon.saving") : t("adminCommon.save")}
                        </button>
                    </span>
                </div>
            </div>
        </form>
    );
}

/** A numbered, ruled form section ("01 · ORIGINAL TEXT"); a locked listing fades and disables it. */
function FormSection({
    number,
    title,
    disabled,
    faded,
    children,
}: {
    readonly number: number;
    readonly title: string;
    readonly disabled: boolean;
    /** Fades a locked (withdrawn) listing's section; a save in flight only disables it. */
    readonly faded: boolean;
    readonly children: ReactNode;
}) {
    return (
        <fieldset
            disabled={disabled}
            className={cn(
                "min-w-0 border-b border-line py-7 first-of-type:pt-0",
                faded && "opacity-55",
            )}
        >
            <legend className={cn(ADMIN_LEGEND_CLASS, "float-left")}>
                {String(number).padStart(2, "0")} · {title}
            </legend>
            <div className="clear-both flex flex-col gap-4">{children}</div>
        </fieldset>
    );
}

function TextFields({
    form,
    disabled,
}: {
    readonly form: ListingForm;
    readonly disabled: boolean;
}) {
    const { t } = useTranslation();
    const errors = form.formState.errors;
    const [title, titleLanguage, descriptionLanguage] = form.watch([
        "title",
        "titleLanguage",
        "descriptionLanguage",
    ]);
    // The backend shortens longer titles with "..." instead of rejecting them.
    const titleTooLong = [...title.trim()].length > LISTING_TITLE_MAX_CHARACTERS;

    return (
        <>
            <div className="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_180px]">
                <FormField
                    id="admin-product-listing-title"
                    label={t("adminProductListings.fields.originalTitle")}
                >
                    <input
                        id="admin-product-listing-title"
                        autoComplete="off"
                        dir="auto"
                        lang={textLanguage(titleLanguage)}
                        aria-describedby={
                            titleTooLong ? "admin-product-listing-title-note" : undefined
                        }
                        className={ADMIN_RAISED_FIELD_CLASS}
                        {...form.register("title")}
                    />
                    {titleTooLong && (
                        <p
                            id="admin-product-listing-title-note"
                            className="text-meta text-ink-secondary"
                        >
                            {t("adminProductListings.edit.titleTooLong")}
                        </p>
                    )}
                </FormField>
                <TextLanguageField
                    form={form}
                    name="titleLanguage"
                    label={t("adminProductListings.fields.titleLanguage")}
                    disabled={disabled}
                    error={errors.titleLanguage?.message}
                />
            </div>
            <div className="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_180px]">
                <FormField
                    id="admin-product-listing-description"
                    label={t("adminProductListings.fields.originalDescription")}
                >
                    <textarea
                        id="admin-product-listing-description"
                        rows={5}
                        dir="auto"
                        lang={textLanguage(descriptionLanguage)}
                        className={cn(
                            ADMIN_RAISED_FIELD_CLASS,
                            "h-auto resize-y py-2.5 leading-[1.55]",
                        )}
                        {...form.register("description")}
                    />
                </FormField>
                <TextLanguageField
                    form={form}
                    name="descriptionLanguage"
                    label={t("adminProductListings.fields.descriptionLanguage")}
                    disabled={disabled}
                    error={errors.descriptionLanguage?.message}
                />
            </div>
        </>
    );
}

/** Marks the input's language only once a supported one is chosen. */
function textLanguage(language: string): string | undefined {
    return isSourceTextLanguage(language) ? language : undefined;
}

function TextLanguageField({
    form,
    name,
    label,
    disabled,
    error,
}: {
    readonly form: ListingForm;
    readonly name: "titleLanguage" | "descriptionLanguage";
    readonly label: string;
    readonly disabled: boolean;
    readonly error?: string;
}) {
    const { t } = useTranslation();
    const languageName = useLanguageNames();
    const language = useController({ control: form.control, name }).field;
    const id = `admin-product-listing-${name}`;
    const unsupported = language.value !== "" && !isSourceTextLanguage(language.value);

    return (
        <FormField id={id} label={label} error={error}>
            <AdminSelect
                id={id}
                raised
                value={language.value}
                onChange={language.onChange}
                disabled={disabled}
                invalid={Boolean(error)}
                describedBy={error ? `${id}-error` : undefined}
                options={[
                    { value: "", label: t("adminProductListings.fields.chooseLanguage") },
                    // A stored language outside the supported set is shown but cannot be chosen again.
                    ...(unsupported
                        ? [{ value: language.value, label: language.value.toUpperCase() }]
                        : []),
                    ...SOURCE_TEXT_LANGUAGES.map((code) => ({
                        value: code,
                        label: languageName(code),
                    })),
                ]}
            />
        </FormField>
    );
}

function PricingFields({
    form,
    disabled,
}: {
    readonly form: ListingForm;
    readonly disabled: boolean;
}) {
    const { t } = useTranslation();
    const priceKind = useController({ control: form.control, name: "priceKind" }).field;
    const errors = form.formState.errors;

    return (
        <>
            <AdminSegmentedControl
                label={t("adminProductListings.fields.price")}
                value={priceKind.value}
                onChange={priceKind.onChange}
                disabled={disabled}
                options={ADMIN_PRODUCT_LISTING_PRICE_KINDS.map((kind) => ({
                    value: kind,
                    label: t(`adminProductListings.priceOptions.${kind}`),
                }))}
            />
            <div className="grid gap-3.5 sm:grid-cols-3">
                {priceKind.value === "MONETARY" && (
                    <MoneyField
                        form={form}
                        amountName="priceAmount"
                        currencyName="priceCurrency"
                        label={t("adminProductListings.fields.price")}
                        amountError={errors.priceAmount?.message}
                        currencyError={errors.priceCurrency?.message}
                    />
                )}
                <MoneyField
                    form={form}
                    amountName="estimateMinAmount"
                    currencyName="estimateMinCurrency"
                    label={t("adminProductListings.fields.estimateMin")}
                    amountError={errors.estimateMinAmount?.message}
                    currencyError={errors.estimateMinCurrency?.message}
                />
                <MoneyField
                    form={form}
                    amountName="estimateMaxAmount"
                    currencyName="estimateMaxCurrency"
                    label={t("adminProductListings.fields.estimateMax")}
                    amountError={errors.estimateMaxAmount?.message}
                    currencyError={errors.estimateMaxCurrency?.message}
                />
            </div>
        </>
    );
}

/** An amount and its currency in one field; the currency sits behind a hairline. */
function MoneyField({
    form,
    amountName,
    currencyName,
    label,
    amountError,
    currencyError,
}: {
    readonly form: ListingForm;
    readonly amountName: "priceAmount" | "estimateMinAmount" | "estimateMaxAmount";
    readonly currencyName: "priceCurrency" | "estimateMinCurrency" | "estimateMaxCurrency";
    readonly label: string;
    readonly amountError?: string;
    readonly currencyError?: string;
}) {
    const { t } = useTranslation();
    const currency = useController({ control: form.control, name: currencyName }).field;
    const amountId = `admin-product-listing-${amountName}`;
    const currencyId = `admin-product-listing-${currencyName}`;
    const invalid = Boolean(amountError || currencyError);

    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label
                htmlFor={amountId}
                className={FIELD_LABEL_CLASS}
                data-error={invalid ? "true" : undefined}
            >
                {label}
            </label>
            <div
                className={cn(
                    "grid grid-cols-[minmax(0,1fr)_84px] rounded-md bg-surface-raised shadow-field",
                    invalid && "shadow-[inset_0_0_0_1.5px_var(--oxblood)]",
                )}
            >
                <input
                    id={amountId}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.00"
                    aria-invalid={amountError ? true : undefined}
                    aria-describedby={amountError ? `${amountId}-error` : undefined}
                    className={cn(
                        "h-11 min-w-0 rounded-l-md border-0 bg-transparent px-3 text-[15px] text-ink tabular-nums placeholder:text-ink-placeholder disabled:cursor-not-allowed",
                        FOCUS_CLASS,
                    )}
                    {...form.register(amountName)}
                />
                <select
                    id={currencyId}
                    value={currency.value}
                    onChange={(event) => currency.onChange(event.target.value)}
                    onBlur={currency.onBlur}
                    aria-label={t("adminProductListings.edit.currencyOf", { field: label })}
                    aria-invalid={currencyError ? true : undefined}
                    aria-describedby={currencyError ? `${currencyId}-error` : undefined}
                    className={cn(
                        "h-11 min-w-0 cursor-pointer rounded-r-md border-0 bg-transparent px-2 font-mono text-xs text-ink shadow-[inset_1px_0_0_var(--line)] disabled:cursor-not-allowed",
                        FOCUS_CLASS,
                    )}
                >
                    <option value="">{t("adminCommon.none")}</option>
                    {CURRENCIES.map((code) => (
                        <option key={code} value={code}>
                            {code}
                        </option>
                    ))}
                </select>
            </div>
            <FormFieldError id={`${amountId}-error`} message={amountError} />
            <FormFieldError id={`${currencyId}-error`} message={currencyError} />
        </div>
    );
}

function AvailabilityFields({
    form,
    disabled,
    unrecognized,
}: {
    readonly form: ListingForm;
    readonly disabled: boolean;
    readonly unrecognized: boolean;
}) {
    const { t } = useTranslation();
    const availability = useController({ control: form.control, name: "availability" }).field;
    const errors = form.formState.errors;

    return (
        <div className="grid gap-3.5 sm:grid-cols-[220px_minmax(0,1fr)]">
            <FormField
                id="admin-product-listing-availability"
                label={t("adminProductListings.fields.availability")}
                error={errors.availability?.message}
            >
                <AdminSelect
                    id="admin-product-listing-availability"
                    raised
                    value={availability.value}
                    onChange={availability.onChange}
                    disabled={disabled}
                    invalid={Boolean(errors.availability)}
                    options={[
                        { value: "", label: t("adminProductListings.fields.notAsserted") },
                        ...(unrecognized
                            ? [
                                  {
                                      value: "UNKNOWN",
                                      label: t("adminProductListings.fields.unrecognized"),
                                  },
                              ]
                            : []),
                        ...LISTING_AVAILABILITIES.map((value) => ({
                            value,
                            label: t(LISTING_AVAILABILITY_TRANSLATION_KEYS[value]),
                        })),
                    ]}
                />
            </FormField>
            <FormField
                id="admin-product-listing-url"
                label={t("adminProductListings.fields.url")}
                error={errors.url?.message}
            >
                <input
                    id="admin-product-listing-url"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={errors.url ? true : undefined}
                    aria-describedby={errors.url ? "admin-product-listing-url-error" : undefined}
                    className={cn(ADMIN_RAISED_FIELD_CLASS, "text-sm")}
                    {...form.register("url")}
                />
            </FormField>
        </div>
    );
}
