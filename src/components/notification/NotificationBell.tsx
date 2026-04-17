import { Button } from "@/components/ui/button.tsx";
import { useMarkAllNotificationsSeen } from "@/hooks/notification/useMarkAllNotificationsSeen.ts";
import { useDeleteAllNotifications } from "@/hooks/notification/useDeleteAllNotifications.ts";
import { useNotifications } from "@/hooks/notification/useNotifications.ts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Bell, BellRing, CheckCheck, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { NotificationItem } from "./NotificationItem.tsx";
import { useState } from "react";

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3"] as const;

function NotificationSkeleton() {
    return (
        <div className="flex animate-pulse items-start gap-3 px-4 py-3">
            <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border" />
            <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-3 w-3/4 bg-surface-container-highest" />
                <div className="h-3 w-1/2 bg-surface-container-high" />
                <div className="h-3 w-1/3 bg-surface-container-high" />
            </div>
        </div>
    );
}

export function NotificationBell() {
    const { t } = useTranslation();
    const { data, isLoading } = useNotifications();
    const markAllAsSeen = useMarkAllNotificationsSeen();
    const deleteAllNotifications = useDeleteAllNotifications();
    const [open, setOpen] = useState(false);

    const allNotifications = data?.pages[0]?.items ?? [];
    const notifications = allNotifications.slice(0, 5);
    const hasUnseenNotifications = allNotifications.some((n) => !n.seen);

    return (
        <Popover open={open} onOpenChange={setOpen}>
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
            <PopoverContent align="end" className="w-96 overflow-hidden rounded-none p-0">
                <div className="flex items-center justify-between border-b bg-surface-container-low px-4 py-3">
                    <span className="font-display italic text-base text-primary">
                        {t("notifications.title")}
                    </span>
                    {allNotifications.length > 0 && (
                        <div className="flex items-center gap-1">
                            {hasUnseenNotifications && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 text-muted-foreground hover:text-primary"
                                            onClick={() => markAllAsSeen.mutate()}
                                            disabled={markAllAsSeen.isPending}
                                            aria-label={t("notifications.markAllRead")}
                                        >
                                            <CheckCheck className="size-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {t("notifications.markAllRead")}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => deleteAllNotifications.mutate()}
                                        disabled={deleteAllNotifications.isPending}
                                        aria-label={t("notifications.deleteAll")}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("notifications.deleteAll")}</TooltipContent>
                            </Tooltip>
                        </div>
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
                    <div className="border-t bg-surface-container-low px-4 py-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs tracking-wide text-primary/60 uppercase hover:bg-transparent hover:text-primary"
                            asChild
                        >
                            <Link to="/me/notifications" onClick={() => setOpen(false)}>
                                {t("notifications.showAll")}
                            </Link>
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
