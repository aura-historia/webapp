import { getWatchlistProducts } from "@/client";
import { mapWatchlistProductDataToOverviewProduct } from "@/data/internal/OverviewProduct.ts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/ApiError.ts";
import { parseLanguage } from "@/data/internal/Language.ts";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 21;

export function useWatchlist() {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();

    return useInfiniteQuery({
        queryKey: ["watchlist", i18n.language],
        queryFn: async ({ pageParam }) => {
            const result = await getWatchlistProducts({
                headers: {
                    "Accept-Language": parseLanguage(i18n.language),
                },
                query: {
                    searchAfter: pageParam,
                    size: PAGE_SIZE,
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return {
                products: result.data?.items?.map(mapWatchlistProductDataToOverviewProduct) ?? [],
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
