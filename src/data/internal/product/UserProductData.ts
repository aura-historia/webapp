import type { ProductListingCollectionUserStateData, ProductListingUserStateData } from "@/client";

/**
 * Viewer-specific listing state after converting the personalized API wrapper. Each section is
 * present only when the backend returns it; an omitted section is unknown, not `false` or empty.
 */
export type ProductListingUserState = {
    readonly watchlist?: {
        readonly watching: boolean;
        readonly notifications: boolean;
    };
    readonly contentVisibility?: {
        readonly showUnassessedOrSensitiveContent: boolean;
    };
    readonly notification?: {
        readonly unseenNotificationIds: readonly string[];
        readonly hasUnseenNotification: boolean;
    };
    readonly searchFilter?: {
        readonly matched: boolean;
        readonly hidden: boolean;
        readonly userSearchFilterId?: string;
        readonly userSearchFilterName?: string;
        readonly matchFeedback?: boolean;
    };
};

/** Detail and collection responses share these sections; only their unmapped `shipping` differs. */
type ProductListingUserStateDto = Omit<
    ProductListingUserStateData | ProductListingCollectionUserStateData,
    "shipping"
>;

/** Maps the returned viewer-state sections and derives unread status from its ID collection. */
export function mapProductListingUserState(
    apiData: ProductListingUserStateDto | null | undefined,
): ProductListingUserState | null | undefined {
    if (apiData == null) return apiData;

    const { watchlist, contentVisibility, notification, searchFilter } = apiData;
    const unseenNotificationIds = notification ? [...notification.unseenNotificationIds] : [];

    return {
        ...(watchlist
            ? {
                  watchlist: {
                      watching: watchlist.watching,
                      notifications: watchlist.notifications,
                  },
              }
            : {}),
        ...(contentVisibility
            ? {
                  contentVisibility: {
                      showUnassessedOrSensitiveContent:
                          contentVisibility.showUnassessedOrSensitiveContent,
                  },
              }
            : {}),
        ...(notification
            ? {
                  notification: {
                      unseenNotificationIds,
                      hasUnseenNotification: unseenNotificationIds.length > 0,
                  },
              }
            : {}),
        ...(searchFilter ? { searchFilter: { ...searchFilter } } : {}),
    };
}
