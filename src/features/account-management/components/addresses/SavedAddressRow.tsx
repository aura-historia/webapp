import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
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

/** A row's search location switch: whether it is on, and whether it can change right now. */
export interface SearchLocationSwitchState {
    readonly checked: boolean;
    /** Another save is running, or the search location is not loaded. */
    readonly disabled: boolean;
    /** This row's save is running. */
    readonly pending: boolean;
    readonly onToggle: () => void;
}

interface SavedAddressRowProps {
    readonly address: UserAddress;
    readonly searchLocation: SearchLocationSwitchState;
    readonly onEdit: () => void;
    readonly onDelete: () => void;
}

/**
 * One saved address: the text exactly as entered, the user's own details, then the
 * provider-derived location kept apart, and the search location switch (board "Account · #1391
 * Saved addresses with search location switch"). A lookup that is still running shows no
 * location line.
 */
export function SavedAddressRow({
    address,
    searchLocation,
    onEdit,
    onDelete,
}: SavedAddressRowProps) {
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
                <h3 className="font-serif text-[21px] leading-[1.2] font-normal wrap-anywhere">
                    {address.label}
                </h3>
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
                <div className="mt-1 flex border-t border-dashed border-line-subtle pt-3">
                    <SearchLocationSwitch {...searchLocation} />
                </div>
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

/**
 * The design system's Toggle as "Use as search location": a 34 × 20 pill in a 44px hit area,
 * oxblood when on. It saves at once; a spinner shows while this row's save runs.
 */
function SearchLocationSwitch({ checked, disabled, pending, onToggle }: SearchLocationSwitchState) {
    const { t } = useTranslation();
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-busy={pending || undefined}
            disabled={disabled}
            onClick={onToggle}
            className={cn(
                "group -my-1.5 -ml-[5px] inline-flex min-h-11 cursor-pointer items-center gap-2.5 pr-2 text-sm font-medium text-ink focus-visible:outline-none disabled:cursor-not-allowed",
                disabled && !pending && "opacity-55",
            )}
        >
            <span
                aria-hidden="true"
                className="inline-flex size-11 shrink-0 items-center justify-center"
            >
                <span
                    className={cn(
                        "relative block h-5 w-[34px] rounded-pill transition-colors motion-reduce:transition-none",
                        "group-focus-visible:outline-2 group-focus-visible:outline-offset-3 group-focus-visible:outline-brass group-focus-visible:outline-solid",
                        checked ? "bg-oxblood" : "bg-line-strong",
                    )}
                >
                    <span
                        className={cn(
                            "absolute top-[3px] size-3.5 rounded-pill bg-on-oxblood transition-[left] motion-reduce:transition-none",
                            checked ? "left-[17px]" : "left-[3px]",
                        )}
                    />
                </span>
            </span>
            {t("account.addresses.searchLocationSwitch")}
            {pending && <Spinner className="size-3.5 text-ink-muted" />}
        </button>
    );
}
