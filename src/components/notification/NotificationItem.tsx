import type {
    Notification,
    NotificationPayload,
} from "@/data/internal/notification/Notification.ts";
import { formatPrice } from "@/data/internal/price/Price.ts";
import { useDeleteNotification } from "@/hooks/notification/useDeleteNotification.ts";
import { useMarkNotificationSeen } from "@/hooks/notification/useMarkNotificationSeen.ts";
import { cn } from "@/lib/utils.ts";
import TimeAgo from "javascript-time-ago";
import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

function getTypeLabel(payload: NotificationPayload, t: (key: string) => string): string {
    if (payload.type === "SEARCH_FILTER") return t("notifications.types.newMatch");
    if (payload.watchlistPayload.type === "PRICE_CHANGE")
        return t("notifications.types.priceChange");
    return t("notifications.types.stateChange");
}

function renderInfoText(
    payload: NotificationPayload,
    t: (key: string) => string,
    language: string,
) {
    if (payload.type === "WATCHLIST") {
        if (
            payload.watchlistPayload.type === "PRICE_CHANGE" &&
            payload.watchlistPayload.oldPrice &&
            payload.watchlistPayload.newPrice
        ) {
            return (
                <span className="mt-1.5 tabular-nums text-xs text-muted-foreground">
                    {formatPrice(payload.watchlistPayload.oldPrice, language)} →{" "}
                    {formatPrice(payload.watchlistPayload.newPrice, language)}
                </span>
            );
        }

        if (payload.watchlistPayload.type === "STATE_CHANGE") {
            return (
                <span className="mt-1.5 text-xs text-muted-foreground">
                    {t(`productState.${payload.watchlistPayload.oldState.toLowerCase()}`)} →{" "}
                    {t(`productState.${payload.watchlistPayload.newState.toLowerCase()}`)}
                </span>
            );
        }
    }

    if (payload.type === "SEARCH_FILTER") {
        return (
            <span className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
                {payload.searchFilterName}
            </span>
        );
    }

    return null;
}

export function NotificationItem({ notification }: { readonly notification: Notification }) {
    const { t, i18n } = useTranslation();
    const markAsSeen = useMarkNotificationSeen();
    const deleteNotification = useDeleteNotification();
    const timeAgo = useMemo(() => new TimeAgo(i18n.language), [i18n.language]);
    const { payload, seen } = notification;

    return (
        <div className={cn("transition-colors hover:bg-accent", !seen && "bg-primary/5")}>
            <Link
                to="/shops/$shopSlugId/products/$productSlugId"
                params={{ shopSlugId: payload.shopSlugId, productSlugId: payload.productSlugId }}
                onClick={() => !seen && markAsSeen.mutate(notification.originEventId)}
                className="flex min-w-0 items-start gap-3 px-4 py-3"
            >
                <span
                    className={cn(
                        "mt-[5px] size-1.5 shrink-0 rounded-full",
                        seen ? "bg-border" : "bg-primary",
                    )}
                    aria-hidden="true"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-1">
                        <span className="flex-1 text-xs text-muted-foreground">
                            {getTypeLabel(payload, t)}
                        </span>
                        <span
                            className="shrink-0 text-[11px] text-muted-foreground"
                            suppressHydrationWarning
                        >
                            {timeAgo.format(notification.created)}
                        </span>
                        <button
                            type="button"
                            aria-label={t("notifications.delete")}
                            disabled={deleteNotification.isPending}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteNotification.mutate(notification.originEventId);
                            }}
                            className="-mr-1 shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                        >
                            <Trash2 className="size-3" />
                        </button>
                    </div>
                    <span
                        className={cn(
                            "mt-0.5 text-sm leading-snug",
                            seen ? "text-foreground/60" : "font-semibold",
                        )}
                    >
                        {payload.productTitle}
                    </span>
                    <span className="text-xs text-muted-foreground">{payload.shopName}</span>
                    {renderInfoText(payload, t, i18n.language)}
                </div>
            </Link>
        </div>
    );
}
