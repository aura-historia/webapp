import { searchShops, type SearchShopsData } from "@/client";
import {
    type InfiniteData,
    useInfiniteQuery,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { mapToShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { mapToBackendShopType } from "@/data/internal/shop/ShopType.ts";
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
 * Builds the body for the `searchShops` endpoint from the search arguments.
 */
function buildShopSearchBody(
    searchArgs: ShopSearchFilterArguments,
    queryText: string,
): SearchShopsData["body"] {
    const body: SearchShopsData["body"] = {};

    if (queryText.length >= MIN_SEARCH_QUERY_LENGTH) {
        body.shopNameQuery = queryText;
    }

    if (searchArgs.shopType && searchArgs.shopType.length > 0) {
        const mapped = searchArgs.shopType
            .map((type) => mapToBackendShopType(type))
            .filter((t): t is NonNullable<typeof t> => t !== undefined);
        if (mapped.length > 0) {
            body.shopType = mapped;
        }
    }

    if (searchArgs.partnerStatus && searchArgs.partnerStatus.length > 0) {
        body.partnerStatus = searchArgs.partnerStatus.map((s) => mapToBackendShopPartnerStatus(s));
    }

    if (searchArgs.creationDateFrom != null || searchArgs.creationDateTo != null) {
        body.created = {
            min: searchArgs.creationDateFrom?.toISOString() || undefined,
            max: searchArgs.creationDateTo?.toISOString() || undefined,
        };
    }

    if (searchArgs.updateDateFrom != null || searchArgs.updateDateTo != null) {
        body.updated = {
            min: searchArgs.updateDateFrom?.toISOString() || undefined,
            max: searchArgs.updateDateTo?.toISOString() || undefined,
        };
    }

    return body;
}

export function useShopSearch(
    searchArgs: ShopSearchFilterArguments,
): UseInfiniteQueryResult<InfiniteData<ShopSearchResultPage>> {
    const { getErrorMessage } = useApiError();

    return useInfiniteQuery({
        queryKey: ["shopSearch", searchArgs],
        enabled: isSearchEnabled && searchArgs.q.length >= MIN_SEARCH_QUERY_LENGTH,
        queryFn: async ({ pageParam }) => {
            const result = await searchShops({
                body: buildShopSearchBody(searchArgs, searchArgs.q),
                query: {
                    ...mapToBackendShopSortModeArguments({
                        field: searchArgs.sortField ?? "RELEVANCE",
                        order: searchArgs.sortOrder ?? "DESC",
                    }),
                    searchAfter: pageParam,
                    size: PAGE_SIZE,
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return {
                shops: result.data?.items?.map((shop) => mapToShopDetail(shop)) ?? [],
                size: result.data?.size ?? 0,
                total: result.data?.total ?? undefined,
                searchAfter: result.data?.searchAfter ?? undefined,
            } satisfies ShopSearchResultPage;
        },
        initialPageParam: undefined as Array<unknown> | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.searchAfter ?? undefined;
        },
    });
}
