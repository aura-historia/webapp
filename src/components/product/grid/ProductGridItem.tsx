import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { UnseenNotificationBadge } from "@/components/product/badges/UnseenNotificationBadge.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { ImageOff } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { H3 } from "@/components/typography/H3.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";
import { memo, useCallback } from "react";
import { useMarkNotificationSeen } from "@/hooks/notification/useMarkNotificationSeen.ts";
import { cn } from "@/lib/utils.ts";
import { isRestrictedImage } from "@/data/internal/product/ProductImageData.ts";
import { ProhibitedImagePlaceholder } from "@/components/common/ProhibitedImagePlaceholder.tsx";
import { SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";

type ProductGridItemVariant = "default" | "recentlyAdded";

type ProductGridItemProps = {
    readonly product: OverviewProduct;
    readonly variant?: ProductGridItemVariant;
};

function getRecentlyAddedMetaText(
    t: (key: string, options?: Record<string, unknown>) => string,
    product: OverviewProduct,
) {
    const circaYear = product.originYear ?? product.originYearMin ?? product.originYearMax;

    if (circaYear != null) {
        return t("landingPage.recentlyAdded.foundAtWithYear", {
            shopName: product.shopName,
            year: circaYear,
        });
    }

    return t("landingPage.recentlyAdded.foundAt", {
        shopName: product.shopName,
    });
}

function ProductGridItemComponent({ product, variant = "default" }: ProductGridItemProps) {
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

    const isRestrictedConsentGiven = product.userData?.restrictedContentData.consentGiven ?? false;
    const shopTypeLabel = t(SHOP_TYPE_TRANSLATION_CONFIG[product.shopType].translationKey);
    const productLinkParams = {
        shopSlugId: product.shopSlugId,
        productSlugId: product.productSlugId,
    };

    if (variant === "recentlyAdded") {
        const recentlyAddedMeta = getRecentlyAddedMetaText(t, product);
        const recentlyAddedImage = (() => {
            if (product.images.length === 0) {
                return (
                    <div className="w-full aspect-4/5 bg-muted flex flex-col items-center justify-center gap-2">
                        <ImageOff
                            data-testid="placeholder-image"
                            className="w-12 h-12 text-muted-foreground"
                        />
                        <p className="text-xs text-muted-foreground">{t("product.noImage")}</p>
                    </div>
                );
            }

            if (isRestrictedImage(product.images[0], isRestrictedConsentGiven)) {
                return <ProhibitedImagePlaceholder className="w-full aspect-4/5" />;
            }

            return (
                <ImageWithFallback
                    className="aspect-4/5 w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                    src={product.images[0].url?.href}
                    alt={product.title}
                    fallbackClassName="w-full aspect-4/5"
                />
            );
        })();

        return (
            <div className="relative h-full pt-2">
                {hasUnseenNotification && (
                    <div className="absolute left-4 top-2 z-10 -translate-y-1/2">
                        <UnseenNotificationBadge />
                    </div>
                )}

                <Card
                    className={cn(
                        "group flex h-full w-full flex-col overflow-hidden border-0 bg-card shadow-none transition-all duration-300 ease-out hover:-translate-y-0.5 rounded-none",
                        hasUnseenNotification && "ring-1 ring-primary",
                    )}
                >
                    <Link
                        to="/shops/$shopSlugId/products/$productSlugId"
                        params={productLinkParams}
                        className="block w-full overflow-hidden bg-muted"
                        onClick={handleProductClick}
                    >
                        {recentlyAddedImage}
                    </Link>

                    <div className="flex flex-1 flex-col gap-3 px-1 pt-4">
                        <span className="w-fit bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-[1.2px] text-accent-foreground">
                            {shopTypeLabel}
                        </span>

                        <Link
                            to="/shops/$shopSlugId/products/$productSlugId"
                            params={productLinkParams}
                            className="min-w-0 overflow-hidden"
                            onClick={handleProductClick}
                        >
                            <H3 className="line-clamp-2 overflow-ellipsis text-2xl leading-8 font-normal transition-colors duration-300 group-hover:text-primary">
                                {product.title}
                            </H3>
                        </Link>

                        <span className="line-clamp-2 overflow-ellipsis text-sm text-muted-foreground">
                            {recentlyAddedMeta}
                        </span>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="relative h-full">
            {hasUnseenNotification && (
                <div className="absolute right-3 top-3 z-20">
                    <UnseenNotificationBadge />
                </div>
            )}

            <Card
                className={cn(
                    "group flex h-full w-full min-w-0 flex-col gap-3 border-0 bg-transparent p-0 shadow-none",
                    hasUnseenNotification && "ring-1 ring-primary",
                )}
            >
                <Link
                    to="/shops/$shopSlugId/products/$productSlugId"
                    params={productLinkParams}
                    className="relative block w-full overflow-hidden bg-surface-container-low"
                    onClick={handleProductClick}
                >
                    <StatusBadge
                        status={product.state}
                        variant="editorial"
                        showIcon={false}
                        className="absolute left-3 top-3 z-10"
                    />

                    {product.images.length > 0 ? (
                        isRestrictedImage(product.images[0], isRestrictedConsentGiven) ? (
                            <ProhibitedImagePlaceholder className="w-full aspect-4/5" />
                        ) : (
                            <ImageWithFallback
                                className="aspect-4/5 w-full object-cover transition-opacity duration-300 ease-out group-hover:opacity-90"
                                src={product.images[0].url?.href}
                                alt={product.title}
                                fallbackClassName="w-full aspect-4/5"
                            />
                        )
                    ) : (
                        <div className="flex aspect-4/5 w-full flex-col items-center justify-center gap-2 bg-surface-container-low">
                            <ImageOff
                                data-testid="placeholder-image"
                                className="h-12 w-12 text-muted-foreground"
                            />
                            <p className="text-xs text-muted-foreground">{t("product.noImage")}</p>
                        </div>
                    )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                        <span className="min-w-0 flex-1 truncate text-xs uppercase tracking-widest text-muted-foreground/80">
                            {product.shopName}
                        </span>

                        <PriceText className="ml-auto shrink-0 text-xl leading-7 font-normal italic whitespace-nowrap font-display text-primary">
                            {product.price ?? t("product.unknownPrice")}
                        </PriceText>
                    </div>

                    <Link
                        to="/shops/$shopSlugId/products/$productSlugId"
                        params={productLinkParams}
                        className="min-w-0"
                        onClick={handleProductClick}
                    >
                        <H3 className="line-clamp-2 text-xl leading-tight font-normal transition-colors duration-300 ease-out group-hover:text-primary">
                            {product.title}
                        </H3>
                    </Link>
                </div>
            </Card>
        </div>
    );
}

export const ProductGridItem = memo(ProductGridItemComponent);
