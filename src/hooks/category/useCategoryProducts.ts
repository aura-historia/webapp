import { complexSearchProducts } from "@/client";
import { mapPersonalizedGetProductSummaryDataToOverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import {
    type InfiniteData,
    useInfiniteQuery,
    type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useTranslation } from "react-i18next";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import type { SortProductFieldData } from "@/client";

const PAGE_SIZE = 21;

type CategoryProductsOptions = {
    categoryId: string;
    sort?: SortProductFieldData;
    order?: "asc" | "desc";
};

export function useCategoryProducts(
    options: CategoryProductsOptions,
): UseInfiniteQueryResult<InfiniteData<SearchResultData>> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();

    return useInfiniteQuery({
        queryKey: [
            "categoryProducts",
            options.categoryId,
            options.sort,
            options.order,
            i18n.language,
        ],
        queryFn: async ({ pageParam }) => {
            const result = await complexSearchProducts({
                body: {
                    language: parseLanguage(i18n.language),
                    currency: "EUR",
                    productQuery: "*",
                    categoryId: [options.categoryId],
                },
                query: {
                    searchAfter: pageParam,
                    size: PAGE_SIZE,
                    sort: options.sort ?? "created",
                    order: options.order ?? "desc",
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
                size: result.data?.size,
                total: result.data?.total,
                searchAfter: result.data?.searchAfter,
            };
        },
        initialPageParam: undefined as Array<unknown> | undefined,
        getNextPageParam: (lastPage) => {
            return lastPage.searchAfter ?? undefined;
        },
    });
}
