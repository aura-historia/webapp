import { getSimilarProducts } from "@/client";
import {
    mapPersonalizedGetProductSummaryDataToOverviewProduct,
    type OverviewProduct,
} from "@/data/internal/product/OverviewProduct.ts";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/preferences/useCurrency.ts";

type SimilarProductsData = {
    products: OverviewProduct[];
    isEmbeddingsPending: boolean;
};

export function useSimilarProducts(
    shopId: string,
    shopsProductId: string,
): UseQueryResult<SimilarProductsData> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const currency = useCurrency();

    return useQuery({
        queryKey: ["similarProducts", shopId, shopsProductId, i18n.language, currency],
        queryFn: async () => {
            const result = await getSimilarProducts({
                query: {
                    language: parseLanguage(i18n.language),
                    currency: currency,
                },
                path: { shopId, shopsProductId },
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            if (result.response.status === 202) {
                return {
                    products: [],
                    isEmbeddingsPending: true,
                };
            }

            if (!Array.isArray(result.data)) {
                return {
                    products: [],
                    isEmbeddingsPending: false,
                };
            }

            return {
                products: result.data.map((product) =>
                    mapPersonalizedGetProductSummaryDataToOverviewProduct(product, i18n.language),
                ),
                isEmbeddingsPending: false,
            };
        },
    });
}
