import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { UnseenNotificationBadge } from "@/components/product/badges/UnseenNotificationBadge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { Eye, ImageOff } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";
import { useCallback } from "react";
import { useMarkNotificationSeen } from "@/hooks/notification/useMarkNotificationSeen.ts";
import { cn } from "@/lib/utils.ts";
import { isRestrictedImage } from "@/data/internal/product/ProductImageData.ts";
import { ProhibitedImagePlaceholder } from "@/components/common/ProhibitedImagePlaceholder.tsx";

export function ProductSimilarCard({ product }: { readonly product: OverviewProduct }) {
    const { t } = useTranslation();
    const hasUnseenNotification =
        product.userData?.notificationData?.hasUnseenNotification ?? false;
    const originEventId = product.userData?.notificationData?.originEventId;
    const markSeen = useMarkNotificationSeen();

    const handleProductClick = useCallback(() => {
        if (hasUnseenNotification && originEventId) {
            markSeen.mutate(originEventId);
        }
    }, [hasUnseenNotification, originEventId, markSeen.mutate]);

    return (
        <Card
            className={cn(
                "flex flex-col h-full p-0 shadow-md overflow-hidden min-w-0",
                hasUnseenNotification && "border-2 border-primary",
            )}
        >
            <div className={"shrink-0 flex justify-center"}>
                <Link
                    to="/shops/$shopSlugId/products/$productSlugId"
                    params={{
                        shopSlugId: product.shopSlugId,
                        productSlugId: product.productSlugId,
                    }}
                    className={"block w-full"}
                    onClick={handleProductClick}
                >
                    {product.images.length > 0 ? (
                        isRestrictedImage(
                            product.images[0],
                            product.userData?.restrictedContentData.consentGiven ?? false,
                        ) ? (
                            <ProhibitedImagePlaceholder className="w-full aspect-video" />
                        ) : (
                            <ImageWithFallback
                                className={
                                    "w-full aspect-video object-cover hover:opacity-90 transition-opacity"
                                }
                                src={product.images[0].url?.href}
                                alt=""
                                fallbackClassName="w-full aspect-video"
                            />
                        )
                    ) : (
                        <div className="w-full aspect-video bg-muted flex flex-col items-center justify-center gap-2">
                            <ImageOff
                                data-testid="placeholder-image"
                                className="w-12 h-12 text-muted-foreground"
                            />
                            <p className="text-xs text-muted-foreground">{t("product.noImage")}</p>
                        </div>
                    )}
                </Link>
            </div>
            <div className={"flex flex-col min-w-0 flex-1 justify-between p-4"}>
                <div className={"flex flex-col gap-2 min-w-0 overflow-hidden"}>
                    <Link
                        to="/shops/$shopSlugId/products/$productSlugId"
                        params={{
                            shopSlugId: product.shopSlugId,
                            productSlugId: product.productSlugId,
                        }}
                        className="min-w-0 overflow-hidden"
                        onClick={handleProductClick}
                    >
                        <H2
                            className={
                                "overflow-ellipsis line-clamp-2 hover:underline text-base! font-semibold!"
                            }
                        >
                            {product.title}
                        </H2>
                    </Link>
                    <H3 variant={"muted"} className={"line-clamp-1 overflow-ellipsis text-sm!"}>
                        {product.shopName}
                    </H3>
                </div>

                <div
                    className={
                        "flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-end w-full mt-4"
                    }
                >
                    <div className={"flex flex-col gap-2 shrink-0"}>
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge status={product.state} />
                            {hasUnseenNotification && <UnseenNotificationBadge />}
                        </div>
                        <PriceText className="min-w-0 overflow-hidden text-ellipsis text-xl! sm:text-2xl! font-bold!">
                            {product.price ?? t("product.unknownPrice")}
                        </PriceText>
                    </div>

                    <Button
                        variant={"secondary"}
                        size={"sm"}
                        asChild
                        className="w-full sm:w-auto sm:shrink-0"
                    >
                        <Link
                            to="/shops/$shopSlugId/products/$productSlugId"
                            params={{
                                shopSlugId: product.shopSlugId,
                                productSlugId: product.productSlugId,
                            }}
                            onClick={handleProductClick}
                        >
                            <Eye />
                            <span>{t("product.details")}</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
