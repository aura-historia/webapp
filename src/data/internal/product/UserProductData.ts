import type { ProductUserStateData } from "@/client";

export type SearchFilterProductData = {
    readonly matched: boolean;
    readonly hidden: boolean;
    readonly matchFeedback?: boolean;
    readonly matchReason?: string;
    readonly userSearchFilterId?: string;
};

export type UserProductData = {
    readonly watchlistData: WatchlistProductData;
    readonly notificationData: NotificationProductData;
    readonly restrictedContentData: UserRestrictedContentData;
    readonly searchFilterData?: SearchFilterProductData;
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
        searchFilterData: {
            matched: apiData.searchFilter.matched,
            hidden: apiData.searchFilter.hidden,
            matchFeedback: apiData.searchFilter.matchFeedback,
            matchReason: apiData.searchFilter.matchReason,
            userSearchFilterId: apiData.searchFilter.userSearchFilterId,
        },
    };
}
