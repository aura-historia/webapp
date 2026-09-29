import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { NotificationCollection } from "@/data/internal/notification/Notification.ts";
import type { ProductListingUserState } from "@/data/internal/product/UserProductData.ts";
import {
    invalidateWatchlistRelatedQueries,
    isProductListingDetailQuery,
} from "@/features/watchlist/api/watchlistCache.ts";

const listingPrefixes = new Set([
    "watchlist",
    "search",
    "similarProductListings",
    "dealerProducts",
    "searchFilterMatchedProducts",
    "searchFilterPreviewProducts",
    "productListings",
]);

// Collection caches contain domain models; detail query caches contain personalized wrappers.
// Both carry the same unread ID projection. Only update that projection.
function updateUnreadState(value: unknown, ids: ReadonlySet<string> | undefined): unknown {
    if (Array.isArray(value)) return value.map((item) => updateUnreadState(item, ids));
    if (!value || typeof value !== "object") return value;
    const next: Record<string, unknown> = { ...value };
    if ("userState" in next && next.userState && typeof next.userState === "object") {
        const state = next.userState as ProductListingUserState;
        if (state.notification?.unseenNotificationIds) {
            const unseenNotificationIds = state.notification.unseenNotificationIds.filter(
                (id) => ids !== undefined && !ids.has(id),
            );
            next.userState = {
                ...state,
                notification: {
                    ...state.notification,
                    unseenNotificationIds,
                    ...("hasUnseenNotification" in state.notification
                        ? { hasUnseenNotification: unseenNotificationIds.length > 0 }
                        : {}),
                },
            };
        }
    }
    for (const key of ["pages", "products", "items"]) {
        if (key in next) next[key] = updateUnreadState(next[key], ids);
    }
    return next;
}

/** Apply only after a successful 204: failed requests leave caches untouched. */
export async function commitNotificationMutation(
    queryClient: QueryClient,
    notificationIds: readonly string[] | undefined,
    action: "seen" | "delete",
) {
    const ids = notificationIds === undefined ? undefined : new Set(notificationIds);
    // Stop older list responses from overwriting the acknowledged mutation.
    await queryClient.cancelQueries({ queryKey: ["getNotifications"] });
    queryClient.setQueriesData<InfiniteData<NotificationCollection>>(
        { queryKey: ["getNotifications"] },
        (data) =>
            data && {
                ...data,
                pages: data.pages.map((page) => {
                    const items =
                        action === "delete"
                            ? page.items.filter(
                                  (item) => ids !== undefined && !ids.has(item.notificationId),
                              )
                            : page.items.map((item) =>
                                  ids === undefined || ids.has(item.notificationId)
                                      ? { ...item, seen: true }
                                      : item,
                              );
                    return {
                        ...page,
                        items,
                        size: items.length,
                        ...(action === "delete" && ids === undefined
                            ? { searchAfter: undefined }
                            : {}),
                    };
                }),
            },
    );
    const listingQueries = queryClient.getQueryCache().findAll({
        predicate: ({ queryKey }) =>
            listingPrefixes.has(String(queryKey[0])) || isProductListingDetailQuery(queryKey),
    });
    await Promise.all(
        listingQueries.map((query) =>
            queryClient.cancelQueries({ queryKey: query.queryKey, exact: true }),
        ),
    );
    for (const query of listingQueries) {
        queryClient.setQueryData(query.queryKey, (data: unknown) => updateUnreadState(data, ids));
    }
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["getNotifications"] }),
        queryClient.invalidateQueries({ queryKey: ["productListings"] }),
        invalidateWatchlistRelatedQueries(queryClient),
    ]);
}
