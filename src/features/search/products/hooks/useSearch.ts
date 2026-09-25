import { simpleSearchProductListings, type SimpleSearchProductListingsData } from "@/client";
import { mapPersonalizedProductListingSummary } from "@/data/internal/product/ProductListing.ts";
import {
    type InfiniteData,
    useInfiniteQuery,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import type { ListingAvailabilityData } from "@/client";
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
    return args.allowedStates?.length === 0 || args.shopType?.length === 0;
}

function mapAvailabilityFilters(states: NonNullable<SearchFilterArguments["allowedStates"]>) {
    const values = new Set<ListingAvailabilityData>();
    for (const state of states) {
        switch (state) {
            case "AVAILABLE":
                for (const value of [
                    "AVAILABLE",
                    "IN_STOCK",
                    "LIMITED_AVAILABILITY",
                    "BACK_ORDER",
                    "MADE_TO_ORDER",
                    "PRE_ORDER",
                    "PRE_SALE",
                ] as const) {
                    values.add(value);
                }
                break;
            case "RESERVED":
                values.add("RESERVED");
                break;
            case "SOLD":
                values.add("SOLD_OUT");
                values.add("OUT_OF_STOCK");
                values.add("UNAVAILABLE");
                break;
        }
    }
    return [...values];
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

    if (searchArgs.allowedStates && searchArgs.allowedStates.length > 0) {
        filters.availability = mapAvailabilityFilters(searchArgs.allowedStates);
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
                    productQuery: searchArgs.q ? [searchArgs.q] : [],
                    searchAfter: pageParam,
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
                searchAfter: result.data?.searchAfter
                    ? JSON.stringify(result.data.searchAfter)
                    : undefined,
            };
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.searchAfter ?? undefined,
    });
}
