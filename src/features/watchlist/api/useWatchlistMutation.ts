import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addWatchlistProduct, deleteWatchlistProduct } from "@/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";
import {
    findMutationViewer,
    isCurrentViewer,
} from "@/features/authentication/lib/mutationViewer.ts";
import {
    cancelListingQueries,
    invalidateListingQueries,
    patchListingUserState,
    removeListingFromQueries,
    withWatchlistState,
} from "@/features/product/catalog/lib/listingUserStateCache.ts";
import {
    WatchlistRequestError,
    watchlistMutationKeys,
    watchlistMutationScope,
    type WatchlistMutationType,
} from "@/features/watchlist/api/watchlistMutationState.ts";

export type { WatchlistMutationType } from "@/features/watchlist/api/watchlistMutationState.ts";

export function useWatchlistMutation(productListingId: string) {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();
    const { t } = useTranslation();

    return useMutation({
        mutationKey: watchlistMutationKeys.membership(productListingId),
        scope: watchlistMutationScope(productListingId),
        // Pending state is shown by `useListingWatchlistState`; caches change only once confirmed.
        onMutate: findMutationViewer,
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
        onSuccess: async (_data, mutationType, viewerId) => {
            await cancelListingQueries(queryClient, viewerId);
            // A viewer change while awaiting must not write into the next viewer's caches.
            if (!(await isCurrentViewer(viewerId))) return;
            const watching = mutationType === "addToWatchlist";
            patchListingUserState(
                queryClient,
                { productListingId },
                withWatchlistState({ watching }),
                viewerId,
            );
            if (!watching) {
                removeListingFromQueries(
                    queryClient,
                    productListingQueryKeys.watchlistOf(viewerId),
                    productListingId,
                );
            }
        },
        onError: (error) => {
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
        onSettled: (_data, _error, _mutationType, viewerId) =>
            invalidateListingQueries(queryClient, viewerId),
    });
}
