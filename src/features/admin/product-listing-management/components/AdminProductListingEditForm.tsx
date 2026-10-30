import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useController, useForm, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { isSourceTextLanguage, SOURCE_TEXT_LANGUAGES } from "@/data/internal/common/Language.ts";
import type { AdminProductListingDetail } from "@/data/internal/product/AdminProductListing.ts";
import {
    LISTING_AVAILABILITIES,
    LISTING_AVAILABILITY_TRANSLATION_KEYS,
} from "@/data/internal/product/ListingAvailability.ts";
import {
    adminProductListingDetailQueryKey,
    useUpdateAdminProductListing,
} from "../api/useAdminProductListings.ts";
import {
    ADMIN_PRODUCT_LISTING_PRICE_KINDS,
    type AdminProductListingFormValues,
    buildAdminProductListingPatch,
    createAdminProductListingFormSchema,
    hasAdminProductListingChanges,
    rebaseAdminProductListingDraft,
    toAdminProductListingFormValues,
} from "../lib/adminProductListingForm.ts";
import { AdminProductListingAuctionFields } from "./AdminProductListingAuctionFields.tsx";
import { AdminProductListingImagesField } from "./AdminProductListingImagesField.tsx";
import { FormFieldError } from "./AdminProductListingPresentation.tsx";

/** The listing as the draft's changes are measured against, and the version a save submits. */
type DraftBase = {
    readonly values: AdminProductListingFormValues;
    readonly version: number;
};

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
    const [notice, setNotice] = useState<string>();
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
    const hasChanges = hasAdminProductListingChanges(draft, base.values);
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
        setNotice(undefined);
    };

    const discardDraft = () => {
        adopt(listing);
        update.reset();
        setNotice(undefined);
    };

    const submit = async (values: AdminProductListingFormValues) => {
        setNotice(undefined);
        update.reset();
        const patch = buildAdminProductListingPatch(values, base.values);
        if (Object.keys(patch).length === 0) {
            setNotice(t("adminProductListings.edit.noChanges"));
            return;
        }
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
            setNotice(
                t(
                    result.outcome === "CHANGED"
                        ? "adminProductListings.edit.saved"
                        : "adminProductListings.edit.unchanged",
                ),
            );
        } catch {
            // The mutation exposes a localized, status-based error below and keeps the draft.
        }
    };

    return (
        <section className="grid gap-4" aria-labelledby="admin-product-listing-edit-title">
            <div className="grid gap-2">
                <h2 id="admin-product-listing-edit-title" className="font-display text-2xl italic">
                    {t("adminProductListings.edit.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {t("adminProductListings.edit.description")}
                </p>
            </div>
            <form
                noValidate
                className="grid gap-6 border bg-card p-5 sm:p-7"
                onSubmit={form.handleSubmit(submit)}
            >
                {!editable && (
                    <p className="border bg-surface-container p-3 text-sm">
                        {t(
                            listing.lifecycle === "WITHDRAWN"
                                ? "adminProductListings.edit.withdrawnLocked"
                                : "adminProductListings.edit.lifecycleUnknownLocked",
                        )}
                    </p>
                )}
                <TextFields form={form} disabled={locked} />
                <PricingFields form={form} disabled={locked} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <AvailabilityField
                        form={form}
                        disabled={locked}
                        unrecognized={base.values.availability === "UNKNOWN"}
                    />
                    <div className="grid content-start gap-2">
                        <Label htmlFor="admin-product-listing-url">
                            {t("adminProductListings.fields.url")}
                        </Label>
                        <Input
                            id="admin-product-listing-url"
                            type="url"
                            inputMode="url"
                            autoComplete="off"
                            spellCheck={false}
                            disabled={locked}
                            aria-invalid={form.formState.errors.url ? true : undefined}
                            {...form.register("url")}
                        />
                        <FormFieldError message={form.formState.errors.url?.message} />
                    </div>
                </div>
                <AdminProductListingImagesField form={form} disabled={locked} />
                <AdminProductListingAuctionFields
                    form={form}
                    listingSourceId={listing.source.listingSourceId}
                    language={language}
                    disabled={locked}
                />
                {stale && hasChanges && !busy && (
                    <div
                        role="alert"
                        className="grid gap-3 border border-destructive/40 bg-destructive/5 p-4"
                    >
                        <p className="text-sm">
                            {t(
                                editable
                                    ? "adminProductListings.edit.stale"
                                    : "adminProductListings.edit.staleLocked",
                                { version: listing.expectedVersion },
                            )}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {editable && (
                                <Button type="button" variant="outline" onClick={keepDraft}>
                                    {t("adminProductListings.actions.keepDraft")}
                                </Button>
                            )}
                            <Button type="button" variant="outline" onClick={discardDraft}>
                                {t("adminProductListings.actions.discardDraft")}
                            </Button>
                        </div>
                    </div>
                )}
                {update.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {update.error.message}
                    </p>
                )}
                {notice && <output className="text-sm text-muted-foreground">{notice}</output>}
                <div className="flex flex-wrap justify-end gap-2">
                    {hasChanges && !stale && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={discardDraft}
                        >
                            {t("adminProductListings.actions.resetDraft")}
                        </Button>
                    )}
                    <Button type="submit" disabled={locked || stale}>
                        {busy
                            ? t("adminProductListings.actions.saving")
                            : t("adminProductListings.actions.save")}
                    </Button>
                </div>
            </form>
        </section>
    );
}

function TextFields({
    form,
    disabled,
}: {
    readonly form: UseFormReturn<AdminProductListingFormValues>;
    readonly disabled: boolean;
}) {
    const { t } = useTranslation();
    const errors = form.formState.errors;

    return (
        <fieldset className="grid gap-4 border p-4">
            <legend className="px-1 font-medium">{t("adminProductListings.fields.text")}</legend>
            <p className="text-sm text-muted-foreground">
                {t("adminProductListings.edit.textHelp")}
            </p>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
                <div className="grid content-start gap-2">
                    <Label htmlFor="admin-product-listing-title">
                        {t("adminProductListings.fields.originalTitle")}
                    </Label>
                    <Input
                        id="admin-product-listing-title"
                        autoComplete="off"
                        disabled={disabled}
                        {...form.register("title")}
                    />
                    <p className="text-xs text-muted-foreground">
                        {t("adminProductListings.edit.titleHelp")}
                    </p>
                </div>
                <TextLanguageField
                    form={form}
                    name="titleLanguage"
                    label={t("adminProductListings.fields.titleLanguage")}
                    disabled={disabled}
                    error={errors.titleLanguage?.message}
                />
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
                <div className="grid content-start gap-2">
                    <Label htmlFor="admin-product-listing-description">
                        {t("adminProductListings.fields.originalDescription")}
                    </Label>
                    <Textarea
                        id="admin-product-listing-description"
                        className="min-h-32"
                        disabled={disabled}
                        {...form.register("description")}
                    />
                </div>
                <TextLanguageField
                    form={form}
                    name="descriptionLanguage"
                    label={t("adminProductListings.fields.descriptionLanguage")}
                    disabled={disabled}
                    error={errors.descriptionLanguage?.message}
                />
            </div>
        </fieldset>
    );
}

function TextLanguageField({
    form,
    name,
    label,
    disabled,
    error,
}: {
    readonly form: UseFormReturn<AdminProductListingFormValues>;
    readonly name: "titleLanguage" | "descriptionLanguage";
    readonly label: string;
    readonly disabled: boolean;
    readonly error?: string;
}) {
    const { t } = useTranslation();
    const language = useController({ control: form.control, name }).field;
    const id = `admin-product-listing-${name}`;
    const unsupported = language.value !== "" && !isSourceTextLanguage(language.value);

    return (
        <div className="grid content-start gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Select
                value={language.value || "unset"}
                onValueChange={(value) => language.onChange(value === "unset" ? "" : value)}
                disabled={disabled}
            >
                <SelectTrigger id={id} aria-invalid={error ? true : undefined}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="unset">
                        {t("adminProductListings.fields.chooseLanguage")}
                    </SelectItem>
                    {unsupported && (
                        <SelectItem value={language.value} disabled>
                            {language.value.toUpperCase()}
                        </SelectItem>
                    )}
                    {SOURCE_TEXT_LANGUAGES.map((code) => (
                        <SelectItem key={code} value={code}>
                            {code.toUpperCase()}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <FormFieldError message={error} />
        </div>
    );
}

function PricingFields({
    form,
    disabled,
}: {
    readonly form: UseFormReturn<AdminProductListingFormValues>;
    readonly disabled: boolean;
}) {
    const { t } = useTranslation();
    const priceKind = useController({ control: form.control, name: "priceKind" }).field;
    const errors = form.formState.errors;

    return (
        <fieldset className="grid gap-4 border p-4">
            <legend className="px-1 font-medium">{t("adminProductListings.fields.pricing")}</legend>
            <p className="text-sm text-muted-foreground">
                {t("adminProductListings.edit.pricingHelp")}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid content-start gap-2">
                    <Label htmlFor="admin-product-listing-price-kind">
                        {t("adminProductListings.fields.price")}
                    </Label>
                    <Select
                        value={priceKind.value}
                        onValueChange={priceKind.onChange}
                        disabled={disabled}
                    >
                        <SelectTrigger id="admin-product-listing-price-kind">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ADMIN_PRODUCT_LISTING_PRICE_KINDS.map((kind) => (
                                <SelectItem key={kind} value={kind}>
                                    {t(`adminProductListings.priceKinds.${kind}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {priceKind.value === "MONETARY" && (
                    <MoneyFields
                        form={form}
                        amountName="priceAmount"
                        currencyName="priceCurrency"
                        amountLabel={t("adminProductListings.fields.priceAmount")}
                        disabled={disabled}
                        amountError={errors.priceAmount?.message}
                        currencyError={errors.priceCurrency?.message}
                    />
                )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-4 sm:grid-cols-2">
                    <MoneyFields
                        form={form}
                        amountName="estimateMinAmount"
                        currencyName="estimateMinCurrency"
                        amountLabel={t("adminProductListings.fields.estimateMin")}
                        disabled={disabled}
                        amountError={errors.estimateMinAmount?.message}
                        currencyError={errors.estimateMinCurrency?.message}
                    />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <MoneyFields
                        form={form}
                        amountName="estimateMaxAmount"
                        currencyName="estimateMaxCurrency"
                        amountLabel={t("adminProductListings.fields.estimateMax")}
                        disabled={disabled}
                        amountError={errors.estimateMaxAmount?.message}
                        currencyError={errors.estimateMaxCurrency?.message}
                    />
                </div>
            </div>
            <p className="text-sm text-muted-foreground">
                {t("adminProductListings.edit.estimateHelp")}
            </p>
        </fieldset>
    );
}

function MoneyFields({
    form,
    amountName,
    currencyName,
    amountLabel,
    disabled,
    amountError,
    currencyError,
}: {
    readonly form: UseFormReturn<AdminProductListingFormValues>;
    readonly amountName: "priceAmount" | "estimateMinAmount" | "estimateMaxAmount";
    readonly currencyName: "priceCurrency" | "estimateMinCurrency" | "estimateMaxCurrency";
    readonly amountLabel: string;
    readonly disabled: boolean;
    readonly amountError?: string;
    readonly currencyError?: string;
}) {
    const { t } = useTranslation();
    const currency = useController({ control: form.control, name: currencyName }).field;
    const amountId = `admin-product-listing-${amountName}`;
    const currencyId = `admin-product-listing-${currencyName}`;

    return (
        <>
            <div className="grid content-start gap-2">
                <Label htmlFor={amountId}>{amountLabel}</Label>
                <Input
                    id={amountId}
                    inputMode="decimal"
                    autoComplete="off"
                    disabled={disabled}
                    aria-invalid={amountError ? true : undefined}
                    {...form.register(amountName)}
                />
                <FormFieldError message={amountError} />
            </div>
            <div className="grid content-start gap-2">
                <Label htmlFor={currencyId}>{t("adminProductListings.fields.currency")}</Label>
                <Select
                    value={currency.value || "unset"}
                    onValueChange={(value) => currency.onChange(value === "unset" ? "" : value)}
                    disabled={disabled}
                >
                    <SelectTrigger id={currencyId} aria-invalid={currencyError ? true : undefined}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unset">
                            {t("adminProductListings.fields.chooseCurrency")}
                        </SelectItem>
                        {CURRENCIES.map((code) => (
                            <SelectItem key={code} value={code}>
                                {code}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormFieldError message={currencyError} />
            </div>
        </>
    );
}

function AvailabilityField({
    form,
    disabled,
    unrecognized,
}: {
    readonly form: UseFormReturn<AdminProductListingFormValues>;
    readonly disabled: boolean;
    readonly unrecognized: boolean;
}) {
    const { t } = useTranslation();
    const availability = useController({ control: form.control, name: "availability" }).field;

    return (
        <div className="grid content-start gap-2">
            <Label htmlFor="admin-product-listing-availability">
                {t("adminProductListings.fields.availability")}
            </Label>
            <Select
                value={availability.value || "unset"}
                onValueChange={(value) => availability.onChange(value === "unset" ? "" : value)}
                disabled={disabled}
            >
                <SelectTrigger id="admin-product-listing-availability">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="unset">
                        {t("adminProductListings.fields.notAsserted")}
                    </SelectItem>
                    {unrecognized && (
                        <SelectItem value="UNKNOWN" disabled>
                            {t("adminProductListings.fields.unrecognized")}
                        </SelectItem>
                    )}
                    {LISTING_AVAILABILITIES.map((value) => (
                        <SelectItem key={value} value={value}>
                            {t(LISTING_AVAILABILITY_TRANSLATION_KEYS[value])}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
                {t("adminProductListings.edit.availabilityHelp")}
            </p>
            <FormFieldError message={form.formState.errors.availability?.message} />
        </div>
    );
}
