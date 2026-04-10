import type { Notification } from "@/data/internal/notification/Notification.ts";
import {
    getNotificationChangeParts,
    getNotificationTypeLabel,
} from "@/components/notification/notificationUtils.ts";
import { useDeleteNotification } from "@/hooks/notification/useDeleteNotification.ts";
import { useMarkNotificationSeen } from "@/hooks/notification/useMarkNotificationSeen.ts";
import { useUserAccount } from "@/hooks/account/useUserAccount.ts";
import { isRestrictedImage } from "@/data/internal/product/ProductImageData.ts";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";
import { ProhibitedImagePlaceholder } from "@/components/common/ProhibitedImagePlaceholder.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { Card } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";
import { intlFormatDistance } from "date-fns";
import { Link } from "@tanstack/react-router";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { CheckCheck, ImageOff, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function NotificationCard({ notification }: { readonly notification: Notification }) {
    const { t, i18n } = useTranslation();
    const markAsSeen = useMarkNotificationSeen();
    const deleteNotification = useDeleteNotification();
    const { data: userAccount } = useUserAccount();
    const consentGiven = userAccount?.prohibitedContentConsent ?? false;
    const { payload, seen, originEventId } = notification;
    const image = payload.image;
    const changeParts = getNotificationChangeParts(payload, t, i18n.language);

    return (
        <Card
            className={cn(
                "flex flex-col lg:flex-row p-8 gap-4 shadow-md min-w-0 transition-colors hover:bg-accent",
                !seen && "bg-primary/5",
            )}
        >
            <div className="shrink-0 flex lg:justify-start justify-center items-start gap-4">
                <span
                    className={cn(
                        "mt-[5.5rem] size-2 shrink-0 rounded-full",
                        seen ? "bg-border" : "bg-primary",
                    )}
                    aria-hidden="true"
                />
                {image ? (
                    isRestrictedImage(image, consentGiven) ? (
                        <ProhibitedImagePlaceholder
                            className="size-48 shrink-0 rounded-lg"
                            showLabel={false}
                        />
                    ) : (
                        <ImageWithFallback
                            src={image.url?.href}
                            alt=""
                            loading="lazy"
                            className="size-48 shrink-0 rounded-lg object-cover"
                            fallbackClassName="size-48 shrink-0 rounded-lg"
                            showErrorMessage={false}
                        />
                    )
                ) : (
                    <div className="size-48 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                        <ImageOff className="size-8 text-muted-foreground" />
                    </div>
                )}
            </div>

            <div className="flex flex-col min-w-0 flex-1 justify-between">
                <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col gap-2 min-w-0 overflow-hidden">
                        <span className="text-lg font-medium text-muted-foreground">
                            {getNotificationTypeLabel(payload, t)}
                        </span>
                        <Link
                            to="/shops/$shopSlugId/products/$productSlugId"
                            params={{
                                shopSlugId: payload.shopSlugId,
                                productSlugId: payload.productSlugId,
                            }}
                            className="min-w-0 overflow-hidden"
                            onClick={() => !seen && markAsSeen.mutate(originEventId)}
                        >
                            <H2 className="overflow-ellipsis line-clamp-1 hover:underline">
                                {payload.productTitle}
                            </H2>
                        </Link>
                        <H3 variant="muted" className="line-clamp-1 overflow-ellipsis">
                            {payload.shopName}
                        </H3>
                    </div>

                    <div className="flex flex-row gap-1 shrink-0">
                        {!seen && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label={t("notifications.markRead")}
                                        disabled={markAsSeen.isPending}
                                        onClick={() => markAsSeen.mutate(originEventId)}
                                        className="size-10 flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                                    >
                                        <CheckCheck className="size-5" />
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
                                    onClick={() => deleteNotification.mutate(originEventId)}
                                    className="size-10 flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                                >
                                    <Trash2 className="size-5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{t("notifications.delete")}</TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex flex-row justify-between items-end w-full mt-4 lg:mt-0">
                    {changeParts && (
                        <span className="flex items-baseline gap-2 text-2xl font-semibold">
                            <span className="line-through text-muted-foreground">
                                {changeParts.from}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span>{changeParts.to}</span>
                        </span>
                    )}
                    <span
                        className="text-base text-muted-foreground shrink-0 ml-auto"
                        suppressHydrationWarning
                    >
                        {intlFormatDistance(notification.created, new Date(), {
                            locale: i18n.language,
                        })}
                    </span>
                </div>
            </div>
        </Card>
    );
}
