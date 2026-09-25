import {
    type Notification,
    isProductNotification,
} from "@/data/internal/notification/Notification.ts";
import {
    getNotificationChangeParts,
    getNotificationTypeLabel,
} from "@/features/notification-center/lib/notificationUtils.ts";
import { useDeleteNotification } from "@/features/notification-center/api/useDeleteNotification.ts";
import { useMarkNotificationSeen } from "@/features/notification-center/api/useMarkNotificationSeen.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { isRestrictedImage } from "@/data/internal/product/ProductImageData.ts";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";
import { ProhibitedImagePlaceholder } from "@/features/product/catalog/components/media/ProhibitedImagePlaceholder.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { Card } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";
import { intlFormatDistance } from "date-fns";
import { ProductListingLink } from "@/features/product/catalog/components/ProductListingLink.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Check, ImageOff, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function NotificationCard({ notification }: { readonly notification: Notification }) {
    const { t, i18n } = useTranslation();
    const markAsSeen = useMarkNotificationSeen();
    const deleteNotification = useDeleteNotification();
    const { data: userAccount } = useUserAccount();
    const consentGiven = userAccount?.prohibitedContentConsent ?? false;
    const { payload, seen, notificationId } = notification;
    const changeParts = getNotificationChangeParts(payload, t, i18n.language);
    const productImage = isProductNotification(payload) ? payload.image : undefined;
    const notificationImageUrl = isProductNotification(payload)
        ? payload.image?.url?.href
        : payload.image;

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
                {notificationImageUrl ? (
                    productImage && isRestrictedImage(productImage, consentGiven) ? (
                        <ProhibitedImagePlaceholder
                            className="size-48 shrink-0 rounded-lg"
                            showLabel={false}
                        />
                    ) : (
                        <ImageWithFallback
                            src={notificationImageUrl}
                            alt=""
                            loading="lazy"
                            className="size-48 shrink-0 object-cover"
                            fallbackClassName="size-48 shrink-0"
                            showErrorMessage={false}
                        />
                    )
                ) : (
                    <div className="size-48 shrink-0 bg-muted flex items-center justify-center">
                        <ImageOff className="size-8 text-muted-foreground" />
                    </div>
                )}
            </div>

            <div className="flex flex-col min-w-0 flex-1 justify-between">
                <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col gap-2 min-w-0 overflow-hidden">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            {getNotificationTypeLabel(payload, t)}
                        </span>
                        {isProductNotification(payload) ? (
                            <ProductListingLink
                                productListingTitleSlugId={payload.productListingTitleSlugId}
                                className="min-w-0 overflow-hidden"
                                onClick={() => !seen && markAsSeen.mutate(notificationId)}
                            >
                                <H2 className="overflow-ellipsis line-clamp-1 hover:underline">
                                    {payload.productTitle ?? t("product.untitled")}
                                </H2>
                            </ProductListingLink>
                        ) : (
                            <H2 className="overflow-ellipsis line-clamp-1">
                                {payload.listingSourceName}
                            </H2>
                        )}
                        {isProductNotification(payload) && (
                            <H3 variant="muted" className="line-clamp-1 overflow-ellipsis">
                                {payload.listingSourceName}
                            </H3>
                        )}
                    </div>

                    <div className="flex flex-row gap-1 shrink-0">
                        {!seen && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={t("notifications.markRead")}
                                        disabled={markAsSeen.isPending}
                                        onClick={() => markAsSeen.mutate(notificationId)}
                                        className="size-10 text-muted-foreground hover:text-primary"
                                    >
                                        <Check className="size-5" />
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
                                    onClick={() => deleteNotification.mutate(notificationId)}
                                    className="size-10 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="size-5" />
                                </Button>
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
