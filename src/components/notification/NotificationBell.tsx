import { Button } from "@/components/ui/button.tsx";
import { useMarkAllNotificationsSeen } from "@/hooks/notification/useMarkAllNotificationsSeen.ts";
import { useNotifications } from "@/hooks/notification/useNotifications.ts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Bell, BellRing } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { NotificationItem } from "./NotificationItem.tsx";

const SKELETON_IDS = Array.from({ length: 3 }, (_, i) => `skeleton-${i}`);

function NotificationSkeleton() {
    return (
        <div className="flex animate-pulse items-start gap-3 px-4 py-3">
            <div className="mt-1.5 size-2 rounded-full bg-muted" />
            <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-3.5 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
        </div>
    );
}

export function NotificationBell() {
    const { t } = useTranslation();
    const { data, isLoading } = useNotifications();
    const markAllAsSeen = useMarkAllNotificationsSeen();

    const allNotifications = data?.pages[0]?.items ?? [];
    const notifications = allNotifications.slice(0, 5);
    const hasUnseenNotifications = allNotifications.some((n) => !n.seen);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={t("notifications.ariaLabel")}
                >
                    {hasUnseenNotifications ? (
                        <BellRing className="size-5" />
                    ) : (
                        <Bell className="size-5" />
                    )}
                    {hasUnseenNotifications && (
                        <span className="pointer-events-none absolute right-1 top-1 size-2 rounded-full bg-primary" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 overflow-hidden p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <span className="text-sm font-semibold">{t("notifications.title")}</span>
                    {hasUnseenNotifications && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => markAllAsSeen.mutate()}
                            disabled={markAllAsSeen.isPending}
                        >
                            {t("notifications.markAllRead")}
                        </Button>
                    )}
                </div>
                <div className="max-h-[400px] divide-y overflow-y-auto">
                    {isLoading && SKELETON_IDS.map((id) => <NotificationSkeleton key={id} />)}
                    {!isLoading && notifications.length === 0 && (
                        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                            {t("notifications.noNotifications")}
                        </p>
                    )}
                    {!isLoading &&
                        notifications.map((notification) => (
                            <NotificationItem
                                key={notification.notificationId}
                                notification={notification}
                            />
                        ))}
                </div>
                {!isLoading && allNotifications.length > 0 && (
                    <div className="border-t px-4 py-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground hover:text-foreground"
                            asChild
                        >
                            <Link to="/notifications">{t("notifications.showAll")}</Link>
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
