import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ArrowUpRight } from "lucide-react";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { ProductImageGallery } from "@/features/product/detail/components/ProductImageGallery.tsx";
import { useTranslation } from "react-i18next";
import { ProductSharer } from "@/features/product/detail/components/ProductSharer.tsx";
import { NotificationButton } from "@/features/watchlist/components/NotificationButton.tsx";
import { WatchlistButton } from "@/features/watchlist/components/WatchlistButton.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { Link } from "@tanstack/react-router";
import { ListingStatusBadge } from "@/features/product/catalog/components/badges/ListingStatusBadge.tsx";
import { PriceValuationBadge } from "@/features/product/catalog/components/badges/PriceValuationBadge.tsx";

export function ProductInfo({ product }: { readonly product: ProductListingDetail }) {
    const { t } = useTranslation();
    const isWatching = product.userState?.watchlist.watching ?? false;
    const notificationsEnabled = product.userState?.watchlist.notifications ?? false;
    const isWithdrawn = product.lifecycle === "WITHDRAWN";
    const merchantUrl = product.viewUrl?.href ?? product.url?.href;
    const searchFilterData = product.userState?.searchFilter;
    const matchedSearchFilterId = searchFilterData?.matched
        ? searchFilterData.userSearchFilterId
        : undefined;
    const priceLabel =
        product.price?.type === "ON_REQUEST"
            ? t("product.history.values.onRequest")
            : (product.displayPrice ?? t("product.unknownPrice"));
    const title = product.title ?? t("product.untitled");
    const showSensitiveContent =
        product.userState?.contentVisibility.showUnassessedOrSensitiveContent ?? false;

    return (
        <section className="grid grid-cols-1 gap-8 pb-8 lg:grid-cols-12 lg:gap-12">
            <div className="shrink-0 lg:col-span-7">
                <ProductImageGallery
                    images={product.images}
                    productId={product.productListingId}
                    showSensitiveContent={showSensitiveContent}
                />
            </div>
            <div className="flex min-w-0 flex-col lg:col-span-5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <ListingStatusBadge
                            availability={product.availability}
                            lifecycle={product.lifecycle}
                        />
                        {product.auction?.name?.text && (
                            <span className="text-xs uppercase tracking-widest text-muted-foreground">
                                {product.auction.name.text}
                            </span>
                        )}
                        {product.lot?.lotNumber && (
                            <span className="text-xs uppercase tracking-widest text-muted-foreground">
                                {t("product.auction.lotNumber", {
                                    lotNumber: product.lot.lotNumber,
                                })}
                            </span>
                        )}
                    </div>
                    <div className="ml-auto shrink-0 self-start">
                        <div className="hidden gap-2 md:flex">
                            <ProductSharer title={title} />
                            <NotificationButton
                                variant="ghost"
                                size="icon"
                                productListingId={product.productListingId}
                                isNotificationEnabled={notificationsEnabled}
                                isVisible={isWatching}
                            />
                        </div>
                        <div className="flex gap-2 md:hidden">
                            <ProductSharer title={title} variant="outline" />
                            <NotificationButton
                                variant="outline"
                                size="icon"
                                productListingId={product.productListingId}
                                isNotificationEnabled={notificationsEnabled}
                                isVisible={isWatching}
                            />
                        </div>
                    </div>
                </div>

                <H1 className="mt-8 overflow-hidden font-normal leading-[1.2] md:leading-tight">
                    {title}
                </H1>
                <p className="mt-3 text-sm uppercase tracking-[0.08em] text-muted-foreground/80">
                    <Link
                        to="/$lng/shops/$shopSlugId"
                        params={(current) => ({ ...current, shopSlugId: product.source.slugId })}
                        className="transition-colors hover:text-foreground hover:underline"
                        from="/$lng"
                    >
                        {product.source.name}
                    </Link>
                </p>

                {searchFilterData?.matched && !searchFilterData.hidden && matchedSearchFilterId && (
                    <div className="mt-6 border-l-2 border-tertiary pl-4">
                        <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                            {t("product.searchFilter.matchedBy")}:{" "}
                            <Link
                                to="/$lng/me/search-filter/$filterId"
                                params={(current) => ({
                                    ...current,
                                    filterId: matchedSearchFilterId,
                                })}
                                className="font-semibold normal-case tracking-normal text-tertiary transition-colors hover:underline"
                                from="/$lng"
                            >
                                {searchFilterData.userSearchFilterName}
                            </Link>
                        </p>
                        {searchFilterData.matchReason && (
                            <p className="mt-1 text-sm italic text-on-surface/80">
                                {searchFilterData.matchReason}
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-5 flex flex-wrap items-end gap-3">
                    <PriceText className="line-clamp-none overflow-visible whitespace-nowrap text-[2.25rem] font-display font-normal italic leading-none text-primary">
                        {priceLabel}
                    </PriceText>
                    <PriceValuationBadge type={product.priceValuation} />
                </div>

                <div className="mt-8 flex flex-col gap-3">
                    <Button
                        variant="default"
                        className="h-14 w-full rounded-none text-xs uppercase tracking-[0.12em]"
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

                    <WatchlistButton
                        variant={isWatching ? "default" : "outline"}
                        className={`h-14 w-full justify-center rounded-none text-xs uppercase tracking-[0.12em] ${
                            isWatching
                                ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                : "text-primary"
                        }`}
                        productListingId={product.productListingId}
                        isWatching={isWatching}
                        label={`${isWatching ? "−" : "+"} ${t(
                            isWatching ? "product.watchlist.remove" : "product.watchlist.add",
                        )}`}
                        showIcon={false}
                    />
                </div>
            </div>
        </section>
    );
}
