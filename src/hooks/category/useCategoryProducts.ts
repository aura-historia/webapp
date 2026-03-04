import { simpleSearchProducts, type SimpleSearchProductsData } from "@/client";
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

const PAGE_SIZE = 20;

export type CategoryProductsPage = {
    products: OverviewProduct[];
    total: number | undefined;
    searchAfter: Array<unknown> | undefined;
};

export function useCategoryProducts(
    categoryId: string,
): UseInfiniteQueryResult<InfiniteData<CategoryProductsPage>> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();

    return useInfiniteQuery({
        queryKey: ["categoryProducts", categoryId, i18n.language],
        queryFn: async ({ pageParam }) => {
            const result = await simpleSearchProducts({
                query: {
                    language: parseLanguage(i18n.language),
                    // TODO: Make currency dynamic
                    currency: "EUR",
                    productQuery: "*",
                    searchAfter: pageParam,
                    size: PAGE_SIZE,
                    sort: "updated",
                    order: "desc",
                    // categoryId is supported by the endpoint as an extra filter param
                    // but is not formally typed — same pattern as useSearch.ts buildFilterQuery
                    categoryId: [categoryId],
                } as SimpleSearchProductsData["query"],
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
