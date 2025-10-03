import { searchItems } from "@/client";
import { mapToInternalOverviewItem } from "@/data/internal/OverviewItem.ts";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useSimpleSearch(query: string) {
    return useInfiniteQuery({
        queryKey: ["search", query],
        queryFn: async ({ pageParam }) => {
            const result = await searchItems({
                query: {
                    q: query,
                    searchAfter: pageParam,
                    size: 2,
                },
            });
            return {
                ...result,
                data: {
                    ...result.data,
                    items: result.data?.items?.map(mapToInternalOverviewItem) ?? [],
                },
            };
        },
        enabled: query.length >= 3,
        initialPageParam: undefined as Array<unknown> | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.data?.searchAfter ?? undefined;
        },
    });
}
