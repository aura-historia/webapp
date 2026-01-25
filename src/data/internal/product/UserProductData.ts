import type { ProductUserStateData } from "@/client";

export type UserProductData = {
    readonly watchlistData: WatchlistProductData;
};

type WatchlistProductData = {
    isWatching: boolean;
    isNotificationEnabled: boolean;
};

export function mapToInternalUserProductData(apiData: ProductUserStateData): UserProductData {
    return {
        watchlistData: {
            isWatching: apiData.watchlist.watching ?? false,
            isNotificationEnabled: apiData.watchlist.notifications ?? false,
        },
    };
}
