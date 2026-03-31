import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { ShopTypeBadge } from "@/components/product/badges/ShopTypeBadge.tsx";
import { AuctionWindowBadge } from "@/components/product/badges/AuctionWindowBadge.tsx";
import { UnseenNotificationBadge } from "@/components/product/badges/UnseenNotificationBadge.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { ArrowUpRight, Eye } from "lucide-react";
import { H3 } from "@/components/typography/H3.tsx";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ProductQualityBadges } from "@/components/product/badges/ProductQualityBadges.tsx";
import { NotificationButton } from "@/components/product/buttons/NotificationButton.tsx";
import { WatchlistButton } from "@/components/product/buttons/WatchlistButton.tsx";
import { ProductCardImageCarousel } from "@/components/product/overview/ProductCardImageCarousel.tsx";
import { memo, useCallback } from "react";
import { useMarkNotificationSeen } from "@/hooks/notification/useMarkNotificationSeen.ts";
import { cn } from "@/lib/utils.ts";

function ProductCardComponent({ product }: { readonly product: OverviewProduct }) {
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
                "relative flex flex-col lg:flex-row p-8 gap-4 shadow-md min-w-0",
                hasUnseenNotification && "border-2 border-primary",
            )}
        >
            {hasUnseenNotification && (
                <div className="absolute left-8 top-0 z-10 -translate-y-1/2">
                    <UnseenNotificationBadge />
                </div>
            )}
            <div className={"shrink-0 flex lg:justify-start justify-center"}>
                <ProductCardImageCarousel
                    images={product.images}
                    shopSlugId={product.shopSlugId}
                    productSlugId={product.productSlugId}
                />
            </div>
            <div className={"flex flex-col min-w-0 flex-1 justify-between"}>
                <div className={"flex flex-row justify-between w-full"}>
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
                            <H2 className={"overflow-ellipsis line-clamp-1 hover:underline"}>
                                {product.title}
                            </H2>
                        </Link>
                        <H3 variant={"muted"} className={"line-clamp-1 overflow-ellipsis"}>
                            {product.shopName}
                        </H3>
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge status={product.state} />
                            <ShopTypeBadge shopType={product.shopType} />
                            {product.auction && <AuctionWindowBadge auction={product.auction} />}
                            <ProductQualityBadges product={product} />
                        </div>
                    </div>

                    <div className={"flex flex-row gap-2"}>
                        {product.userData?.watchlistData.isWatching && (
                            <NotificationButton
                                variant="ghost"
                                size="icon"
                                shopId={product.shopId}
                                shopsProductId={product.shopsProductId}
                                isNotificationEnabled={
                                    product.userData?.watchlistData.isNotificationEnabled
                                }
                            />
                        )}
                        <WatchlistButton
                            variant="ghost"
                            size="icon"
                            shopId={product.shopId}
                            shopsProductId={product.shopsProductId}
                            isWatching={product.userData?.watchlistData.isWatching ?? false}
                        />
                    </div>
                </div>

                <div
                    className={
                        "flex flex-col lg:flex-row gap-4 lg:gap-0 justify-between lg:items-end w-full mt-4 lg:mt-0"
                    }
                >
                    <PriceText className="min-w-0 overflow-hidden text-ellipsis">
                        {product.price ?? t("product.unknownPrice")}
                    </PriceText>

                    <div className={"flex flex-col gap-2 lg:items-end shrink-0 lg:ml-2"}>
                        <Button variant={"default"} asChild>
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
                        <Button variant={"secondary"} className="whitespace-nowrap" asChild>
                            <a
                                href={product.url?.href}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                            >
                                <ArrowUpRight />
                                <span>{t("product.toMerchant")}</span>
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export const ProductCard = memo(ProductCardComponent);
