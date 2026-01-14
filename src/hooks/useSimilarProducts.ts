import { getSimilarProducts } from "@/client";
import {
    mapPersonalizedGetProductDataToOverviewProduct,
    type OverviewProduct,
} from "@/data/internal/OverviewProduct";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/ApiError.ts";
import { parseLanguage } from "@/data/internal/Language.ts";
import { useTranslation } from "react-i18next";

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

    return useQuery({
        queryKey: ["similarProducts", shopId, shopsProductId, i18n.language],
        queryFn: async () => {
            const result = await getSimilarProducts({
                headers: {
                    "Accept-Language": parseLanguage(i18n.language),
                },
                path: { shopId, shopsProductId },
                query: {
                    // TODO: Make currency configurable
                    currency: "EUR",
                },
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
                    mapPersonalizedGetProductDataToOverviewProduct(product, i18n.language),
                ),
                isEmbeddingsPending: false,
            };
        },
    });
}
