import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addWatchlistProduct, deleteWatchlistProduct } from "@/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";

export type WatchlistMutationType = "addToWatchlist" | "deleteFromWatchlist";

function isProductListingQuery(queryKey: readonly unknown[]): boolean {
    return queryKey.some(
        (part) =>
            typeof part === "object" &&
            part !== null &&
            "_id" in part &&
            ["getProductListingByTitleSlug", "getProductListing"].includes(
                String((part as { _id?: unknown })._id),
            ),
    );
}

export function useWatchlistMutation(productListingId: string) {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (mutationType: WatchlistMutationType) => {
            const result =
                mutationType === "deleteFromWatchlist"
                    ? await deleteWatchlistProduct({ path: { productListingId } })
                    : await addWatchlistProduct({ body: { productListingId } });

            if (result.error) {
                if (result.response?.status === 401) {
                    toast.info(t("watchlist.loginRequired"));
                    return;
                }
                if (result.response?.status === 422) {
                    toast.warning(getErrorMessage(mapToInternalApiError(result.error)));
                    return;
                }
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            return result.data;
        },
        onError: (error) => {
            console.error("Error mutating watchlist:", error);
            toast.error(error.message || t("watchlist.loadingError.description"));
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
                queryClient.invalidateQueries({ queryKey: ["search"] }),
                queryClient.invalidateQueries({
                    predicate: ({ queryKey }) => isProductListingQuery(queryKey),
                }),
            ]);
        },
    });
}
