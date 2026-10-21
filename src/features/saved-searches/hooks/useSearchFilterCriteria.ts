import { useTranslation } from "react-i18next";
import {
    LISTING_AVAILABILITIES,
    LISTING_AVAILABILITY_TRANSLATION_KEYS,
} from "@/data/internal/product/ListingAvailability.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import {
    useDateFilterFormat,
    usePriceFilterFormat,
} from "@/features/search/common/hooks/useFilterFormatters.ts";

/** One saved criterion, e.g. "Price range" with "€800–€6,000". */
export type SearchFilterCriterion = {
    readonly id: "price" | "availability" | "include" | "exclude" | "auction" | "added" | "updated";
    readonly label: string;
    readonly values: readonly string[];
};

/** The search terms of a saved filter; older filters only carry `q`. */
export function getQueryTerms(search: SearchFilterArguments): string[] {
    if (search.queryTerms?.length) return search.queryTerms;
    return search.q ? [search.q] : [];
}

/**
 * Names every criterion of a saved search filter besides its search terms, in the order of the
 * filter panel. Availability is always listed, falling back to all states.
 */
export function useSearchFilterCriteria(
    search: SearchFilterArguments,
    availability: readonly string[] | undefined = search.availability,
): SearchFilterCriterion[] {
    const { t } = useTranslation();
    const { formatPriceRange } = usePriceFilterFormat(search.currency);
    const { formatDateRange } = useDateFilterFormat();
    const criteria: SearchFilterCriterion[] = [];

    if (search.priceFrom != null || search.priceTo != null) {
        criteria.push({
            id: "price",
            label: t("search.filter.priceSpan"),
            values: [formatPriceRange(search.priceFrom, search.priceTo)],
        });
    }

    const states = availability?.length ? availability : LISTING_AVAILABILITIES;
    criteria.push({
        id: "availability",
        label: t("search.filter.availability"),
        values:
            states.length >= LISTING_AVAILABILITIES.length
                ? [t("search.filter.all")]
                : LISTING_AVAILABILITIES.filter((state) => states.includes(state)).map((state) =>
                      t(LISTING_AVAILABILITY_TRANSLATION_KEYS[state]),
                  ),
    });

    const sources = (id: "include" | "exclude", ids?: string[], labels?: string[]) => {
        if (!ids?.length) return;
        criteria.push({
            id,
            label: t(
                id === "include"
                    ? "search.filter.listingSource"
                    : "search.filter.excludeListingSource",
            ),
            values:
                labels?.length === ids.length
                    ? labels
                    : [t("search.filter.sourceCount", { count: ids.length })],
        });
    };
    sources("include", search.listingSourceId, search.listingSourceLabels);
    sources("exclude", search.excludeListingSourceId, search.excludeListingSourceLabels);

    const dates = (id: "auction" | "added" | "updated", label: string, from?: Date, to?: Date) => {
        if (from || to) criteria.push({ id, label, values: [formatDateRange(from, to)] });
    };
    dates(
        "auction",
        t("searchFilters.info.auctionDate"),
        search.auctionDateFrom,
        search.auctionDateTo,
    );
    dates(
        "added",
        t("searchFilters.info.creationDate"),
        search.creationDateFrom,
        search.creationDateTo,
    );
    dates(
        "updated",
        t("searchFilters.info.updateDate"),
        search.updateDateFrom,
        search.updateDateTo,
    );

    return criteria;
}
