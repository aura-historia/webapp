import type { ItemUserStateData } from "@/client";

export type UserItemData = {
    readonly watchlistData: WatchlistItemData;
};

type WatchlistItemData = {
    isWatching: boolean;
    isNotificationEnabled: boolean;
};

export function mapToInternalUserItemData(apiData: ItemUserStateData): UserItemData {
    return {
        watchlistData: {
            isWatching: apiData.watchlist.watching ?? false,
            isNotificationEnabled: apiData.watchlist.notifications ?? false,
        },
    };
}
