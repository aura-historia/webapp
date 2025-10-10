import { searchItems } from "@/client";
import { mapToInternalOverviewItem } from "@/data/internal/OverviewItem.ts";
import {
    useInfiniteQuery,
    type UseInfiniteQueryResult,
    type InfiniteData,
} from "@tanstack/react-query";
import type { SearchResultData } from "@/data/internal/SearchResultData.ts";

const PAGE_SIZE = 21;

export function useSimpleSearch(
    query: string,
): UseInfiniteQueryResult<InfiniteData<SearchResultData>> {
    return useInfiniteQuery({
        queryKey: ["search", query],
        queryFn: async ({ pageParam }) => {
            const result = await searchItems({
                query: {
                    q: query,
                    searchAfter: pageParam,
                    size: PAGE_SIZE,
                },
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return {
                items: result.data?.items?.map(mapToInternalOverviewItem) ?? [],
                size: result.data?.size,
                total: result.data?.total,
                searchAfter: result.data?.searchAfter,
            };
        },
        enabled: query.length >= 3,
        initialPageParam: undefined as Array<unknown> | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.searchAfter ?? undefined;
        },
    });
}
