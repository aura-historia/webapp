import {
    type Notification,
    isProductNotification,
} from "@/data/internal/notification/Notification.ts";
import {
    getNotificationSourceLabel,
    getNotificationTypeLabel,
} from "@/features/notification-center/lib/notificationUtils.ts";
import { useDeleteNotification } from "@/features/notification-center/api/useDeleteNotification.ts";
import { useMarkNotificationSeen } from "@/features/notification-center/api/useMarkNotificationSeen.ts";
import { NotificationChange } from "@/features/notification-center/components/NotificationChange.tsx";
import { NotificationThumbnail } from "@/features/notification-center/components/NotificationThumbnail.tsx";
import { ProductListingLink } from "@/features/product/catalog/components/ProductListingLink.tsx";
import { cn } from "@/lib/utils.ts";
import { Check, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouteContext } from "@tanstack/react-router";

const ICON_BUTTON_CLASS =
    "inline-flex size-11 cursor-pointer items-center justify-center rounded-pill text-ink-secondary hover:enabled:bg-surface-sunken hover:enabled:text-ink disabled:cursor-not-allowed disabled:opacity-35 sm:size-10 sm:shadow-[inset_0_0_0_1px_var(--line)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass";

/**
 * One notification on the notifications page (design "Notifications · Row"). Below 640px it is
 * compact: the change runs full width and the date and actions sit in a ruled footer.
 */
export function NotificationRow({
    notification,
    className,
}: {
    readonly notification: Notification;
    readonly className?: string;
}) {
    const { t, i18n } = useTranslation();
    const { timeZone } = useRouteContext({ from: "__root__" });
    const markAsSeen = useMarkNotificationSeen();
    const deleteNotification = useDeleteNotification();
    const { payload, seen, notificationId } = notification;
    const source = getNotificationSourceLabel(payload, t);
    const markRead = () => {
        if (!seen) markAsSeen.mutate(notificationId);
    };

    const titleClass = cn(
        "line-clamp-2 font-serif text-[18px] leading-[1.22] tracking-[-0.005em] sm:text-[22px]",
        seen ? "font-normal text-ink-secondary" : "font-medium text-ink",
    );

    return (
        <article
            className={cn(
                "relative grid grid-cols-[72px_minmax(0,1fr)] gap-x-3.5 gap-y-4 pt-5 pr-4 pb-2 pl-7 [grid-template-areas:'thumb_content'_'change_change'_'meta_meta']",
                "sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:gap-x-6 sm:py-7 sm:pr-7 sm:pl-11 sm:[grid-template-areas:'thumb_content_meta'_'thumb_change_meta']",
                seen ? "bg-surface" : "bg-surface-raised",
                className,
            )}
        >
            {!seen && (
                <span className="absolute top-[25px] left-3 size-2 rounded-pill bg-oxblood sm:top-[34px] sm:left-5">
                    <span className="sr-only">{t("notifications.unread")}</span>
                </span>
            )}

            <NotificationThumbnail
                payload={payload}
                className={cn(
                    "size-[72px] text-[24px] [grid-area:thumb] sm:size-28 sm:text-[34px]",
                    seen && "opacity-85",
                )}
            />

            <div className="flex min-w-0 flex-col gap-1.5 [grid-area:content]">
                <div className="flex flex-wrap items-center gap-2">
                    {!seen && (
                        <span
                            aria-hidden="true"
                            className="rounded-pill bg-oxblood px-[7px] py-[3px] font-mono text-tag leading-[1.2] tracking-[0.1em] text-on-oxblood uppercase"
                        >
                            {t("notifications.new")}
                        </span>
                    )}
                    <span
                        className={cn(
                            "font-mono text-kicker tracking-[0.14em] uppercase",
                            seen ? "text-ink-muted" : "text-oxblood",
                        )}
                    >
                        {getNotificationTypeLabel(payload, t)}
                        {source && <span className="text-ink-muted"> · {source}</span>}
                    </span>
                </div>
                <h3 className="m-0">
                    {isProductNotification(payload) ? (
                        <ProductListingLink
                            productListingTitleSlugId={payload.productListingTitleSlugId}
                            onClick={markRead}
                            className={cn(
                                titleClass,
                                "hover:underline hover:underline-offset-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass",
                            )}
                        >
                            {payload.productTitle ?? t("product.untitled")}
                        </ProductListingLink>
                    ) : (
                        <span className={titleClass}>{payload.listingSourceName}</span>
                    )}
                </h3>
                {isProductNotification(payload) && (
                    <span className="truncate font-mono text-tag leading-[1.2] tracking-[0.14em] text-ink-muted uppercase">
                        {payload.listingSourceName}
                    </span>
                )}
            </div>

            <div className="min-w-0 [grid-area:change]">
                <NotificationChange payload={payload} size="lg" onNavigate={markRead} />
            </div>

            <div className="-mt-1 flex items-center gap-1 border-t border-line-subtle pt-2 [grid-area:meta] sm:mt-0 sm:flex-col sm:items-end sm:gap-3 sm:border-t-0 sm:pt-0">
                <time
                    dateTime={notification.created.toISOString()}
                    className="flex-1 font-mono text-tag tracking-[0.1em] whitespace-nowrap text-ink-muted uppercase sm:flex-none sm:text-kicker"
                >
                    {new Intl.DateTimeFormat(i18n.language, {
                        dateStyle: "medium",
                        timeZone,
                    }).format(notification.created)}
                </time>
                <div className="flex gap-1">
                    {!seen && (
                        <button
                            type="button"
                            aria-label={t("notifications.markRead")}
                            title={t("notifications.markRead")}
                            disabled={markAsSeen.isPending}
                            onClick={() => markAsSeen.mutate(notificationId)}
                            className={ICON_BUTTON_CLASS}
                        >
                            <Check aria-hidden="true" className="size-4" strokeWidth={2} />
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
                        <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.8} />
                    </button>
                </div>
            </div>
        </article>
    );
}

/** Loading stand-in shaped like a notification row. */
export function NotificationRowSkeleton({ className }: { readonly className?: string }) {
    return (
        <div
            aria-hidden="true"
            data-testid="notification-row-skeleton"
            className={cn(
                "grid animate-pulse grid-cols-[72px_minmax(0,1fr)] gap-3.5 bg-surface-raised pt-5 pr-4 pb-5 pl-7 motion-reduce:animate-none sm:grid-cols-[112px_minmax(0,1fr)_120px] sm:gap-6 sm:py-7 sm:pr-7 sm:pl-11",
                className,
            )}
        >
            <div className="size-[72px] rounded-md bg-image-ground sm:size-28" />
            <div className="flex flex-col gap-3 pt-0.5">
                <div className="h-2.5 w-[28%] rounded-xs bg-surface-sunken" />
                <div className="h-5 w-[64%] rounded-xs bg-surface-sunken" />
                <div className="h-2.5 w-[22%] rounded-xs bg-surface-sunken" />
                <div className="mt-2 h-6 w-[38%] rounded-xs bg-surface-sunken" />
            </div>
            <div className="hidden flex-col items-end gap-3.5 sm:flex">
                <div className="h-2.5 w-[90px] rounded-xs bg-surface-sunken" />
                <div className="flex gap-1">
                    <div className="size-10 rounded-pill bg-surface-sunken" />
                    <div className="size-10 rounded-pill bg-surface-sunken" />
                </div>
            </div>
        </div>
    );
}
