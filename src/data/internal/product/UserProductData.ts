import type { ProductListingUserStateData } from "@/client";

/** Viewer-specific listing state after converting the personalized API wrapper. */
export type ProductListingUserState = {
    readonly watchlist: {
        readonly watching: boolean;
        readonly notifications: boolean;
    };
    readonly contentVisibility: {
        readonly showUnassessedOrSensitiveContent: boolean;
    };
    readonly notification: {
        readonly unseenNotificationIds: readonly string[];
        readonly hasUnseenNotification: boolean;
    };
    readonly searchFilter: {
        readonly matched: boolean;
        readonly hidden: boolean;
        readonly userSearchFilterId?: string;
        readonly userSearchFilterName?: string;
        readonly matchReason?: string;
        readonly matchFeedback?: boolean;
    };
};

/** Maps personalized viewer state and derives unread status from its ID collection. */
export function mapProductListingUserState(
    apiData: ProductListingUserStateData | null | undefined,
): ProductListingUserState | null | undefined {
    if (apiData == null) return apiData;

    const unseenNotificationIds = [...apiData.notification.unseenNotificationIds];

    return {
        watchlist: {
            watching: apiData.watchlist.watching,
            notifications: apiData.watchlist.notifications,
        },
        contentVisibility: {
            showUnassessedOrSensitiveContent:
                apiData.contentVisibility.showUnassessedOrSensitiveContent,
        },
        notification: {
            unseenNotificationIds,
            hasUnseenNotification: unseenNotificationIds.length > 0,
        },
        searchFilter: { ...apiData.searchFilter },
    };
}
