import {
    type Notification,
    isProductNotification,
} from "@/data/internal/notification/Notification.ts";
import { getNotificationTypeLabel } from "@/features/notification-center/lib/notificationUtils.ts";
import { useDeleteNotification } from "@/features/notification-center/api/useDeleteNotification.ts";
import { useMarkNotificationSeen } from "@/features/notification-center/api/useMarkNotificationSeen.ts";
import { NotificationChange } from "@/features/notification-center/components/NotificationChange.tsx";
import { NotificationThumbnail } from "@/features/notification-center/components/NotificationThumbnail.tsx";
import { cn } from "@/lib/utils.ts";
import { ProductListingLink } from "@/features/product/catalog/components/ProductListingLink.tsx";
import { Check, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouteContext } from "@tanstack/react-router";

const ICON_BUTTON_CLASS =
    "inline-flex size-8 cursor-pointer items-center justify-center rounded-pill text-ink-muted hover:enabled:bg-surface-sunken hover:enabled:text-ink disabled:cursor-not-allowed disabled:opacity-35 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass";

/** One row of the notification popover; its actions show on hover or focus, always on touch. */
export function NotificationItem({
    notification,
    onNavigate,
}: {
    readonly notification: Notification;
    readonly onNavigate?: () => void;
}) {
    const { t, i18n } = useTranslation();
    const { timeZone } = useRouteContext({ from: "__root__" });
    const markAsSeen = useMarkNotificationSeen();
    const deleteNotification = useDeleteNotification();
    const { payload, seen, notificationId } = notification;

    const open = () => {
        if (!seen) markAsSeen.mutate(notificationId);
        onNavigate?.();
    };

    return (
        <li
            className={cn(
                "group relative grid grid-cols-[56px_minmax(0,1fr)] gap-3.5 border-b border-line-subtle py-3.5 pr-5 pl-7 transition-colors motion-reduce:transition-none",
                seen ? "hover:bg-surface" : "bg-surface hover:bg-surface-sunken",
            )}
        >
            {!seen && (
                <span className="absolute top-[21px] left-[11px] size-2 rounded-pill bg-oxblood">
                    <span className="sr-only">{t("notifications.unread")}</span>
                </span>
            )}
            <NotificationThumbnail payload={payload} className="size-14 text-[20px]" />

            <div className="flex min-w-0 flex-col gap-[3px]">
                <div className="flex min-h-[18px] items-center gap-2 font-mono text-tag leading-[1.2]">
                    <span
                        className={cn(
                            "min-w-0 flex-1 truncate tracking-[0.14em] uppercase",
                            seen ? "text-ink-muted" : "text-oxblood",
                        )}
                    >
                        {getNotificationTypeLabel(payload, t)}
                    </span>
                    <time
                        dateTime={notification.created.toISOString()}
                        className="shrink-0 tracking-[0.08em] text-ink-muted uppercase"
                    >
                        {new Intl.DateTimeFormat(i18n.language, {
                            dateStyle: "medium",
                            timeZone,
                        }).format(notification.created)}
                    </time>
                </div>

                {isProductNotification(payload) ? (
                    <ProductListingLink
                        productListingTitleSlugId={payload.productListingTitleSlugId}
                        onClick={open}
                        className={cn(
                            "line-clamp-2 font-serif text-base leading-[1.25] hover:underline hover:underline-offset-3",
                            seen ? "text-ink-secondary" : "font-medium text-ink",
                        )}
                    >
                        {payload.productTitle ?? t("product.untitled")}
                    </ProductListingLink>
                ) : (
                    <span
                        className={cn(
                            "line-clamp-2 font-serif text-base leading-[1.25]",
                            seen ? "text-ink-secondary" : "font-medium text-ink",
                        )}
                    >
                        {payload.listingSourceName}
                    </span>
                )}
                {isProductNotification(payload) && (
                    <span className="truncate text-meta text-ink-muted">
                        {payload.listingSourceName}
                    </span>
                )}

                <div className="mt-1 flex min-h-8 items-center gap-2">
                    <div className="min-w-0 flex-1">
                        <NotificationChange payload={payload} size="sm" />
                    </div>
                    <div className="-mr-2 flex shrink-0 gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100">
                        {!seen && (
                            <button
                                type="button"
                                aria-label={t("notifications.markRead")}
                                title={t("notifications.markRead")}
                                disabled={markAsSeen.isPending}
                                onClick={() => markAsSeen.mutate(notificationId)}
                                className={ICON_BUTTON_CLASS}
                            >
                                <Check aria-hidden="true" className="size-[15px]" strokeWidth={2} />
                            </button>
                        )}
                        <button
                            type="button"
                            aria-label={t("notifications.delete")}
                            title={t("notifications.delete")}
                            disabled={deleteNotification.isPending}
                            onClick={() => deleteNotification.mutate(notificationId)}
                            className={ICON_BUTTON_CLASS}
                        >
                            <Trash2 aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                        </button>
                    </div>
                </div>
            </div>
        </li>
    );
}
