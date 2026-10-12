import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { NotificationCollection } from "@/data/internal/notification/Notification.ts";
import { isCurrentViewer } from "@/features/authentication/lib/mutationViewer.ts";
import {
    cancelListingQueries,
    invalidateListingQueries,
    patchListingUserState,
    withoutUnseenNotifications,
} from "@/features/product/catalog/lib/listingUserStateCache.ts";

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
    // Stop older list responses from overwriting the acknowledged mutation.
    await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationKey }),
        cancelListingQueries(queryClient, viewerId),
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
    patchListingUserState(queryClient, "allListings", withoutUnseenNotifications(ids), viewerId);
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKey }),
        invalidateListingQueries(queryClient, viewerId),
    ]);
}
