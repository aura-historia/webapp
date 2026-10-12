import { useMutationState, type MutationKey } from "@tanstack/react-query";
import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";

export type WatchlistMutationType = "addToWatchlist" | "deleteFromWatchlist";

export type ListingWatchlistState = {
    readonly watching: boolean;
    readonly notifications: boolean;
};

/**
 * Watchlist writes live under the listing root so viewer changes discard them with the listing
 * caches. Both write kinds share one key per listing for the pending-state overlay.
 */
export const watchlistMutationKeys = {
    listing(productListingId: string) {
        return [...productListingQueryKeys.all, "watchlistMutation", productListingId] as const;
    },
    membership(productListingId: string) {
        return [...this.listing(productListingId), "membership"] as const;
    },
    notifications(productListingId: string) {
        return [...this.listing(productListingId), "notifications"] as const;
    },
};

/** Writes to one listing run in order, so a later toggle never races an earlier one. */
export function watchlistMutationScope(productListingId: string) {
    return { id: `watchlist:${productListingId}` };
}

export class WatchlistRequestError extends Error {
    constructor(
        message: string,
        readonly status?: number,
    ) {
        super(message);
        this.name = "WatchlistRequestError";
    }
}

function toPendingPatch(
    mutationKey: MutationKey | undefined,
    variables: unknown,
): Partial<ListingWatchlistState> {
    const kind = mutationKey?.at(-1);
    if (kind === "membership") return { watching: variables === "addToWatchlist" };
    if (kind === "notifications" && typeof variables === "boolean") {
        return { notifications: variables };
    }
    return {};
}

/**
 * Displayed watchlist state: the cached `userState` overlaid with this listing's pending writes,
 * oldest first. A failed write simply stops overlaying, so there is no cache snapshot to restore
 * and concurrent writes to other listings are unaffected.
 */
export function useListingWatchlistState(
    productListingId: string,
    cached: ListingWatchlistState | undefined,
): ListingWatchlistState {
    const pending = useMutationState({
        filters: {
            mutationKey: watchlistMutationKeys.listing(productListingId),
            status: "pending",
        },
        select: (mutation) =>
            toPendingPatch(mutation.options.mutationKey, mutation.state.variables),
    });

    return Object.assign(
        {
            watching: cached?.watching ?? false,
            notifications: cached?.notifications ?? false,
        },
        ...pending,
    );
}
