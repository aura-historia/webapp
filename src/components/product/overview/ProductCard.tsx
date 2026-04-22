import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { ShopTypeBadge } from "@/components/product/badges/ShopTypeBadge.tsx";
import { AuctionWindowBadge } from "@/components/product/badges/AuctionWindowBadge.tsx";
import { UnseenNotificationBadge } from "@/components/product/badges/UnseenNotificationBadge.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { ArrowUpRight, Eye } from "lucide-react";
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
        <article
            className={cn(
                "relative flex h-full min-w-0 flex-col overflow-hidden border border-outline-variant/20 bg-surface-container-lowest transition-all duration-300 ease-out",
                "shadow-[0_12px_40px_rgba(28,28,22,0.06)]",
                hasUnseenNotification && "border-primary",
            )}
        >
            <div className="relative">
                <ProductCardImageCarousel
                    images={product.images}
                    userData={product.userData}
                    shopSlugId={product.shopSlugId}
                    productSlugId={product.productSlugId}
                    onProductClick={handleProductClick}
                />

                {hasUnseenNotification && (
                    <div className="absolute left-3 top-3 z-20">
                        <UnseenNotificationBadge />
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col p-5">
                <div className="flex min-w-0 items-start justify-between gap-3 pb-3">
                    <div className="min-w-0">
                        <Link
                            to="/shops/$shopSlugId/products/$productSlugId"
                            params={{
                                shopSlugId: product.shopSlugId,
                                productSlugId: product.productSlugId,
                            }}
                            className="min-w-0"
                            onClick={handleProductClick}
                        >
                            <H2 className="line-clamp-2 text-[1.35rem] leading-8 italic transition-colors duration-300 ease-out hover:text-primary-container">
                                {product.title}
                            </H2>
                        </Link>

                        {product.description && (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-on-surface/80">
                                {product.description}
                            </p>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        <NotificationButton
                            variant="ghost"
                            size="icon"
                            className="text-primary transition-colors duration-300 ease-out hover:bg-surface"
                            shopId={product.shopId}
                            shopsProductId={product.shopsProductId}
                            isNotificationEnabled={
                                product.userData?.watchlistData.isNotificationEnabled ?? false
                            }
                            isVisible={product.userData?.watchlistData.isWatching ?? false}
                        />
                        <WatchlistButton
                            variant="ghost"
                            size="icon"
                            className="text-primary transition-colors duration-300 ease-out hover:bg-surface"
                            shopId={product.shopId}
                            shopsProductId={product.shopsProductId}
                            isWatching={product.userData?.watchlistData.isWatching ?? false}
                        />
                    </div>
                </div>

                <div className="flex min-w-0 items-center gap-2 pb-3">
                    <span className="max-w-full truncate rounded-none bg-secondary-container px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-on-secondary-container">
                        {product.shopName}
                    </span>
                    <span className="text-xs text-on-surface/60">-</span>
                    <ShopTypeBadge
                        shopType={product.shopType}
                        className="text-[10px] rounded-none border-none px-2 py-1 bg-secondary-container text-on-secondary-container"
                    />
                </div>

                <div className="flex flex-wrap gap-2 pb-3">
                    <StatusBadge
                        status={product.state}
                        variant="editorial"
                        className="text-[10px]"
                    />
                    {product.auction && (
                        <AuctionWindowBadge
                            auction={product.auction}
                            className="text-xs rounded-none border border-outline-variant/20"
                        />
                    )}
                    <ProductQualityBadges product={product} />
                </div>

                <div className="mt-5 flex flex-1 flex-col justify-end gap-3">
                    <PriceText className="min-w-0 truncate text-[1.4rem] leading-none">
                        {product.price ?? t("product.unknownPrice")}
                    </PriceText>

                    <div className="grid w-full grid-cols-1 gap-2">
                        <Button
                            variant={"default"}
                            className="w-full rounded-none px-3 py-2 text-[10px] uppercase tracking-[0.12em]"
                            asChild
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

                        <Button
                            variant={"outline"}
                            className="w-full rounded-none border-outline-variant/20 bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-primary hover:bg-primary/8"
                            asChild
                        >
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
        </article>
    );
}

export const ProductCard = memo(ProductCardComponent);
