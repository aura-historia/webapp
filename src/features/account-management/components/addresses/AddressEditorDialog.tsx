import { CircleAlert, Navigation, Trash2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
    getSubdivisionCountry,
    listCountryCodes,
    listSubdivisionCodes,
    parseCountryCode,
    parseSubdivisionCode,
} from "@/data/internal/geography/GeographicCodes.ts";
import type { UserAddress } from "@/data/internal/geography/UserAddress.ts";
import { PreferenceField } from "@/features/account-management/components/PreferenceField.tsx";
import { ResolutionMark } from "@/features/account-management/components/addresses/SavedAddressRow.tsx";
import {
    useCreateUserAddress,
    UserAddressRequestError,
    useUpdateUserAddress,
} from "@/features/account-management/hooks/useUserAddresses.ts";
import {
    FIELD_CLASS,
    FIELD_MESSAGE_CLASS,
    GROUP_LABEL_CLASS,
    LABEL_CLASS,
} from "@/features/account-management/lib/accountStyles.ts";
import {
    formatGeographyFacts,
    resolutionCopyKeys,
} from "@/features/account-management/lib/addressResolution.ts";
import {
    ADDRESS_DIALOG_BUTTON_CLASS,
    ADDRESS_META_LABEL_CLASS,
    addressAlertClass,
} from "@/features/account-management/lib/addressStyles.ts";
import {
    buildUserAddressInput,
    firstInvalidField,
    toUserAddressFormValues,
    type UserAddressFormErrors,
    type UserAddressFormField,
    type UserAddressFormValues,
    validateUserAddressForm,
} from "@/features/account-management/lib/userAddressForm.ts";
import { GeographyAttribution } from "@/features/geography/components/GeographyAttribution.tsx";
import { GeographyDisclosure } from "@/features/geography/components/GeographyDisclosure.tsx";
import { formatCountryName } from "@/features/geography/lib/formatGeography.ts";
import { cn } from "@/lib/utils.ts";

const FIELD_IDS: Record<UserAddressFormField, string> = {
    label: "address-label",
    addressText: "address-text",
    country: "address-country",
    subdivision: "address-region",
    postalCode: "address-postal-code",
};

interface AddressEditorDialogProps {
    readonly viewerCacheKey: string;
    /** The address to edit; absent when adding one. */
    readonly address?: UserAddress;
    readonly onClose: () => void;
    readonly onDelete: (address: UserAddress) => void;
}

/**
 * Add or edit a saved address (board "Account · Address editor — add & edit dialog"). Mount it
 * for one editing session: the draft lives only as long as the dialog.
 */
export function AddressEditorDialog({
    viewerCacheKey,
    address,
    onClose,
    onDelete,
}: AddressEditorDialogProps) {
    const { t } = useTranslation();
    const isEdit = address !== undefined;
    const [values, setValues] = useState<UserAddressFormValues>(() =>
        toUserAddressFormValues(address),
    );
    const [errors, setErrors] = useState<UserAddressFormErrors>({});
    const create = useCreateUserAddress(viewerCacheKey);
    const update = useUpdateUserAddress(viewerCacheKey);

    const mutation = isEdit ? update : create;
    const reconciliation = create.reconciliation.status;
    const busy = mutation.isPending || reconciliation === "refreshing";
    // Omitted unsupported values would be erased by a replacing write.
    const unsupported = isEdit && address.geography.hasUnsupportedValues;
    const failedError = mutation.error instanceof UserAddressRequestError ? mutation.error : null;
    const showSaveError =
        failedError !== null &&
        !failedError.isConflict &&
        !failedError.isNotFound &&
        !(!isEdit && failedError.isIndefinite);
    const saveBlocked = busy || unsupported || reconciliation === "failed";

    const set = (field: UserAddressFormField, value: string) => {
        setValues((current) => ({ ...current, [field]: value }));
        if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const close = () => {
        if (!busy) onClose();
    };

    const handleAccessLoss = (error: Error) => {
        // The section shows the access panel once its addresses are reset.
        if (error instanceof UserAddressRequestError && error.isAccessLoss) onClose();
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saveBlocked) return;
        const nextErrors = validateUserAddressForm(values);
        const invalid = firstInvalidField(nextErrors);
        setErrors(nextErrors);
        if (invalid) {
            document.getElementById(FIELD_IDS[invalid])?.focus();
            return;
        }
        const input = buildUserAddressInput(values);
        if (isEdit) {
            update.mutate(
                {
                    addressId: address.addressId,
                    input,
                    expectedVersion: update.conflict?.current.version ?? address.version,
                },
                {
                    onSuccess: () => {
                        toast.success(t("account.addresses.toasts.updated"));
                        onClose();
                    },
                    onError: handleAccessLoss,
                },
            );
        } else {
            create.mutate(input, {
                onSuccess: () => {
                    toast.success(t("account.addresses.toasts.saved"));
                    onClose();
                },
                onError: handleAccessLoss,
            });
        }
    };

    let saveLabel = isEdit
        ? t("account.addresses.editor.saveChanges")
        : t("account.addresses.editor.save");
    if (mutation.isPending) saveLabel = t("account.addresses.editor.saving");
    else if (update.conflict) saveLabel = t("account.addresses.editor.saveMyVersion");
    else if (reconciliation === "refreshed") saveLabel = t("account.addresses.editor.saveAgain");

    return (
        <Dialog open onOpenChange={(open) => !open && close()}>
            <DialogContent
                closeLabel={t("account.addresses.editor.close")}
                onInteractOutside={(event) => busy && event.preventDefault()}
                onEscapeKeyDown={(event) => busy && event.preventDefault()}
                className="max-h-[calc(100dvh-2rem)] gap-6 overflow-y-auto p-8 sm:max-w-[600px] max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[calc(100dvh-2.5rem)] max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none max-sm:px-5 max-sm:pt-6 max-sm:pb-7"
            >
                <div className="flex flex-col gap-2 pr-8 text-left">
                    <span className={GROUP_LABEL_CLASS}>
                        {t("account.addresses.editor.eyebrow")}
                    </span>
                    <DialogTitle className="text-[28px] leading-[1.12]">
                        {isEdit
                            ? t("account.addresses.editor.editTitle")
                            : t("account.addresses.editor.createTitle")}
                    </DialogTitle>
                    {isEdit && address.preferred && !update.missing ? (
                        <DialogDescription className="flex items-center gap-2 text-[13px]">
                            <Navigation
                                aria-hidden="true"
                                className="size-3 shrink-0"
                                strokeWidth={2.2}
                            />
                            {t("account.addresses.editor.preferredNote")}
                        </DialogDescription>
                    ) : (
                        <DialogDescription className="sr-only">
                            {t("account.addresses.description")}
                        </DialogDescription>
                    )}
                </div>

                {update.missing ? (
                    <MissingAddressNotice onClose={onClose} />
                ) : (
                    <form noValidate onSubmit={submit} className="flex flex-col gap-6">
                        <AddressFields
                            values={values}
                            errors={errors}
                            disabled={busy || unsupported}
                            onChange={set}
                        />

                        {isEdit && <LocationPanel address={address} />}

                        {unsupported && (
                            <InlineAlert
                                tone="neutral"
                                title={t("account.addresses.editor.unsupported.title")}
                                body={t("account.addresses.editor.unsupported.body")}
                            />
                        )}
                        {update.conflict && <ConflictNotice current={update.conflict.current} />}
                        {!isEdit && reconciliation !== "idle" && (
                            <UncertainCreateNotice
                                status={reconciliation}
                                onCheckAgain={() => void create.refresh()}
                            />
                        )}
                        {showSaveError && (
                            <InlineAlert
                                tone="danger"
                                title={t("account.addresses.editor.saveError.title")}
                                body={t("account.addresses.editor.saveError.body")}
                            />
                        )}

                        <GeographyDisclosure
                            kind="privateAddress"
                            className="text-xs leading-relaxed text-ink-muted"
                        />

                        <div className="flex flex-col-reverse gap-3 border-t border-line-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
                            {isEdit ? (
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => onDelete(address)}
                                    className={cn(
                                        ADDRESS_DIALOG_BUTTON_CLASS,
                                        "px-1.5 text-oxblood",
                                    )}
                                >
                                    <Trash2
                                        aria-hidden="true"
                                        className="size-[15px]"
                                        strokeWidth={1.8}
                                    />
                                    {t("account.addresses.editor.delete")}
                                </button>
                            ) : (
                                <span aria-hidden="true" />
                            )}
                            <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={close}
                                    className={cn(
                                        ADDRESS_DIALOG_BUTTON_CLASS,
                                        "h-12 px-[22px] text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
                                    )}
                                >
                                    {t("account.addresses.editor.cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveBlocked}
                                    className={cn(
                                        ADDRESS_DIALOG_BUTTON_CLASS,
                                        "h-12 bg-ink px-6 text-[15px] text-surface",
                                    )}
                                >
                                    {mutation.isPending && <Spinner className="size-4" />}
                                    {saveLabel}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

function AddressFields({
    values,
    errors,
    disabled,
    onChange,
}: {
    readonly values: UserAddressFormValues;
    readonly errors: UserAddressFormErrors;
    readonly disabled: boolean;
    readonly onChange: (field: UserAddressFormField, value: string) => void;
}) {
    const { t, i18n } = useTranslation();
    const errorText = (field: UserAddressFormField) => {
        const key = errors[field];
        return key ? t(key) : undefined;
    };
    const describedBy = (field: UserAddressFormField) => `${FIELD_IDS[field]}-message`;

    const country = parseCountryCode(values.country);
    const countryOptions = useMemo(
        () => [
            { value: "", label: t("account.addresses.editor.noCountry") },
            ...listCountryCodes()
                .map((code) => ({
                    value: code,
                    label: formatCountryName(code, i18n.language),
                    detail: code,
                }))
                .sort((left, right) => left.label.localeCompare(right.label, i18n.language)),
        ],
        [i18n.language, t],
    );
    const regionOptions = useMemo(
        () =>
            country
                ? [
                      { value: "", label: t("account.addresses.editor.noRegion") },
                      ...listSubdivisionCodes(country).map((code) => ({
                          value: code,
                          label: code,
                      })),
                  ]
                : [],
        [country, t],
    );

    const changeCountry = (next: string) => {
        onChange("country", next);
        const subdivision = parseSubdivisionCode(values.subdivision);
        if (subdivision && getSubdivisionCountry(subdivision) !== next) onChange("subdivision", "");
    };

    return (
        <>
            <TextField
                id={FIELD_IDS.label}
                label={t("account.addresses.editor.fields.label")}
                hint={t("account.addresses.editor.fields.labelHint")}
                error={errorText("label")}
            >
                <input
                    id={FIELD_IDS.label}
                    type="text"
                    value={values.label}
                    disabled={disabled}
                    autoComplete="off"
                    placeholder={t("account.addresses.editor.fields.labelPlaceholder")}
                    aria-invalid={Boolean(errors.label)}
                    aria-describedby={describedBy("label")}
                    onChange={(event) => onChange("label", event.target.value)}
                    className={FIELD_CLASS}
                />
            </TextField>

            <TextField
                id={FIELD_IDS.addressText}
                label={t("account.addresses.editor.fields.address")}
                hint={t("account.addresses.editor.fields.addressHint")}
                error={errorText("addressText")}
            >
                <textarea
                    id={FIELD_IDS.addressText}
                    rows={3}
                    value={values.addressText}
                    disabled={disabled}
                    autoComplete="street-address"
                    placeholder={t("account.addresses.editor.fields.addressPlaceholder")}
                    aria-invalid={Boolean(errors.addressText)}
                    aria-describedby={describedBy("addressText")}
                    onChange={(event) => onChange("addressText", event.target.value)}
                    className={cn(FIELD_CLASS, "h-auto min-h-[104px] resize-y py-3 leading-normal")}
                />
            </TextField>

            <fieldset className="flex flex-col gap-3.5" aria-describedby="address-optional-hint">
                <legend className={cn(GROUP_LABEL_CLASS, "mb-1")}>
                    {t("account.addresses.editor.optional")}
                </legend>
                <p id="address-optional-hint" className="-mt-1 text-[13px] text-ink-secondary">
                    {t("account.addresses.editor.optionalHint")}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <PreferenceField
                        id={FIELD_IDS.country}
                        label={t("account.addresses.editor.fields.country")}
                        placeholder={t("account.addresses.editor.noCountry")}
                        value={values.country}
                        options={countryOptions}
                        onChange={changeCountry}
                        disabled={disabled}
                        error={errorText("country")}
                        search={{
                            label: t("account.addresses.editor.searchCountries"),
                            placeholder: t("account.addresses.editor.searchCountriesPlaceholder"),
                            emptyMessage: t("account.addresses.editor.noCountries"),
                        }}
                        menuClassName="min-w-[280px]"
                    />
                    <PreferenceField
                        id={FIELD_IDS.subdivision}
                        label={t("account.addresses.editor.fields.region")}
                        placeholder={t("account.addresses.editor.noRegion")}
                        value={values.subdivision}
                        options={regionOptions}
                        onChange={(next) => onChange("subdivision", next)}
                        disabled={disabled || !country}
                        error={errorText("subdivision")}
                        hint={
                            country ? undefined : t("account.addresses.editor.chooseCountryFirst")
                        }
                        search={{
                            label: t("account.addresses.editor.searchRegions"),
                            placeholder: t("account.addresses.editor.searchRegionsPlaceholder"),
                            emptyMessage: t("account.addresses.editor.noRegions"),
                        }}
                        menuClassName="min-w-[260px]"
                    />
                    <TextField
                        id={FIELD_IDS.postalCode}
                        label={t("account.addresses.editor.fields.postalCode")}
                        error={errorText("postalCode")}
                    >
                        <input
                            id={FIELD_IDS.postalCode}
                            type="text"
                            value={values.postalCode}
                            disabled={disabled}
                            autoComplete="postal-code"
                            aria-invalid={Boolean(errors.postalCode)}
                            aria-describedby={
                                errors.postalCode ? describedBy("postalCode") : undefined
                            }
                            onChange={(event) => onChange("postalCode", event.target.value)}
                            className={FIELD_CLASS}
                        />
                    </TextField>
                </div>
            </fieldset>
        </>
    );
}

function TextField({
    id,
    label,
    hint,
    error,
    children,
}: {
    readonly id: string;
    readonly label: string;
    readonly hint?: string;
    readonly error?: string;
    readonly children: React.ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={id} data-error={Boolean(error)} className={LABEL_CLASS}>
                {label}
            </label>
            {children}
            {error ? (
                <p
                    id={`${id}-message`}
                    role="alert"
                    className={cn(FIELD_MESSAGE_CLASS, "flex items-center gap-1.5")}
                >
                    <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
                    {error}
                </p>
            ) : (
                hint && (
                    <p id={`${id}-message`} className="text-meta text-ink-muted">
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}

/** Provider-derived state, kept apart from what the user entered. */
function LocationPanel({ address }: { readonly address: UserAddress }) {
    const { t, i18n } = useTranslation();
    const { status, derivedGeography, attribution } = address.resolution;
    const derived = status === "ACCEPTED" ? derivedGeography : undefined;
    const rows = derived
        ? [
              {
                  key: "country",
                  value: derived.country && formatCountryName(derived.country, i18n.language),
              },
              { key: "region", value: derived.subdivision },
              { key: "postalCode", value: derived.postalCode },
          ].filter((row) => row.value)
        : [];

    return (
        <section
            aria-labelledby="address-location-heading"
            className="flex flex-col gap-3 rounded-lg bg-surface-sunken p-[18px]"
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3
                    id="address-location-heading"
                    className={cn(ADDRESS_META_LABEL_CLASS, "text-[11px] font-normal")}
                >
                    {t("account.addresses.location")}
                </h3>
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                    <ResolutionMark status={status} />
                    {t(`account.addresses.status.${status}.label`)}
                </span>
            </div>
            <p className="text-[13px] leading-[1.55] text-ink-secondary">
                {t(resolutionCopyKeys(status, address.geography).note)}
            </p>
            {rows.length > 0 && (
                <>
                    <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 text-sm">
                        {rows.map((row) => (
                            <div key={row.key} className="contents">
                                <dt
                                    className={cn(
                                        ADDRESS_META_LABEL_CLASS,
                                        "flex items-center border-t border-line-subtle py-2",
                                    )}
                                >
                                    {t(`account.addresses.derived.${row.key}`)}
                                </dt>
                                <dd className="border-t border-line-subtle py-2 wrap-anywhere">
                                    {row.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <GeographyAttribution attribution={attribution} className="text-ink-muted" />
                </>
            )}
            <p className="border-t border-line-subtle pt-2.5 text-xs leading-[1.55] text-ink-muted">
                {t("account.addresses.locationNote")}
            </p>
        </section>
    );
}

function InlineAlert({
    tone,
    title,
    body,
    children,
}: {
    readonly tone: "danger" | "neutral";
    readonly title: string;
    readonly body: string;
    readonly children?: React.ReactNode;
}) {
    return (
        <div role={tone === "danger" ? "alert" : "status"} className={addressAlertClass(tone)}>
            <CircleAlert
                aria-hidden="true"
                className={cn(
                    "mt-0.5 size-[18px] shrink-0",
                    tone === "danger" ? "text-oxblood" : "text-ink-muted",
                )}
                strokeWidth={1.8}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="font-medium">{title}</p>
                <p className="leading-[1.55] text-ink-secondary">{body}</p>
                {children}
            </div>
        </div>
    );
}

function ConflictNotice({ current }: { readonly current: UserAddress }) {
    const { t, i18n } = useTranslation();
    const facts = formatGeographyFacts(current.geography, i18n.language);
    return (
        <InlineAlert
            tone="danger"
            title={t("account.addresses.editor.conflict.title")}
            body={t("account.addresses.editor.conflict.body")}
        >
            <div className="mt-2 flex flex-col gap-1 rounded-md bg-surface-sunken px-3.5 py-3">
                <span className={ADDRESS_META_LABEL_CLASS}>
                    {t("account.addresses.editor.conflict.saved")}
                </span>
                <span className="font-medium wrap-anywhere">{current.label}</span>
                {current.geography.addressText && (
                    <span className="whitespace-pre-line text-ink-secondary wrap-anywhere">
                        {current.geography.addressText}
                    </span>
                )}
                {facts && <span className="text-[13px] text-ink-muted">{facts}</span>}
            </div>
        </InlineAlert>
    );
}

function UncertainCreateNotice({
    status,
    onCheckAgain,
}: {
    readonly status: "refreshing" | "refreshed" | "failed";
    readonly onCheckAgain: () => void;
}) {
    const { t } = useTranslation();
    if (status === "refreshing") {
        return (
            <div role="status" className={addressAlertClass("neutral")}>
                <Spinner className="mt-0.5 size-[18px] shrink-0 text-ink-muted" />
                <div className="flex flex-col gap-1">
                    <p className="font-medium">
                        {t("account.addresses.editor.uncertain.checkingTitle")}
                    </p>
                    <p className="leading-[1.55] text-ink-secondary">
                        {t("account.addresses.editor.uncertain.checkingBody")}
                    </p>
                </div>
            </div>
        );
    }
    if (status === "refreshed") {
        return (
            <InlineAlert
                tone="neutral"
                title={t("account.addresses.editor.uncertain.checkedTitle")}
                body={t("account.addresses.editor.uncertain.checkedBody")}
            />
        );
    }
    return (
        <InlineAlert
            tone="danger"
            title={t("account.addresses.editor.uncertain.failedTitle")}
            body={t("account.addresses.editor.uncertain.failedBody")}
        >
            <button
                type="button"
                onClick={onCheckAgain}
                className={cn(
                    ADDRESS_DIALOG_BUTTON_CLASS,
                    "mt-1.5 h-10 self-start px-[18px] text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
                )}
            >
                {t("account.addresses.editor.uncertain.checkAgain")}
            </button>
        </InlineAlert>
    );
}

function MissingAddressNotice({ onClose }: { readonly onClose: () => void }) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-4">
            <InlineAlert
                tone="danger"
                title={t("account.addresses.editor.missing.title")}
                body={t("account.addresses.editor.missing.body")}
            />
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className={cn(ADDRESS_DIALOG_BUTTON_CLASS, "bg-ink px-[22px] text-surface")}
                >
                    {t("account.addresses.editor.close")}
                </button>
            </div>
        </div>
    );
}
