import { useNotifications } from "@/features/notification-center/api/useNotifications.ts";

/** Number of unseen notifications among the pages loaded so far. */
export function useUnseenNotificationCount(): number {
    const { data } = useNotifications();

    return (
        data?.pages.reduce(
            (count, page) => count + page.items.filter((notification) => !notification.seen).length,
            0,
        ) ?? 0
    );
}
