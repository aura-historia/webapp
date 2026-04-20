import { getWatchlistProducts } from "@/client";
import { mapPersonalizedGetProductDataToOverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 20;

export function useWatchlist() {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();

    return useInfiniteQuery({
        queryKey: ["watchlist", i18n.language],
        queryFn: async ({ pageParam }) => {
            const result = await getWatchlistProducts({
                query: {
                    language: parseLanguage(i18n.language),
                    searchAfter: pageParam,
                    size: PAGE_SIZE,
                    sort: "created",
                    order: "desc",
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return {
                products:
                    result.data?.items?.map((product) =>
                        mapPersonalizedGetProductDataToOverviewProduct(product, i18n.language),
                    ) ?? [],
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
