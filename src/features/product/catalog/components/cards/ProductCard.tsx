import { UnseenNotificationBadge } from "@/features/notification-center/components/UnseenNotificationBadge.tsx";
import { SearchFilterMatchBadge } from "@/features/saved-searches/components/SearchFilterMatchBadge.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { ArrowUpRight, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { NotificationButton } from "@/features/watchlist/components/NotificationButton.tsx";
import { WatchlistButton } from "@/features/watchlist/components/WatchlistButton.tsx";
import { ProductCardImageCarousel } from "@/features/product/catalog/components/media/ProductCardImageCarousel.tsx";
import { ProductListingLink } from "@/features/product/catalog/components/ProductListingLink.tsx";
import { ListingStatusBadge } from "@/features/product/catalog/components/badges/ListingStatusBadge.tsx";
import { PriceValuationBadge } from "@/features/product/catalog/components/badges/PriceValuationBadge.tsx";
import { memo, useCallback } from "react";
import { useMarkNotificationSeen } from "@/features/notification-center/api/useMarkNotificationSeen.ts";
import { cn } from "@/lib/utils.ts";

function ProductCardComponent({ product }: { readonly product: OverviewProduct }) {
    const { t } = useTranslation();
    const unseenNotificationIds = product.userState?.notification.unseenNotificationIds ?? [];
    const hasUnseenNotification = unseenNotificationIds.length > 0;
    const notificationId = unseenNotificationIds[0];
    const markSeen = useMarkNotificationSeen();
    const searchFilterData = product.userState?.searchFilter;
    const matchedFilterId =
        searchFilterData?.matched && !searchFilterData.hidden
            ? searchFilterData.userSearchFilterId
            : undefined;
    const isWithdrawn = product.lifecycle === "WITHDRAWN";
    const merchantUrl = product.viewUrl?.href ?? product.url?.href;
    const showSensitiveContent =
        product.userState?.contentVisibility.showUnassessedOrSensitiveContent ?? false;
    const isWatching = product.userState?.watchlist.watching ?? false;
    const isNotificationEnabled = product.userState?.watchlist.notifications ?? false;
    const priceLabel =
        product.formattedPrice ??
        (product.price?.type === "ON_REQUEST"
            ? t("product.priceChart.values.onRequest")
            : t("product.unknownPrice"));

    const handleProductClick = useCallback(() => {
        if (notificationId) markSeen.mutate(notificationId);
    }, [notificationId, markSeen.mutate]);

    return (
        <article
            className={cn(
                "relative flex h-full min-w-0 flex-col overflow-hidden border border-outline-variant/20 bg-surface-container-lowest transition-all duration-300 ease-out",
                "shadow-[0_12px_40px_rgba(28,28,22,0.06)]",
                hasUnseenNotification && "border-primary",
                !hasUnseenNotification && matchedFilterId && "border-tertiary",
            )}
        >
            <div className="relative">
                <ProductCardImageCarousel
                    images={product.images}
                    productListingTitleSlugId={product.productListingTitleSlugId}
                    showSensitiveContent={showSensitiveContent}
                    onProductClick={handleProductClick}
                />
                {hasUnseenNotification && (
                    <div className="absolute left-3 top-3 z-20">
                        <UnseenNotificationBadge />
                    </div>
                )}
                {!hasUnseenNotification && matchedFilterId && (
                    <div className="absolute left-3 top-3 z-20">
                        <SearchFilterMatchBadge
                            filterId={matchedFilterId}
                            filterName={searchFilterData?.userSearchFilterName}
                            matchReason={searchFilterData?.matchReason ?? undefined}
                        />
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col p-5">
                <div className="flex min-w-0 items-start justify-between gap-3 pb-3">
                    <div className="min-w-0">
                        <ProductListingLink
                            productListingTitleSlugId={product.productListingTitleSlugId}
                            className="min-w-0"
                            onClick={handleProductClick}
                        >
                            <H2 className="line-clamp-2 text-[1.35rem] leading-8 italic transition-colors duration-300 ease-out hover:text-primary-container">
                                {product.title ?? t("product.untitled")}
                            </H2>
                        </ProductListingLink>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        <NotificationButton
                            variant="ghost"
                            size="icon"
                            className="text-primary transition-colors duration-300 ease-out hover:bg-surface"
                            productListingId={product.productListingId}
                            isNotificationEnabled={isNotificationEnabled}
                            isVisible={isWatching}
                        />
                        <WatchlistButton
                            variant="ghost"
                            size="icon"
                            className="text-primary transition-colors duration-300 ease-out hover:bg-surface"
                            productListingId={product.productListingId}
                            isWatching={isWatching}
                        />
                    </div>
                </div>

                <div className="min-w-0 pb-3">
                    <Link
                        to="/$lng/shops/$shopSlugId"
                        params={(current) => ({ ...current, shopSlugId: product.source.slugId })}
                        className="text-sm uppercase tracking-[0.08em] text-muted-foreground/80 transition-colors hover:text-foreground hover:underline"
                        from="/$lng"
                    >
                        {product.source.name}
                    </Link>
                </div>

                <div className="flex flex-wrap gap-2 pb-3">
                    <ListingStatusBadge
                        availability={product.availability}
                        lifecycle={product.lifecycle}
                        className="text-[10px]"
                    />
                </div>

                <div className="mt-5 flex flex-1 flex-col justify-end gap-3">
                    <PriceText className="min-w-0 truncate text-[1.4rem] leading-none">
                        {priceLabel}
                    </PriceText>
                    <PriceValuationBadge type={product.priceValuation} />

                    <div className="grid w-full grid-cols-1 gap-2">
                        <Button
                            variant="default"
                            className="w-full rounded-none px-3 py-2 text-[10px] uppercase tracking-[0.12em]"
                            disabled={!product.productListingTitleSlugId}
                            asChild={Boolean(product.productListingTitleSlugId)}
                        >
                            <ProductListingLink
                                productListingTitleSlugId={product.productListingTitleSlugId}
                                className="flex items-center justify-center gap-2"
                                onClick={handleProductClick}
                            >
                                <Eye />
                                <span>{t("product.details")}</span>
                            </ProductListingLink>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full rounded-none border-outline-variant/20 bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-primary hover:bg-primary/8"
                            disabled={isWithdrawn || !merchantUrl}
                            asChild={!isWithdrawn && Boolean(merchantUrl)}
                        >
                            {!isWithdrawn && merchantUrl ? (
                                <a
                                    href={merchantUrl}
                                    target="_blank"
                                    rel="nofollow noopener noreferrer"
                                >
                                    <ArrowUpRight />
                                    <span>{t("product.toMerchant")}</span>
                                </a>
                            ) : (
                                <span>
                                    <ArrowUpRight />
                                    <span>{t("product.toMerchant")}</span>
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    );
}

export const ProductCard = memo(ProductCardComponent);
