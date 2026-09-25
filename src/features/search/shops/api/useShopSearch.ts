import { searchPublicListingSources, type SearchPublicListingSourcesData } from "@/client";
import {
    type InfiniteData,
    useInfiniteQuery,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { mapPublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { env } from "@/env.ts";

const PAGE_SIZE = 30;
const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

export type ShopSearchResultPage = {
    sources: PublicListingSource[];
    size: number;
    searchAfter?: string;
};

/**
 * Builds a public source search request. Its opaque cursor belongs only to this endpoint.
 */
function buildShopSearchQuery(
    queryText: string,
    pageParam: string | undefined,
): NonNullable<SearchPublicListingSourcesData["query"]> {
    const query: NonNullable<SearchPublicListingSourcesData["query"]> = {
        searchAfter: pageParam,
        size: PAGE_SIZE,
    };

    if (queryText.length > 0) query.query = queryText;

    return query;
}

export function useShopSearch(
    searchArgs: ShopSearchFilterArguments,
): UseInfiniteQueryResult<InfiniteData<ShopSearchResultPage>> {
    const { getErrorMessage } = useApiError();

    return useInfiniteQuery({
        queryKey: ["publicListingSourceSearch", searchArgs.q, PAGE_SIZE],
        enabled: isSearchEnabled,
        queryFn: async ({ pageParam }) => {
            const result = await searchPublicListingSources({
                query: buildShopSearchQuery(searchArgs.q, pageParam),
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            const { items, size, searchAfter } = result.data ?? {};
            return {
                sources: items?.map(mapPublicListingSource) ?? [],
                size: size ?? 0,
                searchAfter: searchAfter ?? undefined,
            } satisfies ShopSearchResultPage;
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.searchAfter ?? undefined,
    });
}
