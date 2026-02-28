import { simpleSearchProducts, type SimpleSearchProductsData } from "@/client";
import { mapPersonalizedGetProductSummaryDataToOverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import {
    type InfiniteData,
    useInfiniteQuery,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import { mapToBackendState } from "@/data/internal/product/ProductState.ts";
import { mapToBackendSortModeArguments } from "@/data/internal/search/SortMode.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useTranslation } from "react-i18next";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { mapToBackendAuthenticity } from "@/data/internal/quality-indicators/Authenticity.ts";
import { mapToBackendCondition } from "@/data/internal/quality-indicators/Condition.ts";
import { mapToBackendProvenance } from "@/data/internal/quality-indicators/Provenance.ts";
import { mapToBackendRestoration } from "@/data/internal/quality-indicators/Restoration.ts";
import { mapToBackendShopType } from "@/data/internal/shop/ShopType.ts";
import { env } from "@/env.ts";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/filterDefaults.ts";

const PAGE_SIZE = 21;
const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

/**
 * Builds additional filter query parameters from search arguments.
 * These filters are supported by the GET /api/v1/products endpoint as query params
 * (using the same field names as ProductSearchData) but are not formally defined
 * in the OpenAPI spec as individual parameters. The type assertion at the call site
 * is required because the generated types only include the explicitly defined params.
 * See: internal-api CHANGELOG 2026-02-20 "Cacheable GET Simple-Search Endpoints"
 */
function buildFilterQuery(searchArgs: SearchFilterArguments): Record<string, unknown> {
    const filters: Record<string, unknown> = {};

    if (searchArgs.priceFrom != null || searchArgs.priceTo != null) {
        filters.price = {
            min: searchArgs.priceFrom ? searchArgs.priceFrom * 100 : undefined,
            max: searchArgs.priceTo ? searchArgs.priceTo * 100 : undefined,
        };
    }

    if (searchArgs.allowedStates && searchArgs.allowedStates.length > 0) {
        filters.state = searchArgs.allowedStates.map((state) => mapToBackendState(state));
    }

    if (searchArgs.creationDateFrom != null || searchArgs.creationDateTo != null) {
        filters.created = {
            min: searchArgs.creationDateFrom?.toISOString() || undefined,
            max: searchArgs.creationDateTo?.toISOString() || undefined,
        };
    }

    if (searchArgs.updateDateFrom != null || searchArgs.updateDateTo != null) {
        filters.updated = {
            min: searchArgs.updateDateFrom?.toISOString() || undefined,
            max: searchArgs.updateDateTo?.toISOString() || undefined,
        };
    }

    if (searchArgs.auctionDateFrom != null || searchArgs.auctionDateTo != null) {
        filters.auctionStart = {
            min: searchArgs.auctionDateFrom?.toISOString() || undefined,
            max: searchArgs.auctionDateTo?.toISOString() || undefined,
        };
    }

    if (searchArgs.merchant && searchArgs.merchant.length > 0) {
        filters.shopName = searchArgs.merchant;
    }

    if (searchArgs.excludeMerchant && searchArgs.excludeMerchant.length > 0) {
        filters.excludeShopName = searchArgs.excludeMerchant;
    }

    if (searchArgs.shopType && searchArgs.shopType.length > 0) {
        const mapped = searchArgs.shopType
            .map((type) => mapToBackendShopType(type))
            .filter((t) => t !== undefined);
        if (mapped.length > 0) {
            filters.shopType = mapped;
        }
    }

    if (searchArgs.originYearMin != null || searchArgs.originYearMax != null) {
        filters.originYear = {
            min: searchArgs.originYearMin ?? undefined,
            max: searchArgs.originYearMax ?? undefined,
        };
    }

    if (searchArgs.authenticity && searchArgs.authenticity.length > 0) {
        filters.authenticity = searchArgs.authenticity.map((a) => mapToBackendAuthenticity(a));
    }

    if (searchArgs.condition && searchArgs.condition.length > 0) {
        filters.condition = searchArgs.condition.map((c) => mapToBackendCondition(c));
    }

    if (searchArgs.provenance && searchArgs.provenance.length > 0) {
        filters.provenance = searchArgs.provenance.map((p) => mapToBackendProvenance(p));
    }

    if (searchArgs.restoration && searchArgs.restoration.length > 0) {
        filters.restoration = searchArgs.restoration.map((r) => mapToBackendRestoration(r));
    }

    return filters;
}

export function useSearch(
    searchArgs: SearchFilterArguments,
): UseInfiniteQueryResult<InfiniteData<SearchResultData>> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();

    return useInfiniteQuery({
        queryKey: ["search", searchArgs, i18n.language],
        enabled: isSearchEnabled && searchArgs.q.length >= MIN_SEARCH_QUERY_LENGTH,
        queryFn: async ({ pageParam }) => {
            const result = await simpleSearchProducts({
                query: {
                    language: parseLanguage(i18n.language),
                    // TODO: Make currency dynamic
                    currency: "EUR",
                    productQuery: searchArgs.q,
                    searchAfter: pageParam,
                    size: PAGE_SIZE,
                    ...mapToBackendSortModeArguments({
                        field: searchArgs.sortField ?? "RELEVANCE",
                        order: searchArgs.sortOrder ?? "DESC",
                    }),
                    ...buildFilterQuery(searchArgs),
                } as SimpleSearchProductsData["query"],
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return {
                products:
                    result.data?.items?.map((product) =>
                        mapPersonalizedGetProductSummaryDataToOverviewProduct(
                            product,
                            i18n.language,
                        ),
                    ) ?? [],
                size: result.data?.size,
                total: result.data?.total,
                searchAfter: result.data?.searchAfter,
            };
        },
        initialPageParam: undefined as Array<unknown> | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.searchAfter ?? undefined;
        },
    });
}
