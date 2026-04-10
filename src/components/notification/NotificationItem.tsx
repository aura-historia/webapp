import type { Notification } from "@/data/internal/notification/Notification.ts";
import {
    getNotificationChangeParts,
    getNotificationTypeLabel,
} from "@/components/notification/notificationUtils.ts";
import { useDeleteNotification } from "@/hooks/notification/useDeleteNotification.ts";
import { useMarkNotificationSeen } from "@/hooks/notification/useMarkNotificationSeen.ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import { intlFormatDistance } from "date-fns";
import { Link } from "@tanstack/react-router";
import { CheckCheck, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function NotificationItem({ notification }: { readonly notification: Notification }) {
    const { t, i18n } = useTranslation();
    const markAsSeen = useMarkNotificationSeen();
    const deleteNotification = useDeleteNotification();
    const { payload, seen } = notification;
    const changeParts = getNotificationChangeParts(payload, t, i18n.language);

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
                            {getNotificationTypeLabel(payload, t)}
                        </span>
                        <span
                            className="shrink-0 text-[11px] text-muted-foreground"
                            suppressHydrationWarning
                        >
                            {intlFormatDistance(notification.created, new Date(), {
                                locale: i18n.language,
                            })}
                        </span>
                        {!seen && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label={t("notifications.markRead")}
                                        disabled={markAsSeen.isPending}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            markAsSeen.mutate(notification.originEventId);
                                        }}
                                        className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-primary"
                                    >
                                        <CheckCheck className="size-3" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>{t("notifications.markRead")}</TooltipContent>
                            </Tooltip>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
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
                            </TooltipTrigger>
                            <TooltipContent>{t("notifications.delete")}</TooltipContent>
                        </Tooltip>
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
                    {changeParts && (
                        <span className="mt-1.5 flex items-baseline gap-1 text-xs text-muted-foreground">
                            <span className="line-through">{changeParts.from}</span>
                            <span>→</span>
                            <span>{changeParts.to}</span>
                        </span>
                    )}
                </div>
            </Link>
        </div>
    );
}
