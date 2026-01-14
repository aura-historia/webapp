import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { OverviewProduct } from "@/data/internal/OverviewProduct.ts";
import { ArrowUpRight, Eye, ImageOff } from "lucide-react";
import { H3 } from "../../typography/H3.tsx";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ProductQualityBadges } from "@/components/product/badges/ProductQualityBadges.tsx";

import { NotificationButton } from "@/components/product/buttons/NotificationButton.tsx";
import { WatchlistButton } from "@/components/product/buttons/WatchlistButton.tsx";

export function ProductCard({ product }: { readonly product: OverviewProduct }) {
    const { t } = useTranslation();

    return (
        <Card className={"flex flex-col lg:flex-row p-8 gap-4 shadow-md min-w-0"}>
            <div className={"shrink-0 flex lg:justify-start justify-center"}>
                <Link
                    to="/product/$shopId/$shopsProductId"
                    params={{
                        shopId: product.shopId,
                        shopsProductId: product.shopsProductId,
                    }}
                >
                    {product.images.length > 0 ? (
                        <img
                            className={
                                "w-full aspect-video object-cover hover:opacity-90 transition-opacity lg:size-48 lg:aspect-auto rounded-lg"
                            }
                            src={product.images[0].href}
                            alt=""
                        />
                    ) : (
                        <div className="size-48 bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
                            <ImageOff
                                data-testid="placeholder-image"
                                className="w-12 h-12 text-muted-foreground"
                            />
                            <p className="text-sm text-muted-foreground">{t("product.noImage")}</p>
                        </div>
                    )}
                </Link>
            </div>
            <div className={"flex flex-col min-w-0 flex-1 justify-between"}>
                <div className={"flex flex-row justify-between w-full"}>
                    <div className={"flex flex-col gap-2 min-w-0 overflow-hidden"}>
                        <Link
                            to="/product/$shopId/$shopsProductId"
                            params={{
                                shopId: product.shopId,
                                shopsProductId: product.shopsProductId,
                            }}
                            className="min-w-0 overflow-hidden"
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
                                to="/product/$shopId/$shopsProductId"
                                params={{
                                    shopId: product.shopId,
                                    shopsProductId: product.shopsProductId,
                                }}
                            >
                                <Eye />
                                <span>{t("product.details")}</span>
                            </Link>
                        </Button>
                        <Button variant={"secondary"} className="whitespace-nowrap" asChild>
                            <a href={product.url?.href} target="_blank">
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
