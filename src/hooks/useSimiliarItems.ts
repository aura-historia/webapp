import { getSimilarItems } from "@/client";
import { mapToInternalOverviewItem, type OverviewItem } from "@/data/internal/OverviewItem";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";

type SimilarItemsData = {
    items: OverviewItem[];
    isEmbeddingsPending: boolean;
};

export function useSimilarItems(
    shopId: string,
    shopsItemId: string,
): UseQueryResult<SimilarItemsData> {
    const { getErrorMessage } = useApiError();

    return useQuery({
        queryKey: ["similarItems", shopId, shopsItemId],
        queryFn: async () => {
            const result = await getSimilarItems({
                path: { shopId, shopsItemId },
                query: {
                    // TODO: Make currency configurable
                    currency: "EUR",
                },
            });

            if (result.error) {
                throw new Error(getErrorMessage(result.error.error));
            }

            if (result.response.status === 202) {
                return {
                    items: [],
                    isEmbeddingsPending: true,
                };
            }

            if (!Array.isArray(result.data)) {
                return {
                    items: [],
                    isEmbeddingsPending: false,
                };
            }

            return {
                items: result.data.map(mapToInternalOverviewItem),
                isEmbeddingsPending: false,
            };
        },
    });
}
