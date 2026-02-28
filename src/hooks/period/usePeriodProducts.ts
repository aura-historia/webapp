import { complexSearchProducts } from "@/client";
import { mapPersonalizedGetProductSummaryDataToOverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useTranslation } from "react-i18next";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import type { SortProductFieldData } from "@/client";

type PeriodProductsResult = {
    products: OverviewProduct[];
    total: number;
};

type PeriodProductsOptions = {
    periodId: string;
    sort: SortProductFieldData;
    order: "asc" | "desc";
    size?: number;
};

export function usePeriodProducts(
    options: PeriodProductsOptions,
): UseQueryResult<PeriodProductsResult> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const { periodId, sort, order, size = 6 } = options;

    return useQuery({
        queryKey: ["periodProducts", periodId, sort, order, size, i18n.language],
        queryFn: async () => {
            const result = await complexSearchProducts({
                body: {
                    language: parseLanguage(i18n.language),
                    currency: "EUR",
                    productQuery: "*",
                    periodId: [periodId],
                },
                query: {
                    sort,
                    order,
                    size,
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
                total: result.data?.total ?? 0,
            };
        },
    });
}
