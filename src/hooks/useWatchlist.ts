import { getWatchlistItems } from "@/client";
import { mapToInternalOverviewItem } from "@/data/internal/OverviewItem.ts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError.ts";

const PAGE_SIZE = 21;

export function useWatchlist() {
    const { getErrorMessage } = useApiError();

    return useInfiniteQuery({
        queryKey: ["watchlist"],
        queryFn: async ({ pageParam }) => {
            const result = await getWatchlistItems({
                query: {
                    searchAfter: pageParam,
                    size: PAGE_SIZE,
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(result.error.error));
            }

            return {
                items: result.data?.items?.map(mapToInternalOverviewItem) ?? [],
                size: result.data?.size,
                total: result.data?.total ?? undefined,
                searchAfter: result.data?.searchAfter ?? undefined,
            };
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.searchAfter ?? undefined;
        },
    });
}
