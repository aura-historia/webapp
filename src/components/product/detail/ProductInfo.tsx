import type { ProductDetail } from "@/data/internal/ProductDetails.ts";
import { StatusBadge } from "@/components/product/StatusBadge.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { ArrowUpRight, HeartIcon } from "lucide-react";
import { H3 } from "../../typography/H3.tsx";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { ProductImageGallery } from "@/components/product/detail/ProductImageGallery.tsx";
import { useTranslation } from "react-i18next";
import { useWatchlistMutation, type WatchlistMutationType } from "@/hooks/useWatchlistMutation.ts";
import { ProductSharer } from "@/components/product/detail/ProductSharer.tsx";

export function ProductInfo({ product }: { readonly product: ProductDetail }) {
    const { t } = useTranslation();
    const watchlistMutation = useWatchlistMutation(product.shopId, product.shopsProductId);
    const mutationType: WatchlistMutationType = product.userData?.watchlistData.isWatching
        ? "deleteFromWatchlist"
        : "addToWatchlist";

    return (
        <>
            <Card className="flex flex-col md:flex-row p-8 gap-4 shadow-md min-w-0">
                <div className="shrink-0 flex sm:justify-start justify-center">
                    <ProductImageGallery
                        images={product.images}
                        title={product.title}
                        productId={product.productId}
                    />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex flex-row justify-between w-full">
                        <div className="flex flex-col gap-2 min-w-0 overflow-hidden">
                            <H2 className="overflow-hidden line-clamp-3 md:line-clamp-2 lg:line-clamp-2 text-[26px]">
                                {product.title}
                            </H2>
                            <H3 variant="muted" className="overflow-hidden line-clamp-1 text-lg">
                                {product.shopName}
                            </H3>
                        </div>
                        <div className="hidden md:flex gap-2 ml-auto shrink-0 self-start">
                            <ProductSharer title={product.title} />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto shrink-0"
                                onClick={() => {
                                    if (watchlistMutation.isPending) return;
                                    watchlistMutation.mutate(mutationType);
                                }}
                            >
                                <HeartIcon
                                    className={`size-5 transition-all duration-300 ease-in-out ${
                                        product.userData?.watchlistData.isWatching
                                            ? "fill-heart text-heart"
                                            : "fill-transparent"
                                    } ${watchlistMutation.isPending ? "animate-heart-bounce" : ""}`}
                                />
                            </Button>
                        </div>
                    </div>
                    <p className="mask-linear-[to_bottom,transparent_0%,black_10%,black_90%,transparent_100%] py-2 text-base text-muted-foreground overflow-y-auto max-h-[250px] md:max-h-[130px] lg:max-h-[200px] w-full pr-3">
                        {product.description ?? t("product.noDescription")}
                    </p>

                    <div className="hidden sm:block flex-1"></div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-end w-full pt-4">
                        <div className="flex flex-col gap-2 shrink-0">
                            <StatusBadge status={product.state} />
                            <PriceText>{product.price ?? t("product.unknownPrice")}</PriceText>
                        </div>

                        <div className="flex flex-col gap-2 sm:items-end shrink-0 sm:ml-2">
                            <Button variant="secondary" className="whitespace-nowrap" asChild>
                                <a
                                    href={product.url?.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ArrowUpRight />
                                    <span>{t("product.toMerchant")}</span>
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="fixed top-24 right-4 flex flex-col gap-2 md:hidden z-40">
                <ProductSharer
                    title={product.title}
                    variant="outline"
                    className="shadow-lg rounded-full bg-card"
                />

                <Button
                    size="icon"
                    variant="outline"
                    className="shadow-lg rounded-full bg-card"
                    onClick={() => {
                        if (watchlistMutation.isPending) return;
                        watchlistMutation.mutate(mutationType);
                    }}
                >
                    <HeartIcon
                        className={`size-4 transition-all duration-300 ease-in-out ${
                            product.userData?.watchlistData.isWatching
                                ? "fill-heart text-heart"
                                : "fill-transparent"
                        } ${watchlistMutation.isPending ? "animate-heart-bounce" : ""}`}
                    />
                </Button>
            </div>
        </>
    );
}
