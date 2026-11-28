import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
    UNSUPPORTED_GEOGRAPHY,
    type GeographicSearch,
    type UnsupportedGeography,
} from "@/data/internal/geography/GeographicSearch.ts";
import {
    LISTING_AVAILABILITY_TRANSLATION_KEYS,
    SEARCHABLE_LISTING_AVAILABILITIES,
} from "@/data/internal/product/ListingAvailability.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import {
    useDateFilterFormat,
    usePriceFilterFormat,
} from "@/features/search/common/hooks/useFilterFormatters.ts";
import { useSubdivisionNames } from "@/features/geography/hooks/useSubdivisionNames.ts";
import {
    formatCountryName,
    formatGeographicDistance,
} from "@/features/geography/lib/formatGeography.ts";

/** One saved criterion, e.g. "Price range" with "€800–€6,000". */
export type SearchFilterCriterion = {
    readonly id:
        | "price"
        | "availability"
        | "location"
        | "include"
        | "exclude"
        | "auction"
        | "added"
        | "updated";
    readonly label: string;
    readonly values: readonly string[];
    /** Shown under the values where there is room, e.g. that a saved starting point is private. */
    readonly note?: string;
};

/**
 * A saved filter's location. `originLabel` names a starting point that is not saved yet ("Home"
 * in the wizard); a saved one is always "saved starting point", never an address or coordinates.
 */
export type SearchFilterLocationInput = {
    readonly geography: GeographicSearch | UnsupportedGeography | undefined;
    readonly originLabel?: string;
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
    location?: SearchFilterLocationInput,
): SearchFilterCriterion[] {
    const { t, i18n } = useTranslation();
    const geography = location?.geography;
    const { formatSubdivisionName } = useSubdivisionNames(
        !!geography && geography !== UNSUPPORTED_GEOGRAPHY && geography.subdivisions.length > 0,
    );
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

    const states = availability?.length ? availability : SEARCHABLE_LISTING_AVAILABILITIES;
    criteria.push({
        id: "availability",
        label: t("search.filter.availability"),
        values:
            states.length >= SEARCHABLE_LISTING_AVAILABILITIES.length
                ? [t("search.filter.all")]
                : SEARCHABLE_LISTING_AVAILABILITIES.filter((state) => states.includes(state)).map(
                      (state) => t(LISTING_AVAILABILITY_TRANSLATION_KEYS[state]),
                  ),
    });

    if (geography) {
        criteria.push({
            id: "location",
            label: t("search.location.title"),
            values: describeGeography(geography, location?.originLabel, {
                t,
                language: i18n.language,
                formatSubdivisionName,
            }),
            ...(geography !== UNSUPPORTED_GEOGRAPHY && geography.origin && !location?.originLabel
                ? { note: t("geography.disclosure.savedOrigin") }
                : {}),
        });
    }

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

/**
 * Names a saved location: the distance and its starting point, then the countries and regions,
 * then "exact addresses only" for a strict predicate saved elsewhere. A predicate the app cannot
 * read is only said to exist. The search's distance order is not a criterion.
 */
function describeGeography(
    geography: GeographicSearch | UnsupportedGeography,
    originLabel: string | undefined,
    {
        t,
        language,
        formatSubdivisionName,
    }: {
        readonly t: TFunction;
        readonly language: string;
        readonly formatSubdivisionName: (code: string) => string;
    },
): string[] {
    if (geography === UNSUPPORTED_GEOGRAPHY) return [t("searchFilter.location.unsupported")];
    const values: string[] = [];
    if (geography.radius) {
        values.push(
            t("searchFilter.location.within", {
                distance: formatGeographicDistance(geography.radius, language, t),
                origin: originLabel ?? t("searchFilter.location.savedOriginName"),
            }),
        );
    }
    values.push(
        ...geography.countries.map((code) => formatCountryName(code, language)),
        ...geography.subdivisions.map(formatSubdivisionName),
    );
    if (geography.radius && geography.mode === "STRICT") {
        values.push(t("searchFilter.location.exactOnly"));
    }
    return values;
}
