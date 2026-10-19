import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";
import {
    useDateFilterFormat,
    usePriceFilterFormat,
} from "@/features/search/common/hooks/useFilterFormatters.ts";
import type { ActiveFilter } from "@/features/search/products/lib/activeFilters.ts";

/** Names an applied filter as "Price" + "€800–€6,000", for chips and saved-search summaries. */
export function useDescribeActiveFilter() {
    const { t } = useTranslation();
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
                            total: LISTING_AVAILABILITIES.length,
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
            }
        },
        [t, formatPriceRange, formatDateRange],
    );
}
