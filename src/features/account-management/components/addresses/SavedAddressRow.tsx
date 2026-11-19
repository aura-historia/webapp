import { Navigation, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserAddress } from "@/data/internal/geography/UserAddress.ts";
import { GeographyAttribution } from "@/features/geography/components/GeographyAttribution.tsx";
import {
    formatGeographyFacts,
    locationDisplay,
} from "@/features/account-management/lib/addressResolution.ts";
import {
    ADDRESS_ICON_BUTTON_CLASS,
    ADDRESS_META_LABEL_CLASS,
    ADDRESS_ROW_BUTTON_CLASS,
} from "@/features/account-management/lib/addressStyles.ts";
import { cn } from "@/lib/utils.ts";

/** Dashed ring beside "Not located"; always paired with its label. */
export function NotLocatedMark() {
    return (
        <span
            aria-hidden="true"
            className="size-[9px] shrink-0 rounded-pill border-[1.5px] border-dashed border-ink-muted"
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
 * provider-derived location kept apart (board "Account · Saved addresses section"). A lookup
 * that is still running shows no location line.
 */
export function SavedAddressRow({ address, onEdit, onDelete }: SavedAddressRowProps) {
    const { t, i18n } = useTranslation();
    const { geography, resolution } = address;
    const display = locationDisplay(resolution.status);
    const asserted = formatGeographyFacts(geography, i18n.language);
    const derived =
        display === "located"
            ? formatGeographyFacts(resolution.derivedGeography, i18n.language)
            : "";

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
                    {display !== "pending" && (
                        <>
                            <dt className={ADDRESS_META_LABEL_CLASS}>
                                {t("account.addresses.location")}
                            </dt>
                            <dd className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink wrap-anywhere">
                                {display === "located" ? (
                                    <span>{derived || t("account.addresses.located")}</span>
                                ) : (
                                    <>
                                        <NotLocatedMark />
                                        <span>{t("account.addresses.notLocated.label")}</span>
                                        <span className="basis-full text-ink-muted">
                                            {t("account.addresses.notLocated.hint")}
                                        </span>
                                    </>
                                )}
                            </dd>
                        </>
                    )}
                </dl>
                {display === "located" && (
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
