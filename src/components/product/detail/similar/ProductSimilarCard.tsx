import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { UnseenNotificationBadge } from "@/components/product/badges/UnseenNotificationBadge.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { ImageOff } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
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
                "h-full min-w-0 overflow-hidden border-0 bg-card p-0 shadow-none",
                hasUnseenNotification && "border-2 border-primary",
            )}
        >
            <Link
                to="/shops/$shopSlugId/products/$productSlugId"
                params={{
                    shopSlugId: product.shopSlugId,
                    productSlugId: product.productSlugId,
                }}
                className="group flex h-full gap-4 bg-card p-4 transition-colors hover:bg-surface-container"
                onClick={handleProductClick}
            >
                <div className="size-24 shrink-0 overflow-hidden bg-background">
                    {product.images.length > 0 ? (
                        isRestrictedImage(
                            product.images[0],
                            product.userData?.restrictedContentData.consentGiven ?? false,
                        ) ? (
                            <ProhibitedImagePlaceholder className="size-full" />
                        ) : (
                            <ImageWithFallback
                                className="size-full object-cover transition-transform group-hover:scale-[1.03]"
                                src={product.images[0].url?.href}
                                alt=""
                                fallbackClassName="size-full"
                            />
                        )
                    ) : (
                        <div className="flex size-full flex-col items-center justify-center gap-1 bg-muted">
                            <ImageOff
                                data-testid="placeholder-image"
                                className="h-6 w-6 text-muted-foreground"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                {t("product.noImage")}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div>
                        <p className="line-clamp-2 font-display text-base leading-5 text-foreground group-hover:underline">
                            {product.title}
                        </p>
                        <p className="line-clamp-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                            {product.shopName}
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-between items-center pt-1 gap-2">
                        <div className="flex gap-2">
                            <StatusBadge status={product.state} />
                            {hasUnseenNotification && <UnseenNotificationBadge />}
                        </div>
                        <PriceText>{product.price ?? t("product.unknownPrice")}</PriceText>
                    </div>
                </div>
            </Link>
        </Card>
    );
}
