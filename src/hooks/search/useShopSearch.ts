import { simpleSearchShops, type SimpleSearchShopsData } from "@/client";
import {
    type InfiniteData,
    useInfiniteQuery,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { mapToShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { mapToBackendShopPartnerStatus } from "@/data/internal/shop/ShopPartnerStatus.ts";
import { mapToBackendShopSortModeArguments } from "@/data/internal/search/ShopSortMode.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { env } from "@/env.ts";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/filterDefaults.ts";

const PAGE_SIZE = 30;
const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

export type ShopSearchResultPage = {
    shops: ShopDetail[];
    size: number;
    total?: number;
    searchAfter?: Array<unknown>;
};

/**
 * Builds the query string for the `simpleSearchShops` GET /api/v1/shops endpoint.
 */
function buildShopSearchQuery(
    searchArgs: ShopSearchFilterArguments,
    queryText: string,
    pageParam: Array<unknown> | undefined,
): NonNullable<SimpleSearchShopsData["query"]> {
    const { sort, order } = mapToBackendShopSortModeArguments({
        field: searchArgs.sortField ?? "RELEVANCE",
        order: searchArgs.sortOrder ?? "DESC",
    });

    const query: NonNullable<SimpleSearchShopsData["query"]> = {
        sort,
        order,
        searchAfter: pageParam,
        size: PAGE_SIZE,
    };

    if (queryText.length >= MIN_SEARCH_QUERY_LENGTH) {
        query.shopNameQuery = queryText;
    }

    if (searchArgs.partnerStatus && searchArgs.partnerStatus.length > 0) {
        query.partnerStatus = searchArgs.partnerStatus.map((s) => mapToBackendShopPartnerStatus(s));
    }

    return query;
}

export function useShopSearch(
    searchArgs: ShopSearchFilterArguments,
): UseInfiniteQueryResult<InfiniteData<ShopSearchResultPage>> {
    const { getErrorMessage } = useApiError();

    return useInfiniteQuery({
        queryKey: ["shopSearch", searchArgs],
        enabled: isSearchEnabled && searchArgs.q.length >= MIN_SEARCH_QUERY_LENGTH,
        queryFn: async ({ pageParam }) => {
            const result = await simpleSearchShops({
                query: buildShopSearchQuery(searchArgs, searchArgs.q, pageParam),
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            const { items, size, total, searchAfter } = result.data ?? {};
            return {
                shops: items?.map((shop) => mapToShopDetail(shop)) ?? [],
                size: size ?? 0,
                total: total ?? undefined,
                searchAfter: searchAfter ?? undefined,
            } satisfies ShopSearchResultPage;
        },
        initialPageParam: undefined as Array<unknown> | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.searchAfter ?? undefined;
        },
    });
}
