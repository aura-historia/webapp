import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchWatchlistProduct } from "@/client";
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

class WatchlistRequestError extends Error {
    constructor(
        message: string,
        readonly status?: number,
    ) {
        super(message);
        this.name = "WatchlistRequestError";
    }
}

export function useWatchlistStateMutation(productListingId: string) {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (active: boolean) => {
            const result = await patchWatchlistProduct({
                path: { productListingId },
                body: { state: active ? "ACTIVE" : "INACTIVE_BY_USER" },
            });

            if (result.error) {
                throw new WatchlistRequestError(
                    getErrorMessage(mapToInternalApiError(result.error)),
                    result.response?.status,
                );
            }

            // The response is an entry. Listing details stay in their own cache contract.
            return undefined;
        },
        onMutate: async (active) => {
            await cancelWatchlistRelatedQueries(queryClient);
            const snapshots = snapshotWatchlistListingCaches(queryClient);
            updateWatchlistListingCaches(queryClient, productListingId, (listing) =>
                updateListingWatchlistState(listing, { watching: active }),
            );
            if (!active) removeListingFromWatchlistCache(queryClient, productListingId);
            return { snapshots };
        },
        onError: (error, _active, context) => {
            restoreWatchlistListingCaches(queryClient, context?.snapshots);
            if (error instanceof WatchlistRequestError && error.status === 401) {
                toast.info(t("watchlist.loginRequired"));
            } else {
                console.error("Error mutating watchlist state:", error);
                toast.error(error.message || t("watchlist.loadingError.description"));
            }
        },
        onSettled: async () => invalidateWatchlistRelatedQueries(queryClient),
    });
}
