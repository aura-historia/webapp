import { Button } from "@/components/ui/button.tsx";
import { useMarkAllNotificationsSeen } from "@/features/notification-center/api/useMarkAllNotificationsSeen.ts";
import { useDeleteAllNotifications } from "@/features/notification-center/api/useDeleteAllNotifications.ts";
import { useNotifications } from "@/features/notification-center/api/useNotifications.ts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { NotificationItem } from "./NotificationItem.tsx";
import { useState } from "react";
import { cn } from "@/lib/utils.ts";

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

interface NotificationBellProps {
    readonly triggerClassName?: string;
    /** `count` shows the unseen number on a pill; `dot` shows a small dot (compact phone bars). */
    readonly badge?: "count" | "dot";
    readonly badgeClassName?: string;
}

const MAX_BADGE_COUNT = 9;

export function NotificationBell({
    triggerClassName,
    badge = "count",
    badgeClassName,
}: NotificationBellProps = {}) {
    const { t } = useTranslation();
    const { data, isLoading } = useNotifications();
    const markAllAsSeen = useMarkAllNotificationsSeen();
    const deleteAllNotifications = useDeleteAllNotifications();
    const [open, setOpen] = useState(false);

    const allNotifications = data?.pages.flatMap((page) => page.items) ?? [];
    const notifications = allNotifications.slice(0, 5);
    const unseenCount = allNotifications.filter((n) => !n.seen).length;
    const hasUnseenNotifications = unseenCount > 0;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "relative inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-secondary transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass data-[state=open]:text-ink",
                        triggerClassName,
                    )}
                    aria-label={
                        hasUnseenNotifications
                            ? t("header.alertsUnseen", { count: unseenCount })
                            : t("notifications.ariaLabel")
                    }
                >
                    <Bell aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                    {hasUnseenNotifications && badge === "count" && (
                        <span
                            aria-hidden="true"
                            className={cn(
                                "pointer-events-none absolute top-1.5 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-pill bg-oxblood px-1 font-mono text-[10px] font-medium text-on-oxblood",
                                badgeClassName,
                            )}
                        >
                            {unseenCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unseenCount}
                        </span>
                    )}
                    {hasUnseenNotifications && badge === "dot" && (
                        <span
                            aria-hidden="true"
                            className={cn(
                                "pointer-events-none absolute top-2.5 right-2.5 size-2 rounded-full bg-brass shadow-[0_0_0_2px_var(--surface)]",
                                badgeClassName,
                            )}
                        />
                    )}
                </button>
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
                            <Link
                                to="/$lng/me/notifications"
                                onClick={() => setOpen(false)}
                                params={true}
                                from="/$lng"
                            >
                                {t("notifications.showAll")}
                            </Link>
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
