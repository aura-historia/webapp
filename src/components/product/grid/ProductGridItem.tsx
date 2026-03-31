import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { UnseenNotificationBadge } from "@/components/product/badges/UnseenNotificationBadge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { Eye, ImageOff } from "lucide-react";
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

function ProductGridItemComponent({ product }: { readonly product: OverviewProduct }) {
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

    return (
        <div className="relative pt-2 h-full">
            {hasUnseenNotification && (
                <div className="absolute left-4 top-2 z-10 -translate-y-1/2">
                    <UnseenNotificationBadge />
                </div>
            )}

            <Card
                className={cn(
                    "flex flex-col w-full h-full p-0 shadow-md overflow-hidden min-w-0",
                    hasUnseenNotification && "border-2 border-primary",
                )}
            >
                <div className="shrink-0">
                    <Link
                        to="/shops/$shopSlugId/products/$productSlugId"
                        params={{
                            shopSlugId: product.shopSlugId,
                            productSlugId: product.productSlugId,
                        }}
                        className="block w-full"
                        onClick={handleProductClick}
                    >
                        {product.images.length > 0 ? (
                            isRestrictedImage(product.images[0], isRestrictedConsentGiven) ? (
                                <ProhibitedImagePlaceholder className="w-full aspect-4/3" />
                            ) : (
                                <ImageWithFallback
                                    className="w-full aspect-4/3 object-cover hover:opacity-90 transition-opacity"
                                    src={product.images[0].url?.href}
                                    alt={product.title}
                                    fallbackClassName="w-full aspect-[4/3]"
                                />
                            )
                        ) : (
                            <div className="w-full aspect-4/3 bg-muted flex flex-col items-center justify-center gap-2">
                                <ImageOff
                                    data-testid="placeholder-image"
                                    className="w-12 h-12 text-muted-foreground"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t("product.noImage")}
                                </p>
                            </div>
                        )}
                    </Link>
                </div>

                <div className="flex flex-col min-w-0 flex-1 justify-between p-4 gap-3">
                    <div className="flex flex-col gap-1.5 min-w-0 overflow-hidden">
                        <Link
                            to="/shops/$shopSlugId/products/$productSlugId"
                            params={{
                                shopSlugId: product.shopSlugId,
                                productSlugId: product.productSlugId,
                            }}
                            className="min-w-0 overflow-hidden"
                            onClick={handleProductClick}
                        >
                            <H3 className="overflow-ellipsis line-clamp-2 hover:underline text-base! font-semibold!">
                                {product.title}
                            </H3>
                        </Link>
                        <span className="text-sm text-muted-foreground line-clamp-1 overflow-ellipsis">
                            {product.shopName}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <StatusBadge status={product.state} />
                        <PriceText className="text-lg! font-bold!">
                            {product.price ?? t("product.unknownPrice")}
                        </PriceText>
                    </div>

                    <Button variant="secondary" size="sm" asChild className="w-full">
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
            </Card>
        </div>
    );
}

export const ProductGridItem = memo(ProductGridItemComponent);
