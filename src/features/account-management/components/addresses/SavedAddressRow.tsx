import { Navigation, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
    UserAddress,
    UserAddressResolutionStatus,
} from "@/data/internal/geography/UserAddress.ts";
import { GeographyAttribution } from "@/features/geography/components/GeographyAttribution.tsx";
import {
    formatGeographyFacts,
    RESOLUTION_MARK_CLASS,
    RESOLUTION_MARKS,
    resolutionCopyKeys,
} from "@/features/account-management/lib/addressResolution.ts";
import {
    ADDRESS_ICON_BUTTON_CLASS,
    ADDRESS_META_LABEL_CLASS,
    ADDRESS_ROW_BUTTON_CLASS,
} from "@/features/account-management/lib/addressStyles.ts";
import { cn } from "@/lib/utils.ts";

export function ResolutionMark({ status }: { readonly status: UserAddressResolutionStatus }) {
    return (
        <span
            aria-hidden="true"
            data-mark={RESOLUTION_MARKS[status]}
            className={cn(
                "size-[9px] shrink-0 rounded-pill",
                RESOLUTION_MARK_CLASS[RESOLUTION_MARKS[status]],
            )}
        />
    );
}

export function SearchLocationTag() {
    const { t } = useTranslation();
    return (
        <span className="inline-flex h-6 items-center gap-1.5 rounded-sm bg-surface-sunken px-2.5 font-mono text-[10px] tracking-[0.12em] text-ink uppercase">
            <Navigation aria-hidden="true" className="size-[11px]" strokeWidth={2.2} />
            {t("account.addresses.searchLocation")}
        </span>
    );
}

interface SavedAddressRowProps {
    readonly address: UserAddress;
    readonly onEdit: () => void;
    readonly onDelete: () => void;
}

/**
 * One saved address: the text exactly as entered, the user's own details, then the
 * provider-derived location kept apart (board "Account · Saved addresses section").
 */
export function SavedAddressRow({ address, onEdit, onDelete }: SavedAddressRowProps) {
    const { t, i18n } = useTranslation();
    const { geography, resolution } = address;
    const status = resolution.status;
    const asserted = formatGeographyFacts(geography, i18n.language);
    const derived =
        status === "ACCEPTED"
            ? formatGeographyFacts(resolution.derivedGeography, i18n.language)
            : "";
    const copy = resolutionCopyKeys(status, geography);

    return (
        <li className="flex flex-col gap-4 border-t border-line-subtle py-6 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h3 className="font-serif text-[21px] leading-[1.2] font-normal wrap-anywhere">
                        {address.label}
                    </h3>
                    {address.preferred && <SearchLocationTag />}
                </div>
                {geography.addressText && (
                    <p className="text-body-sm whitespace-pre-line text-ink-secondary wrap-anywhere">
                        {geography.addressText}
                    </p>
                )}
                <dl className="grid grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-3.5 gap-y-1.5 text-[13px] leading-normal">
                    {asserted && (
                        <>
                            <dt className={ADDRESS_META_LABEL_CLASS}>
                                {t("account.addresses.yourDetails")}
                            </dt>
                            <dd className="text-ink wrap-anywhere">{asserted}</dd>
                        </>
                    )}
                    <dt className={ADDRESS_META_LABEL_CLASS}>{t("account.addresses.location")}</dt>
                    <dd className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink">
                        <ResolutionMark status={status} />
                        <span>{t(`account.addresses.status.${status}.label`)}</span>
                        {derived && <span className="text-ink-secondary">· {derived}</span>}
                        {copy.hint && (
                            <span className="basis-full text-ink-muted">{t(copy.hint)}</span>
                        )}
                    </dd>
                </dl>
                {derived && (
                    <GeographyAttribution
                        attribution={resolution.attribution}
                        className="text-ink-muted"
                    />
                )}
            </div>
            <div className="flex shrink-0 gap-2">
                <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={t("account.addresses.editNamed", { label: address.label })}
                    onClick={onEdit}
                    className={cn(ADDRESS_ROW_BUTTON_CLASS, "flex-1 sm:flex-none")}
                >
                    <Pencil aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                    {t("account.addresses.edit")}
                </button>
                <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={t("account.addresses.deleteNamed", { label: address.label })}
                    onClick={onDelete}
                    className={ADDRESS_ICON_BUTTON_CLASS}
                >
                    <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.8} />
                </button>
            </div>
        </li>
    );
}
