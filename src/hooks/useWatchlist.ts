import { getWatchlistProducts } from "@/client";
import { mapToInternalOverviewProduct } from "@/data/internal/OverviewProduct.ts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/ApiError.ts";

const PAGE_SIZE = 21;

export function useWatchlist() {
    const { getErrorMessage } = useApiError();

    return useInfiniteQuery({
        queryKey: ["watchlist"],
        queryFn: async ({ pageParam }) => {
            const result = await getWatchlistProducts({
                query: {
                    searchAfter: pageParam,
                    size: PAGE_SIZE,
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return {
                products: result.data?.items?.map(mapToInternalOverviewProduct) ?? [],
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
