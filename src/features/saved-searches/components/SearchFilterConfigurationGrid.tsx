import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
    Ban,
    CalendarClock,
    CalendarPlus,
    Coins,
    Gavel,
    type LucideIcon,
    Search,
    Store,
    Tag,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge.tsx";
import {
    LISTING_AVAILABILITIES,
    LISTING_AVAILABILITY_TRANSLATION_KEYS,
} from "@/data/internal/product/ListingAvailability.ts";
import {
    hasActiveFilters,
    type SearchFilterArguments,
} from "@/data/internal/search/SearchFilterArguments.ts";
import { FILTER_DEFAULTS } from "@/features/search/products/lib/filterDefaults.ts";

type TileProps = {
    readonly icon: LucideIcon;
    readonly label: string;
    readonly children: ReactNode;
};

function CriteriaTile({ icon: Icon, label, children }: TileProps) {
    return (
        <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Icon className="size-3.5 text-tertiary" aria-hidden="true" />
                {label}
            </span>
            <div className="flex flex-wrap gap-1.5">{children}</div>
        </div>
    );
}

function formatDateRange(t: TFunction, language: string, from?: Date, to?: Date) {
    if (from && to)
        return `${from.toLocaleDateString(language)} – ${to.toLocaleDateString(language)}`;
    if (from) return `${t("search.filter.from")} ${from.toLocaleDateString(language)}`;
    return `${t("search.filter.to")} ${to?.toLocaleDateString(language)}`;
}

type Props = {
    readonly search: SearchFilterArguments;
};

/**
 * Every configured search-filter criterion, laid out as a responsive grid of compact
 * icon-labelled tiles rather than a stacked list — built for the spacious detail page,
 * not the narrow card/wizard contexts (see SearchFilterCriteria.tsx for those).
 */
export function SearchFilterConfigurationGrid({ search }: Props) {
    const { t, i18n } = useTranslation();

    const fallbackQueryTerms = search.q ? [search.q] : [];
    const queryTerms = search.queryTerms?.length ? search.queryTerms : fallbackQueryTerms;
    const hasPrice = search.priceFrom != null || search.priceTo != null;
    const displayedAvailability = search.availability?.length
        ? search.availability
        : FILTER_DEFAULTS.availability;
    const allAvailabilitySelected = displayedAvailability.length === LISTING_AVAILABILITIES.length;

    if (queryTerms.length === 0 && !hasActiveFilters(search)) {
        return (
            <p className="text-sm text-muted-foreground italic">
                {t("searchFilters.noAdditionalCriteria")}
            </p>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {queryTerms.length > 0 && (
                <CriteriaTile
                    icon={Search}
                    label={t("searchFilter.saveDialog.queryLabel", { count: queryTerms.length })}
                >
                    {queryTerms.map((term) => (
                        <Badge key={term} variant="outline">
                            {term}
                        </Badge>
                    ))}
                </CriteriaTile>
            )}

            {hasPrice && (
                <CriteriaTile icon={Coins} label={t("search.filter.priceSpan")}>
                    <Badge variant="outline">
                        {search.priceFrom ?? "?"} – {search.priceTo ?? "?"} €
                    </Badge>
                </CriteriaTile>
            )}

            <CriteriaTile icon={Tag} label={t("search.filter.availability")}>
                {allAvailabilitySelected ? (
                    <Badge variant="outline">{t("search.filter.all")}</Badge>
                ) : (
                    displayedAvailability.map((value) => (
                        <Badge key={value} variant="outline">
                            {t(LISTING_AVAILABILITY_TRANSLATION_KEYS[value])}
                        </Badge>
                    ))
                )}
            </CriteriaTile>

            {!!search.listingSourceId?.length && (
                <CriteriaTile icon={Store} label={t("search.filter.listingSource")}>
                    <Badge variant="outline">
                        {t("search.filter.sourceCount", { count: search.listingSourceId.length })}
                    </Badge>
                </CriteriaTile>
            )}
            {!!search.excludeListingSourceId?.length && (
                <CriteriaTile icon={Ban} label={t("search.filter.excludeListingSource")}>
                    <Badge variant="destructive">
                        {t("search.filter.sourceCount", {
                            count: search.excludeListingSourceId.length,
                        })}
                    </Badge>
                </CriteriaTile>
            )}

            {(search.creationDateFrom != null || search.creationDateTo != null) && (
                <CriteriaTile icon={CalendarPlus} label={t("searchFilters.info.creationDate")}>
                    <span className="text-sm">
                        {formatDateRange(
                            t,
                            i18n.language,
                            search.creationDateFrom,
                            search.creationDateTo,
                        )}
                    </span>
                </CriteriaTile>
            )}

            {(search.updateDateFrom != null || search.updateDateTo != null) && (
                <CriteriaTile icon={CalendarClock} label={t("searchFilters.info.updateDate")}>
                    <span className="text-sm">
                        {formatDateRange(
                            t,
                            i18n.language,
                            search.updateDateFrom,
                            search.updateDateTo,
                        )}
                    </span>
                </CriteriaTile>
            )}

            {(search.auctionDateFrom != null || search.auctionDateTo != null) && (
                <CriteriaTile icon={Gavel} label={t("searchFilters.info.auctionDate")}>
                    <span className="text-sm">
                        {formatDateRange(
                            t,
                            i18n.language,
                            search.auctionDateFrom,
                            search.auctionDateTo,
                        )}
                    </span>
                </CriteriaTile>
            )}
        </div>
    );
}
