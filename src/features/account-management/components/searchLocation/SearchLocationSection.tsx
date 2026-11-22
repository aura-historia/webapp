import { Link } from "@tanstack/react-router";
import { CircleAlert, Info, Lock, MapPin, Plus, TriangleAlert } from "lucide-react";
import { type FormEvent, type ReactNode, useId, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
    isBoundedSingleLine,
    MAX_POSTAL_CODE_BYTES,
} from "@/data/internal/geography/GeographicAssertions.ts";
import { listCountryCodes, parseCountryCode } from "@/data/internal/geography/GeographicCodes.ts";
import type {
    BrowsingDestination,
    BrowsingDestinationView,
    UserAddress,
    WritableBrowsingDestination,
} from "@/data/internal/geography/UserAddress.ts";
import { AddressEditorDialog } from "@/features/account-management/components/addresses/AddressEditorDialog.tsx";
import { NotLocatedMark } from "@/features/account-management/components/addresses/SavedAddressRow.tsx";
import { PreferenceField } from "@/features/account-management/components/PreferenceField.tsx";
import {
    useBrowsingDestination,
    useSetBrowsingDestination,
} from "@/features/account-management/hooks/useBrowsingDestination.ts";
import {
    UserAddressRequestError,
    useUserAddressDetail,
    useUserAddressList,
} from "@/features/account-management/hooks/useUserAddresses.ts";
import {
    CARD_CLASS,
    FIELD_CLASS,
    FIELD_MESSAGE_CLASS,
    FOCUS_CLASS,
    GROUP_LABEL_CLASS,
    LABEL_CLASS,
    PRIMARY_BUTTON_CLASS,
} from "@/features/account-management/lib/accountStyles.ts";
import { locationDisplay } from "@/features/account-management/lib/addressResolution.ts";
import {
    ADDRESS_PRIMARY_BUTTON_CLASS,
    ADDRESS_ROW_BUTTON_CLASS,
    addressAlertClass,
} from "@/features/account-management/lib/addressStyles.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { formatCountryName } from "@/features/geography/lib/formatGeography.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

type Choice = Exclude<BrowsingDestination["kind"], "UNSUPPORTED">;
const CHOICES: readonly Choice[] = ["NONE", "ADDRESS", "COUNTRY_POSTAL"];

/** The form's state. Every choice keeps its own fields while another one is selected. */
type Draft = {
    /** Absent while nothing is chosen (an unsupported saved value). */
    readonly kind?: Choice;
    readonly addressId: string;
    readonly country: string;
    readonly postalCode: string;
};

type FieldError = "addressRequired" | "countryRequired" | "postalCodeInvalid";

const FIELD_IDS = {
    address: "search-location-address",
    country: "search-location-country",
    postalCode: "search-location-postal-code",
} as const;

function draftFrom(destination: BrowsingDestination): Draft {
    const empty = { addressId: "", country: "", postalCode: "" };
    switch (destination.kind) {
        case "NONE":
            return { ...empty, kind: "NONE" };
        case "ADDRESS":
            return { ...empty, kind: "ADDRESS", addressId: destination.addressId };
        case "COUNTRY_POSTAL":
            return {
                ...empty,
                kind: "COUNTRY_POSTAL",
                country: destination.country,
                postalCode: destination.postalCode ?? "",
            };
        case "UNSUPPORTED":
            return empty;
    }
}

function sameDraft(left: Draft, right: Draft): boolean {
    if (left.kind !== right.kind) return false;
    if (left.kind === "ADDRESS") return left.addressId === right.addressId;
    if (left.kind === "COUNTRY_POSTAL") {
        return left.country === right.country && left.postalCode === right.postalCode;
    }
    return true;
}

/** The destination to send, or the first invalid field. Values are sent exactly as entered. */
function toDestination(
    draft: Draft,
): { destination: WritableBrowsingDestination } | { error: FieldError } | undefined {
    switch (draft.kind) {
        case undefined:
            return undefined;
        case "NONE":
            return { destination: { kind: "NONE" } };
        case "ADDRESS":
            return draft.addressId
                ? { destination: { kind: "ADDRESS", addressId: draft.addressId } }
                : { error: "addressRequired" };
        case "COUNTRY_POSTAL": {
            const country = parseCountryCode(draft.country);
            if (!country) return { error: "countryRequired" };
            const hasPostalCode = draft.postalCode.trim() !== "";
            if (hasPostalCode && !isBoundedSingleLine(draft.postalCode, MAX_POSTAL_CODE_BYTES)) {
                return { error: "postalCodeInvalid" };
            }
            return {
                destination: {
                    kind: "COUNTRY_POSTAL",
                    country,
                    ...(hasPostalCode ? { postalCode: draft.postalCode } : {}),
                },
            };
        }
    }
}

/**
 * The account page's search location card (board "Account · Search location section"): the
 * browsing destination as none, one of the user's own saved addresses, or a country with an
 * optional postal code. It never asserts residence, billing or delivery and never changes search
 * criteria.
 */
export function SearchLocationSection() {
    const { user } = useResolvedAuth();
    // A different viewer never sees another viewer's destination or draft.
    return user ? (
        <SearchLocationCard key={user.userId} viewerCacheKey={user.userId} />
    ) : (
        <div className={CARD_CLASS}>
            <CardSkeleton />
        </div>
    );
}

function SearchLocationCard({ viewerCacheKey }: { readonly viewerCacheKey: string }) {
    const query = useBrowsingDestination(viewerCacheKey);
    const accessLost = query.error instanceof UserAddressRequestError && query.error.isAccessLoss;

    let body: ReactNode;
    if (query.data) {
        body = <SearchLocationForm viewerCacheKey={viewerCacheKey} view={query.data} />;
    } else if (accessLost) body = <AccessLostPanel />;
    else if (query.isError) body = <LoadErrorPanel onRetry={() => void query.refetch()} />;
    else body = <CardSkeleton />;

    return <div className={CARD_CLASS}>{body}</div>;
}

function SearchLocationForm({
    viewerCacheKey,
    view,
}: {
    readonly viewerCacheKey: string;
    readonly view: BrowsingDestinationView;
}) {
    const { t, i18n } = useTranslation();
    const save = useSetBrowsingDestination(viewerCacheKey);
    const list = useUserAddressList(viewerCacheKey);
    const addresses = useMemo(
        () => list.data?.pages.flatMap((page) => page.items) ?? [],
        [list.data],
    );

    const [draft, setDraft] = useState<Draft>(() => draftFrom(view.destination));
    const [base, setBase] = useState(view);
    const [fieldError, setFieldError] = useState<FieldError>();
    const [cleared, setCleared] = useState(false);
    const [creating, setCreating] = useState(false);

    // A newer saved value replaces an untouched form; after a conflict the user's choice is kept.
    // A saved address that turns into none without a save here was deleted.
    if (view !== base) {
        if (sameDraft(draft, draftFrom(base.destination))) setDraft(draftFrom(view.destination));
        if (
            !save.isOwnSave(view) &&
            base.destination.kind === "ADDRESS" &&
            view.destination.kind === "NONE"
        ) {
            setCleared(true);
        }
        setBase(view);
    }

    // The saved address, also when it sits on a page that is not loaded yet.
    const savedAddressId =
        view.destination.kind === "ADDRESS" ? view.destination.addressId : undefined;
    const listedSavedAddress = addresses.find((address) => address.addressId === savedAddressId);
    const detail = useUserAddressDetail(
        viewerCacheKey,
        savedAddressId && !listedSavedAddress && !list.isPending ? savedAddressId : undefined,
    );
    const savedAddress = listedSavedAddress ?? detail.data;
    const savedAddressGone =
        detail.error instanceof UserAddressRequestError && detail.error.isNotFound;

    const options = useMemo(() => {
        const all =
            savedAddress && !addresses.some((item) => item.addressId === savedAddress.addressId)
                ? [savedAddress, ...addresses]
                : addresses;
        return all.map((address) => {
            const notLocated = locationDisplay(address.resolution.status) === "notLocated";
            return {
                value: address.addressId,
                label: address.label,
                description: address.geography.addressText ?? "",
                ...(notLocated
                    ? {
                          detail: t("account.searchLocation.address.notLocated"),
                          detailMark: <NotLocatedMark />,
                      }
                    : {}),
            };
        });
    }, [addresses, savedAddress, t]);

    const countryOptions = useMemo(
        () =>
            listCountryCodes()
                .map((code) => ({
                    value: code,
                    label: formatCountryName(code, i18n.language),
                    detail: code,
                }))
                .sort((left, right) => left.label.localeCompare(right.label, i18n.language)),
        [i18n.language],
    );

    const busy = save.isPending;
    const chosenAddress = [savedAddress, ...addresses].find(
        (address) => address?.addressId === draft.addressId,
    );
    const addressGone = save.problem === "addressGone";

    const update = (patch: Partial<Draft>) => {
        setDraft((current) => ({ ...current, ...patch }));
        setFieldError(undefined);
        if (save.problem === "addressGone" || save.problem === "failed") save.clearProblem();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (busy) return;
        const result = toDestination(draft);
        if (!result) {
            document.querySelector<HTMLInputElement>('input[name="search-location-kind"]')?.focus();
            return;
        }
        if ("error" in result) {
            setFieldError(result.error);
            const id =
                result.error === "addressRequired"
                    ? FIELD_IDS.address
                    : result.error === "countryRequired"
                      ? FIELD_IDS.country
                      : FIELD_IDS.postalCode;
            document.getElementById(id)?.focus();
            return;
        }
        save.mutate(
            { destination: result.destination, expectedVersion: view.version },
            {
                onSuccess: (saved) => {
                    setCleared(false);
                    setDraft(draftFrom(saved.destination));
                    toast.success(
                        t(
                            saved.destination.kind === "NONE"
                                ? "account.searchLocation.toasts.cleared"
                                : "account.searchLocation.toasts.saved",
                        ),
                    );
                },
            },
        );
    };

    if (save.problem === "accessLost") return <AccessLostPanel />;

    const unsupported = view.destination.kind === "UNSUPPORTED";
    let notice: string | undefined;
    if (unsupported) notice = t("account.searchLocation.notice.unsupported");
    else if (savedAddressGone) notice = t("account.searchLocation.notice.unavailable");
    else if (cleared && view.destination.kind === "NONE") {
        notice = t("account.searchLocation.notice.cleared");
    }

    const addressError = addressGone
        ? t("account.searchLocation.validation.addressGone")
        : fieldError === "addressRequired"
          ? t("account.searchLocation.validation.addressRequired")
          : undefined;

    const addressPanel = (
        <AddressChoicePanel
            listState={
                list.isPending
                    ? "loading"
                    : list.isError && addresses.length === 0
                      ? "error"
                      : options.length === 0
                        ? "empty"
                        : "ready"
            }
            onRetry={() => void list.refetch()}
            onAdd={() => setCreating(true)}
        >
            <PreferenceField
                id={FIELD_IDS.address}
                label={t("account.searchLocation.address.label")}
                placeholder={t("account.searchLocation.address.placeholder")}
                value={draft.addressId || undefined}
                options={options}
                onChange={(addressId) => update({ addressId })}
                ground="page"
                disabled={busy}
                error={addressError}
                hint={
                    chosenAddress &&
                    locationDisplay(chosenAddress.resolution.status) === "notLocated"
                        ? t("account.searchLocation.address.notLocatedHint")
                        : undefined
                }
                menuClassName="w-(--radix-popover-trigger-width) min-w-[min(18rem,calc(100vw-2rem))]"
                sheetOnPhone={{ closeLabel: t("account.searchLocation.close") }}
                footer={
                    list.hasNextPage ? (
                        <button
                            type="button"
                            disabled={list.isFetchingNextPage}
                            onClick={() => void list.fetchNextPage()}
                            className={cn(
                                "mt-0.5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 border-t border-line-subtle text-sm font-medium text-ink disabled:cursor-not-allowed disabled:opacity-60",
                                FOCUS_CLASS,
                            )}
                        >
                            {list.isFetchingNextPage && <Spinner className="size-[15px]" />}
                            {t("account.searchLocation.address.showMore")}
                        </button>
                    ) : undefined
                }
            />
        </AddressChoicePanel>
    );

    const countryPanel = (
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <PreferenceField
                id={FIELD_IDS.country}
                label={t("account.searchLocation.country.label")}
                placeholder={t("account.searchLocation.country.placeholder")}
                value={draft.country || undefined}
                options={countryOptions}
                onChange={(country) => update({ country })}
                ground="page"
                disabled={busy}
                error={
                    fieldError === "countryRequired"
                        ? t("account.searchLocation.validation.countryRequired")
                        : undefined
                }
                search={{
                    label: t("account.searchLocation.country.search"),
                    placeholder: t("account.searchLocation.country.searchPlaceholder"),
                    emptyMessage: t("account.searchLocation.country.noCountries"),
                }}
                sheetOnPhone={{ closeLabel: t("account.searchLocation.close") }}
            />
            <PostalCodeField
                value={draft.postalCode}
                onChange={(postalCode) => update({ postalCode })}
                disabled={busy}
                invalid={fieldError === "postalCodeInvalid"}
            />
        </div>
    );

    const conflict = save.problem === "conflict";

    return (
        <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <CurrentLine
                view={view}
                address={savedAddress}
                addressLoading={Boolean(savedAddressId && !savedAddress && !savedAddressGone)}
                addressGone={savedAddressGone}
            />

            {notice && (
                <div className={cn(addressAlertClass("neutral"), "text-ink-secondary")}>
                    <Info
                        aria-hidden="true"
                        className="mt-0.5 size-[18px] shrink-0 text-ink-muted"
                        strokeWidth={1.8}
                    />
                    <p className="leading-[1.55]">{notice}</p>
                </div>
            )}

            <fieldset disabled={busy} className="flex min-w-0 flex-col gap-3">
                <legend className={cn(GROUP_LABEL_CLASS, "mb-3.5")}>
                    {t("account.searchLocation.legend")}
                </legend>
                {CHOICES.map((choice) => (
                    <ChoiceCard
                        key={choice}
                        choice={choice}
                        checked={draft.kind === choice}
                        description={
                            choice === "ADDRESS" && list.isSuccess && options.length === 0
                                ? t("account.searchLocation.choices.ADDRESS.descriptionEmpty")
                                : t(`account.searchLocation.choices.${choice}.description`)
                        }
                        onSelect={() => update({ kind: choice })}
                    >
                        {choice === "ADDRESS" && addressPanel}
                        {choice === "COUNTRY_POSTAL" && countryPanel}
                    </ChoiceCard>
                ))}
            </fieldset>

            {conflict && (
                <div role="alert" className={addressAlertClass("danger")}>
                    <CircleAlert
                        aria-hidden="true"
                        className="mt-0.5 size-[18px] shrink-0 text-oxblood"
                        strokeWidth={1.8}
                    />
                    <div className="flex flex-col gap-1">
                        <p className="font-medium">{t("account.searchLocation.conflict.title")}</p>
                        <p className="leading-[1.55] text-ink-secondary">
                            {t("account.searchLocation.conflict.body")}
                        </p>
                    </div>
                </div>
            )}
            {save.problem === "failed" && (
                <div role="alert" className={addressAlertClass("danger")}>
                    <CircleAlert
                        aria-hidden="true"
                        className="mt-0.5 size-[18px] shrink-0 text-oxblood"
                        strokeWidth={1.8}
                    />
                    <div className="flex flex-col gap-1">
                        <p className="font-medium">{t("account.searchLocation.saveError.title")}</p>
                        <p className="leading-[1.55] text-ink-secondary">
                            {t("account.searchLocation.saveError.body")}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col items-stretch justify-between gap-4 border-t border-line-subtle pt-5 sm:flex-row sm:items-center sm:gap-6">
                <p className="max-w-[400px] text-meta leading-[1.55] text-ink-muted">
                    {t("account.searchLocation.distinction")}
                </p>
                <button
                    type="submit"
                    disabled={busy}
                    className={cn(PRIMARY_BUTTON_CLASS, "shrink-0")}
                >
                    {busy && <Spinner className="size-4" />}
                    {busy
                        ? t("account.searchLocation.saving")
                        : conflict
                          ? t("account.searchLocation.saveAgain")
                          : t("account.searchLocation.save")}
                </button>
            </div>

            {creating && (
                <AddressEditorDialog
                    viewerCacheKey={viewerCacheKey}
                    onClose={() => setCreating(false)}
                    onDelete={() => undefined}
                />
            )}
        </form>
    );
}

function CurrentLine({
    view,
    address,
    addressLoading,
    addressGone,
}: {
    readonly view: BrowsingDestinationView;
    readonly address: UserAddress | undefined;
    readonly addressLoading: boolean;
    readonly addressGone: boolean;
}) {
    const { t, i18n } = useTranslation();
    const { destination } = view;
    let title: string | undefined;
    let detail: string | undefined;
    let muted = false;
    switch (destination.kind) {
        case "NONE":
            title = t("account.searchLocation.current.none");
            break;
        case "ADDRESS":
            if (address) {
                title = address.label;
                detail = address.geography.addressText;
            } else if (addressGone || !addressLoading) {
                title = t("account.searchLocation.current.unavailable");
                muted = true;
            }
            break;
        case "COUNTRY_POSTAL":
            title = formatCountryName(destination.country, i18n.language);
            detail = destination.postalCode
                ? t("account.searchLocation.current.postalCode", {
                      postalCode: destination.postalCode,
                  })
                : t("account.searchLocation.current.noPostalCode");
            break;
        case "UNSUPPORTED":
            title = t("account.searchLocation.current.unsupported");
            muted = true;
            break;
    }

    return (
        <div role="status" className="flex items-start gap-4 border-b border-line-subtle pb-6">
            <span
                aria-hidden="true"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill bg-surface text-ink shadow-ring"
            >
                <MapPin className="size-[18px]" strokeWidth={1.6} />
            </span>
            <span className="flex min-w-0 flex-col gap-1">
                <span className="font-mono text-[10px] leading-[1.6] tracking-[0.14em] text-ink-muted uppercase">
                    {t("account.searchLocation.currently")}
                </span>
                {title === undefined ? (
                    <span
                        aria-hidden="true"
                        className="my-1 h-5 w-40 animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none"
                    />
                ) : (
                    <span
                        className={cn(
                            "font-serif text-[21px] leading-[1.2] wrap-anywhere sm:text-[24px]",
                            muted ? "text-ink-secondary" : "text-ink",
                        )}
                    >
                        {title}
                    </span>
                )}
                {detail && (
                    <span className="text-body-sm leading-normal wrap-anywhere text-ink-secondary">
                        {detail}
                    </span>
                )}
            </span>
        </div>
    );
}

function ChoiceCard({
    choice,
    checked,
    description,
    onSelect,
    children,
}: {
    readonly choice: Choice;
    readonly checked: boolean;
    readonly description: string;
    readonly onSelect: () => void;
    readonly children?: ReactNode;
}) {
    const { t } = useTranslation();
    const inputId = useId();
    return (
        <div
            className={cn(
                "rounded-lg has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-brass has-[input:focus-visible]:outline-solid",
                checked
                    ? "bg-surface shadow-[inset_0_0_0_2px_var(--ink)]"
                    : "shadow-[inset_0_0_0_1px_var(--line)] hover:bg-surface",
            )}
        >
            <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3.5 p-4">
                <input
                    id={inputId}
                    type="radio"
                    name="search-location-kind"
                    value={choice}
                    checked={checked}
                    onChange={onSelect}
                    className="sr-only"
                />
                <span
                    aria-hidden="true"
                    className={cn(
                        "mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-pill",
                        checked ? "bg-oxblood" : "shadow-[inset_0_0_0_1.5px_var(--line-strong)]",
                    )}
                >
                    {checked && <span className="size-2 rounded-pill bg-on-oxblood" />}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-[15px] leading-[1.4] font-medium">
                        {t(`account.searchLocation.choices.${choice}.title`)}
                    </span>
                    <span className="text-meta leading-[1.55] text-ink-secondary">
                        {description}
                    </span>
                </span>
            </label>
            {checked && children && <div className="pr-4 pb-[18px] pl-12">{children}</div>}
        </div>
    );
}

function AddressChoicePanel({
    listState,
    onRetry,
    onAdd,
    children,
}: {
    readonly listState: "loading" | "error" | "empty" | "ready";
    readonly onRetry: () => void;
    readonly onAdd: () => void;
    readonly children: ReactNode;
}) {
    const { t } = useTranslation();
    if (listState === "ready") return children;
    if (listState === "loading") {
        return (
            <div
                aria-hidden="true"
                className="h-12 animate-pulse rounded-md bg-surface-sunken motion-reduce:animate-none"
            />
        );
    }
    const error = listState === "error";
    return (
        <div
            role={error ? "alert" : undefined}
            className="flex flex-col items-stretch justify-between gap-3 rounded-md bg-surface-raised px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--line-subtle)] sm:flex-row sm:items-center sm:gap-4"
        >
            <p className="text-body-sm leading-[1.55] text-ink-secondary">
                {t(
                    error
                        ? "account.searchLocation.address.loadError"
                        : "account.searchLocation.address.empty",
                )}
            </p>
            <button
                type="button"
                aria-haspopup={error ? undefined : "dialog"}
                onClick={error ? onRetry : onAdd}
                className={cn(ADDRESS_ROW_BUTTON_CLASS, "shrink-0")}
            >
                {!error && <Plus aria-hidden="true" className="size-3.5" strokeWidth={2} />}
                {t(error ? "account.searchLocation.retry" : "account.searchLocation.address.add")}
            </button>
        </div>
    );
}

function PostalCodeField({
    value,
    onChange,
    disabled,
    invalid,
}: {
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly disabled: boolean;
    readonly invalid: boolean;
}) {
    const { t } = useTranslation();
    const messageId = `${FIELD_IDS.postalCode}-message`;
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={FIELD_IDS.postalCode} data-error={invalid} className={LABEL_CLASS}>
                {t("account.searchLocation.postalCode.label")}{" "}
                <span className="font-normal text-ink-muted">
                    {t("account.searchLocation.postalCode.optional")}
                </span>
            </label>
            <input
                id={FIELD_IDS.postalCode}
                type="text"
                autoComplete="off"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                aria-invalid={invalid || undefined}
                aria-describedby={messageId}
                className={cn(FIELD_CLASS, "bg-surface-raised")}
            />
            {invalid ? (
                <p id={messageId} role="alert" className={FIELD_MESSAGE_CLASS}>
                    {t("account.searchLocation.validation.postalCodeInvalid")}
                </p>
            ) : (
                <p id={messageId} className="text-meta text-ink-muted">
                    {t("account.searchLocation.postalCode.hint")}
                </p>
            )}
        </div>
    );
}

function StatePanel({
    icon,
    tone = "neutral",
    title,
    description,
    children,
}: {
    readonly icon: ReactNode;
    readonly tone?: "neutral" | "danger";
    readonly title: ReactNode;
    readonly description: string;
    readonly children: ReactNode;
}) {
    return (
        <div role="alert" className="flex flex-col items-center gap-3 px-3 pt-7 pb-5 text-center">
            <span
                aria-hidden="true"
                className={cn(
                    "inline-flex size-14 items-center justify-center rounded-pill",
                    tone === "danger"
                        ? "bg-oxblood text-on-oxblood"
                        : "bg-surface text-ink shadow-ring",
                )}
            >
                {icon}
            </span>
            <p className="font-serif text-[26px] leading-[1.15] [&_em]:italic">{title}</p>
            <p className="max-w-[420px] text-body-sm text-ink-secondary">{description}</p>
            {children}
        </div>
    );
}

function LoadErrorPanel({ onRetry }: { readonly onRetry: () => void }) {
    const { t } = useTranslation();
    return (
        <StatePanel
            tone="danger"
            icon={<TriangleAlert className="size-[22px]" strokeWidth={1.8} />}
            title={
                <Trans
                    i18nKey="account.searchLocation.error.title"
                    components={HEADLINE_COMPONENTS}
                />
            }
            description={t("account.searchLocation.error.description")}
        >
            <button
                type="button"
                onClick={onRetry}
                className={cn(ADDRESS_ROW_BUTTON_CLASS, "mt-1 px-[22px]")}
            >
                {t("account.searchLocation.retry")}
            </button>
        </StatePanel>
    );
}

function AccessLostPanel() {
    const { t } = useTranslation();
    return (
        <StatePanel
            icon={<Lock className="size-[22px]" strokeWidth={1.6} />}
            title={
                <Trans
                    i18nKey="account.searchLocation.accessLost.title"
                    components={HEADLINE_COMPONENTS}
                />
            }
            description={t("account.searchLocation.accessLost.description")}
        >
            <Link
                to="/$lng/login"
                search={{ mode: "sign-in" }}
                params={true}
                from="/$lng"
                className={cn(ADDRESS_PRIMARY_BUTTON_CLASS, "mt-1 px-[22px]")}
            >
                {t("account.searchLocation.accessLost.action")}
            </Link>
        </StatePanel>
    );
}

function CardSkeleton() {
    const { t } = useTranslation();
    return (
        <div
            aria-busy="true"
            className="flex animate-pulse flex-col gap-4 motion-reduce:animate-none"
        >
            <span className="sr-only">{t("account.searchLocation.loading")}</span>
            <div
                aria-hidden="true"
                className="flex items-start gap-4 border-b border-line-subtle pb-6"
            >
                <div className="size-11 shrink-0 rounded-pill bg-surface-sunken" />
                <div className="flex flex-1 flex-col gap-2 pt-1">
                    <div className="h-2.5 w-20 rounded-xs bg-surface-sunken" />
                    <div className="h-5 w-44 rounded-xs bg-surface-sunken" />
                </div>
            </div>
            {[0, 1, 2].map((row) => (
                <div
                    key={row}
                    aria-hidden="true"
                    className="flex items-center gap-3.5 rounded-lg p-4 shadow-[inset_0_0_0_1px_var(--line-subtle)]"
                >
                    <div className="size-[18px] shrink-0 rounded-pill bg-surface-sunken" />
                    <div className="flex flex-1 flex-col gap-2">
                        <div className="h-3.5 w-[38%] rounded-xs bg-surface-sunken" />
                        <div className="h-[11px] w-[62%] rounded-xs bg-surface-sunken" />
                    </div>
                </div>
            ))}
        </div>
    );
}
