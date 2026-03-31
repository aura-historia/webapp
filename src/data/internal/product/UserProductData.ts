import type { ProductUserStateData } from "@/client";

export type UserProductData = {
    readonly watchlistData: WatchlistProductData;
    readonly notificationData: NotificationProductData;
    readonly restrictedContentData: UserRestrictedContentData;
};

type WatchlistProductData = {
    isWatching: boolean;
    isNotificationEnabled: boolean;
};

type NotificationProductData = {
    hasUnseenNotification: boolean;
    originEventId?: string;
};

type UserRestrictedContentData = {
    consentGiven: boolean;
};

export function mapToInternalUserProductData(apiData: ProductUserStateData): UserProductData {
    return {
        watchlistData: {
            isWatching: apiData.watchlist.watching ?? false,
            isNotificationEnabled: apiData.watchlist.notifications ?? false,
        },
        notificationData: {
            hasUnseenNotification: !(apiData.notification?.seen ?? true),
            originEventId: apiData.notification?.originEventId,
        },
        restrictedContentData: {
            consentGiven: apiData.prohibitedContent.consent ?? false,
        },
    };
}
