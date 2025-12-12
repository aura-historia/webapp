import { getSimilarProducts } from "@/client";
import {
    mapToInternalOverviewProduct,
    type OverviewProduct,
} from "@/data/internal/OverviewProduct";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { mapToInternalApiError } from "@/data/internal/ApiError.ts";

type SimilarProductsData = {
    products: OverviewProduct[];
    isEmbeddingsPending: boolean;
};

export function useSimilarProducts(
    shopId: string,
    shopsProductId: string,
): UseQueryResult<SimilarProductsData> {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: ["similarProducts", shopId, shopsProductId],
        queryFn: async () => {
            const result = await getSimilarProducts({
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
                products: result.data.map(mapToInternalOverviewProduct),
                isEmbeddingsPending: false,
            };
        },
    });
}
