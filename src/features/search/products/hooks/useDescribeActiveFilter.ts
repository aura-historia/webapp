import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SEARCHABLE_LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";
import {
    useDateFilterFormat,
    usePriceFilterFormat,
} from "@/features/search/common/hooks/useFilterFormatters.ts";
import type { ActiveFilter } from "@/features/search/products/lib/activeFilters.ts";
import {
    formatCountryName,
    formatGeographicDistance,
} from "@/features/geography/lib/formatGeography.ts";
import { useSubdivisionNames } from "@/features/geography/hooks/useSubdivisionNames.ts";
import type { CountryCode } from "@/data/internal/geography/GeographicCodes.ts";

/**
 * Names an applied filter as "Price" + "€800–€6,000", for chips and saved-search summaries.
 * `originLabel` names a distance search's starting point ("Home"); never its coordinates.
 */
export function useDescribeActiveFilter(originLabel?: string, regionNames = false) {
    const { t, i18n } = useTranslation();
    const { formatSubdivisionName } = useSubdivisionNames(regionNames);
    const { formatPriceRange } = usePriceFilterFormat();
    const { formatDateRange } = useDateFilterFormat();

    return useCallback(
        (filter: ActiveFilter): { key: string; value: string } => {
            switch (filter.kind) {
                case "availability":
                    return {
                        key: t("search.filter.availability"),
                        value: t("search.filter.selectedOf", {
                            selected: filter.selected,
                            total: SEARCHABLE_LISTING_AVAILABILITIES.length,
                        }),
                    };
                case "price":
                    return {
                        key: t("search.chip.price"),
                        value: formatPriceRange(filter.min, filter.max),
                    };
                case "includeSource":
                    return { key: t("search.chip.includeSource"), value: filter.label };
                case "excludeSource":
                    return { key: t("search.chip.excludeSource"), value: filter.label };
                case "date":
                    return {
                        key: t(`search.filter.${filter.field}`),
                        value: formatDateRange(filter.from, filter.to),
                    };
                case "place":
                    return {
                        key: t("search.chip.place"),
                        value: filter.country
                            ? formatCountryName(filter.code as CountryCode, i18n.language)
                            : formatSubdivisionName(filter.code),
                    };
                case "distance": {
                    const distance = formatGeographicDistance(filter.radius, i18n.language, t);
                    const origin =
                        originLabel ??
                        t(
                            filter.near.kind === "CURRENT"
                                ? "search.location.currentLocation"
                                : "search.location.searchLocationTag",
                        );
                    return {
                        key: t("search.chip.within"),
                        value: t("search.chip.withinValue", { distance, origin }),
                    };
                }
                case "exactLocations":
                    return {
                        key: t("search.chip.locations"),
                        value: t("search.location.strict"),
                    };
            }
        },
        [t, i18n.language, formatPriceRange, formatDateRange, formatSubdivisionName, originLabel],
    );
}
