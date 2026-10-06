import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addWatchlistProduct, deleteWatchlistProduct } from "@/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import {
    cancelWatchlistRelatedQueries,
    invalidateWatchlistRelatedQueries,
    removeListingFromWatchlistCache,
    restoreWatchlistListingCaches,
    snapshotWatchlistListingCaches,
    updateListingWatchlistState,
    updateWatchlistListingCaches,
} from "@/features/watchlist/api/watchlistCache.ts";

export type WatchlistMutationType = "addToWatchlist" | "deleteFromWatchlist";

class WatchlistRequestError extends Error {
    constructor(
        message: string,
        readonly status?: number,
    ) {
        super(message);
        this.name = "WatchlistRequestError";
    }
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
                throw new WatchlistRequestError(
                    getErrorMessage(mapToInternalApiError(result.error)),
                    result.response?.status,
                );
            }

            // Mutation DTOs describe only a watchlist entry. Keep them out of listing caches.
            return undefined;
        },
        onMutate: async (mutationType) => {
            await cancelWatchlistRelatedQueries(queryClient);
            const snapshots = snapshotWatchlistListingCaches(queryClient);
            const watching = mutationType === "addToWatchlist";

            updateWatchlistListingCaches(queryClient, productListingId, (listing) => {
                return updateListingWatchlistState(listing, { watching });
            });
            if (mutationType === "deleteFromWatchlist") {
                removeListingFromWatchlistCache(queryClient, productListingId);
            }

            return { snapshots };
        },
        onError: (error, _mutationType, context) => {
            restoreWatchlistListingCaches(queryClient, context?.snapshots);

            if (error instanceof WatchlistRequestError && error.status === 401) {
                toast.info(t("watchlist.loginRequired"));
            } else if (
                error instanceof WatchlistRequestError &&
                (error.status === 409 || error.status === 422)
            ) {
                toast.warning(error.message);
            } else {
                console.error("Error mutating watchlist:", error);
                toast.error(error.message || t("watchlist.loadingError.description"));
            }
        },
        onSettled: async () => invalidateWatchlistRelatedQueries(queryClient),
    });
}
