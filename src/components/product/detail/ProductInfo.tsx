import type { ProductDetail } from "@/data/internal/product/ProductDetails.ts";
import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { ShopTypeBadge } from "@/components/product/badges/ShopTypeBadge.tsx";
import { AuctionWindowBadge } from "@/components/product/badges/AuctionWindowBadge.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ArrowUpRight } from "lucide-react";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { ProductImageGallery } from "@/components/product/detail/ProductImageGallery.tsx";
import { useTranslation } from "react-i18next";
import { ProductSharer } from "@/components/product/detail/ProductSharer.tsx";
import { NotificationButton } from "@/components/product/buttons/NotificationButton.tsx";
import { WatchlistButton } from "@/components/product/buttons/WatchlistButton.tsx";
import { ProductPriceEstimate } from "@/components/product/detail/ProductPriceEstimate.tsx";
import { ProductQualityIndicators } from "@/components/product/detail/quality-indicator/ProductQualityIndicators.tsx";
import { CONDITION_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Condition.ts";
import { H1 } from "@/components/typography/H1.tsx";

export function ProductInfo({ product }: { readonly product: ProductDetail }) {
    const { t } = useTranslation();
    const descriptionText = product.description ?? t("product.noDescription");
    const descriptionHeading = t("product.descriptionTitle");
    const conditionReportHeading = t("product.conditionReportTitle");
    const conditionReportText = t(CONDITION_TRANSLATION_CONFIG[product.condition].descriptionKey);
    const isWatching = product.userData?.watchlistData.isWatching ?? false;

    return (
        <>
            <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 pb-8">
                <div className="shrink-0 lg:col-span-7">
                    <ProductImageGallery
                        images={product.images}
                        productId={product.productId}
                        userData={product.userData}
                    />
                </div>
                <div className="flex min-w-0 flex-col lg:col-span-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={product.state} />
                            <ShopTypeBadge shopType={product.shopType} />
                            {product.auction && <AuctionWindowBadge auction={product.auction} />}
                        </div>
                        <div className="hidden md:flex gap-2 ml-auto shrink-0 self-start">
                            <ProductSharer title={product.title} />

                            <NotificationButton
                                variant="ghost"
                                size="icon"
                                shopId={product.shopId}
                                shopsProductId={product.shopsProductId}
                                isNotificationEnabled={
                                    product.userData?.watchlistData.isNotificationEnabled ?? false
                                }
                                isVisible={isWatching}
                            />
                        </div>
                    </div>

                    <H1 className="mt-8 overflow-hidden line-clamp-3 leading-[1.2] md:leading-[1.25] font-normal">
                        {product.title}
                    </H1>
                    <p className="mt-3 text-sm uppercase tracking-[0.08em] text-muted-foreground/80">
                        {product.shopName}
                    </p>

                    <div className="mt-5 flex flex-wrap items-end gap-3">
                        <PriceText className="line-clamp-none overflow-visible whitespace-nowrap text-[2.25rem] leading-none font-display font-normal italic text-primary">
                            {product.price ?? t("product.unknownPrice")}
                        </PriceText>
                        {product.priceEstimate && (
                            <ProductPriceEstimate
                                priceEstimate={product.priceEstimate}
                                shopType={product.shopType}
                            />
                        )}
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <Button
                            variant="default"
                            className="h-14 w-full rounded-none text-xs tracking-[0.12em] uppercase"
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

                        <WatchlistButton
                            variant={isWatching ? "default" : "outline"}
                            className={`h-14 w-full justify-center rounded-none text-xs tracking-[0.12em] uppercase ${
                                isWatching
                                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                    : "text-primary"
                            }`}
                            shopId={product.shopId}
                            shopsProductId={product.shopsProductId}
                            isWatching={isWatching}
                            label={`${isWatching ? "-" : "+"} ${t(
                                isWatching ? "product.watchlist.remove" : "product.watchlist.add",
                            )}`}
                            showIcon={false}
                        />
                    </div>

                    <div className="mt-8">
                        <ProductQualityIndicators product={product} />
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-8 border-y border-border/30 pt-8 pb-16 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-4">
                    <h2 className="font-display text-2xl uppercase tracking-[-0.02em] text-primary">
                        {descriptionHeading}
                    </h2>
                    <span className="mt-4 block h-0.5 w-12 bg-primary" />
                </div>
                <div className="lg:col-span-8">
                    <p className="text-base leading-[1.65] text-muted-foreground">
                        {descriptionText}
                    </p>
                    <div className="mt-6 border-l-4 border-primary/20 bg-surface-container-low px-6 py-5">
                        <p className="text-xs uppercase tracking-[0.12em] text-on-surface">
                            {conditionReportHeading}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {conditionReportText}
                        </p>
                    </div>
                </div>
            </section>

            <div className="fixed top-24 right-4 flex flex-col gap-2 md:hidden z-40">
                <ProductSharer
                    title={product.title}
                    variant="outline"
                    className="rounded-full bg-surface-container-lowest"
                />

                <NotificationButton
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-surface-container-lowest"
                    shopId={product.shopId}
                    shopsProductId={product.shopsProductId}
                    isNotificationEnabled={
                        product.userData?.watchlistData.isNotificationEnabled ?? false
                    }
                    isVisible={isWatching}
                />
            </div>
        </>
    );
}
