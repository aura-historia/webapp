import {
    type Notification,
    isProductNotification,
} from "@/data/internal/notification/Notification.ts";
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
import { Button } from "@/components/ui/button.tsx";
import { Check, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function NotificationItem({ notification }: { readonly notification: Notification }) {
    const { t, i18n } = useTranslation();
    const markAsSeen = useMarkNotificationSeen();
    const deleteNotification = useDeleteNotification();
    const { payload, seen } = notification;
    const changeParts = getNotificationChangeParts(payload, t, i18n.language);

    return (
        <div className={cn("transition-colors hover:bg-accent", !seen && "bg-primary/5")}>
            <div className="flex min-w-0 items-start gap-3 px-4 py-3">
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
                        {!seen && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={t("notifications.markRead")}
                                        disabled={markAsSeen.isPending}
                                        onClick={() =>
                                            markAsSeen.mutate(notification.originEventId)
                                        }
                                        className="shrink-0 size-5 rounded text-muted-foreground hover:text-primary"
                                    >
                                        <Check className="size-3" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("notifications.markRead")}</TooltipContent>
                            </Tooltip>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={t("notifications.delete")}
                                    disabled={deleteNotification.isPending}
                                    onClick={() =>
                                        deleteNotification.mutate(notification.originEventId)
                                    }
                                    className="shrink-0 size-5 rounded text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="size-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("notifications.delete")}</TooltipContent>
                        </Tooltip>
                    </div>
                    {isProductNotification(payload) ? (
                        <Link
                            to="/shops/$shopSlugId/products/$productSlugId"
                            params={{
                                shopSlugId: payload.shopSlugId,
                                productSlugId: payload.productSlugId,
                            }}
                            onClick={() => !seen && markAsSeen.mutate(notification.originEventId)}
                            className={cn(
                                "mt-0.5 text-sm leading-snug hover:underline",
                                seen ? "text-foreground/60" : "font-semibold",
                            )}
                        >
                            {payload.productTitle}
                        </Link>
                    ) : (
                        <span
                            className={cn(
                                "mt-0.5 text-sm leading-snug",
                                seen ? "text-foreground/60" : "font-semibold",
                            )}
                        >
                            {payload.shopName}
                        </span>
                    )}
                    {isProductNotification(payload) && (
                        <span className="text-xs text-muted-foreground">{payload.shopName}</span>
                    )}
                    <div className="flex items-center mt-1.5">
                        {changeParts && (
                            <span className="flex items-baseline gap-1 text-xs text-muted-foreground">
                                <span className="line-through">{changeParts.from}</span>
                                <span>→</span>
                                <span>{changeParts.to}</span>
                            </span>
                        )}
                        <span
                            className="ml-auto shrink-0 text-[11px] text-muted-foreground"
                            suppressHydrationWarning
                        >
                            {intlFormatDistance(notification.created, new Date(), {
                                locale: i18n.language,
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
