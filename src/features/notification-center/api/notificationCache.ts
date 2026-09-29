import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "aws-amplify/auth";
import type { NotificationCollection } from "@/data/internal/notification/Notification.ts";
import type { ProductListingUserState } from "@/data/internal/product/UserProductData.ts";
import { isProductListingDetailQuery } from "@/features/watchlist/api/watchlistCache.ts";

const listingPrefixes = new Set([
    "watchlist",
    "search",
    "similarProductListings",
    "dealerProducts",
    "searchFilterMatchedProducts",
    "searchFilterPreviewProducts",
    "productListings",
    "sourceProductListings",
]);

/** Capture the authenticated identity before the mutation request is dispatched. */
export async function getNotificationMutationViewer(): Promise<string> {
    return (await getCurrentUser()).userId;
}

async function isCurrentViewer(viewerId: string): Promise<boolean> {
    try {
        return (await getCurrentUser()).userId === viewerId;
    } catch {
        return false;
    }
}

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
    viewerId: string | undefined,
) {
    if (!viewerId || !(await isCurrentViewer(viewerId))) return;
    const ids = notificationIds === undefined ? undefined : new Set(notificationIds);
    const notificationKey = ["getNotifications", viewerId];
    const listingQueries = queryClient.getQueryCache().findAll({
        predicate: ({ queryKey }) => {
            if (queryKey[0] === "watchlist") return queryKey[1] === viewerId;
            if (queryKey[0] === "productListings") {
                return queryKey.some(
                    (part, index) => part === "viewer" && queryKey[index + 1] === viewerId,
                );
            }
            return (
                listingPrefixes.has(String(queryKey[0])) || isProductListingDetailQuery(queryKey)
            );
        },
    });
    // Stop older list responses from overwriting the acknowledged mutation.
    await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationKey }),
        ...listingQueries.map((query) =>
            queryClient.cancelQueries({ queryKey: query.queryKey, exact: true }),
        ),
    ]);
    // An account transition may have occurred while awaiting cancellation.
    if (!(await isCurrentViewer(viewerId))) return;
    queryClient.setQueriesData<InfiniteData<NotificationCollection>>(
        { queryKey: notificationKey },
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
    for (const query of listingQueries) {
        queryClient.setQueryData(query.queryKey, (data: unknown) => updateUnreadState(data, ids));
    }
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKey }),
        ...listingQueries.map((query) =>
            queryClient.invalidateQueries({ queryKey: query.queryKey, exact: true }),
        ),
    ]);
}
