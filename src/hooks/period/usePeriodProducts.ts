import { simpleSearchProducts } from "@/client";
import { mapPersonalizedGetProductSummaryDataToOverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import {
    type InfiniteData,
    useInfiniteQuery,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useTranslation } from "react-i18next";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";

const PAGE_SIZE = 20;

export type PeriodProductsPage = {
    products: OverviewProduct[];
    total: number | undefined;
    searchAfter: Array<unknown> | undefined;
};

/**
 * Hook for fetching products of a specific period with infinite scrolling.
 *
 * @param periodId - The kebab-case identifier of the period.
 * @returns An infinite query result containing products and pagination state.
 */
export function usePeriodProducts(
    periodId: string,
): UseInfiniteQueryResult<InfiniteData<PeriodProductsPage>> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();

    return useInfiniteQuery({
        queryKey: ["periodProducts", periodId, i18n.language, preferences.currency],
        queryFn: async ({ pageParam }) => {
            const result = await simpleSearchProducts({
                query: {
                    language: parseLanguage(i18n.language),
                    currency: preferences.currency,
                    searchAfter: pageParam as Array<unknown> | undefined,
                    size: PAGE_SIZE,
                    sort: "updated",
                    order: "desc",
                    periodId: [periodId],
                },
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
                total: result.data?.total ?? undefined,
                searchAfter: result.data?.searchAfter ?? undefined,
            };
        },
        initialPageParam: undefined as Array<unknown> | undefined,
        getNextPageParam: (lastPage) => lastPage.searchAfter ?? undefined,
    });
}
