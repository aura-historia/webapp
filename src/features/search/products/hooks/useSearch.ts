import { simpleSearchProductListings, type SimpleSearchProductListingsData } from "@/client";
import { mapPersonalizedProductListingSummary } from "@/data/internal/product/ProductListing.ts";
import {
    type InfiniteData,
    useInfiniteQuery,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import {
    mapListingSearchCursor,
    serializeListingSearchCursor,
    type ListingSearchCursor,
    type SearchResultData,
} from "@/data/internal/search/SearchResultData.ts";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ProductListingDomain.ts";
import { toMinorCurrencyAmount } from "@/data/internal/price/Price.ts";
import { mapToBackendSortModeArguments } from "@/data/internal/search/SortMode.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useTranslation } from "react-i18next";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { env } from "@/env.ts";
import { MIN_SEARCH_QUERY_LENGTH } from "@/features/search/products/lib/filterDefaults.ts";

const PAGE_SIZE = 30;
const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

const EMPTY_RESULT: SearchResultData = { products: [], size: 0, total: 0, searchAfter: undefined };

function hasEmptyArrayFilter(args: SearchFilterArguments): boolean {
    return args.availability?.length === 0;
}
/**
 * Builds filter query parameters from search arguments.
 * Returns a strongly typed Partial of SimpleSearchProductListingsData's query object,
 * ensuring all field names and values conform to the API contract.
 */
function buildFilterQuery(
    searchArgs: SearchFilterArguments,
    currency: string,
): Partial<NonNullable<SimpleSearchProductListingsData["query"]>> {
    const filters: Partial<NonNullable<SimpleSearchProductListingsData["query"]>> = {};

    if (searchArgs.priceFrom != null || searchArgs.priceTo != null) {
        filters.price = {
            min:
                searchArgs.priceFrom == null
                    ? undefined
                    : toMinorCurrencyAmount(searchArgs.priceFrom, currency),
            max:
                searchArgs.priceTo == null
                    ? undefined
                    : toMinorCurrencyAmount(searchArgs.priceTo, currency),
        };
    }

    if (searchArgs.availability?.length) {
        filters.availability = searchArgs.availability.filter(
            (value): value is (typeof LISTING_AVAILABILITIES)[number] =>
                LISTING_AVAILABILITIES.includes(value as (typeof LISTING_AVAILABILITIES)[number]),
        );
    }

    if (searchArgs.creationDateFrom != null || searchArgs.creationDateTo != null) {
        filters.created = {
            min: searchArgs.creationDateFrom?.toISOString(),
            max: searchArgs.creationDateTo?.toISOString(),
        };
    }

    if (searchArgs.updateDateFrom != null || searchArgs.updateDateTo != null) {
        filters.updated = {
            min: searchArgs.updateDateFrom?.toISOString(),
            max: searchArgs.updateDateTo?.toISOString(),
        };
    }

    if (searchArgs.auctionDateFrom != null || searchArgs.auctionDateTo != null) {
        filters.lotBiddingOpens = {
            min: searchArgs.auctionDateFrom?.toISOString(),
            max: searchArgs.auctionDateTo?.toISOString(),
        };
    }

    return filters;
}

export function useSearch(
    searchArgs: SearchFilterArguments,
): UseInfiniteQueryResult<InfiniteData<SearchResultData>> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();

    return useInfiniteQuery({
        queryKey: ["search", searchArgs, i18n.language, preferences.currency],
        enabled: isSearchEnabled && searchArgs.q.length >= MIN_SEARCH_QUERY_LENGTH,
        queryFn: async ({ pageParam }) => {
            if (hasEmptyArrayFilter(searchArgs)) return EMPTY_RESULT;

            const result = await simpleSearchProductListings({
                query: {
                    language: parseLanguage(i18n.language),
                    currency: preferences.currency,
                    productQuery: searchArgs.queryTerms?.length
                        ? searchArgs.queryTerms
                        : searchArgs.q
                          ? [searchArgs.q]
                          : [],
                    enhancedSearchDescription: searchArgs.enhancedSearchDescription,
                    excludeProductId: searchArgs.excludeProductId,
                    listingSourceId: searchArgs.listingSourceId,
                    excludeListingSourceId: searchArgs.excludeListingSourceId,
                    auctionId: searchArgs.auctionId,
                    searchAfter: pageParam ? serializeListingSearchCursor(pageParam) : undefined,
                    size: PAGE_SIZE,
                    ...mapToBackendSortModeArguments({
                        field: searchArgs.sortField ?? "RELEVANCE",
                        order: searchArgs.sortOrder ?? "DESC",
                    }),
                    ...buildFilterQuery(searchArgs, preferences.currency),
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return {
                products:
                    result.data?.items?.map((product) =>
                        mapPersonalizedProductListingSummary(product, i18n.language),
                    ) ?? [],
                size: result.data?.size,
                total: result.data?.total ?? undefined,
                searchAfter: mapListingSearchCursor(result.data?.searchAfter),
            };
        },
        initialPageParam: undefined as ListingSearchCursor | undefined,
        getNextPageParam: (lastPage) => lastPage.searchAfter,
    });
}
