import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchWatchlistProduct } from "@/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import {
    findMutationViewer,
    isCurrentViewer,
} from "@/features/authentication/lib/mutationViewer.ts";
import {
    cancelListingQueries,
    invalidateListingQueries,
    patchListingUserState,
    withWatchlistState,
} from "@/features/product/catalog/lib/listingUserStateCache.ts";
import {
    WatchlistRequestError,
    watchlistMutationKeys,
    watchlistMutationScope,
} from "@/features/watchlist/api/watchlistMutationState.ts";
import { useSignedInMutate } from "@/features/watchlist/api/useSignedInMutate.ts";

export function useWatchlistNotificationMutation(productListingId: string) {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();
    const { t } = useTranslation();

    const mutation = useMutation({
        mutationKey: watchlistMutationKeys.notifications(productListingId),
        scope: watchlistMutationScope(productListingId),
        // Pending state is shown by `useListingWatchlistState`; caches change only once confirmed.
        onMutate: findMutationViewer,
        mutationFn: async (notifications: boolean) => {
            const result = await patchWatchlistProduct({
                path: { productListingId },
                body: { notifications },
            });

            if (result.error) {
                throw new WatchlistRequestError(
                    getErrorMessage(mapToInternalApiError(result.error)),
                    result.response?.status,
                );
            }

            // The response is a watchlist entry, not a product listing.
            return undefined;
        },
        onSuccess: async (_data, notifications, viewerId) => {
            await cancelListingQueries(queryClient, viewerId);
            // A viewer change while awaiting must not write into the next viewer's caches.
            if (!(await isCurrentViewer(viewerId))) return;
            patchListingUserState(
                queryClient,
                { productListingId },
                withWatchlistState({ notifications }),
                viewerId,
            );
        },
        onError: (error) => {
            if (error instanceof WatchlistRequestError && error.status === 401) {
                toast.info(t("watchlist.loginRequired"));
            } else {
                console.error("Error mutating watchlist:", error);
                toast.error(error.message || t("watchlist.loadingError.description"));
            }
        },
        onSettled: (_data, _error, _notifications, viewerId) =>
            invalidateListingQueries(queryClient, viewerId),
    });
    const mutate = useSignedInMutate(mutation.mutate);

    return { ...mutation, mutate };
}
