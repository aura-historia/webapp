import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { Eye, ImageOff } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";

export function ProductSimilarCard({ product }: { readonly product: OverviewProduct }) {
    const { t } = useTranslation();

    return (
        <Card className={"flex flex-col h-full p-0 shadow-md overflow-hidden min-w-0"}>
            <div className={"shrink-0 flex justify-center"}>
                <Link
                    to="/shops/$shopSlugId/products/$productSlugId"
                    params={{
                        shopSlugId: product.shopSlugId,
                        productSlugId: product.productSlugId,
                    }}
                    className={"block w-full"}
                >
                    {product.images.length > 0 ? (
                        <ImageWithFallback
                            className={
                                "w-full aspect-video object-cover hover:opacity-90 transition-opacity"
                            }
                            src={product.images[0].url.href}
                            alt=""
                            fallbackClassName="w-full aspect-video"
                        />
                    ) : (
                        <div className="w-full aspect-video bg-muted flex flex-col items-center justify-center gap-2">
                            <ImageOff
                                data-testid="placeholder-image"
                                className="w-12 h-12 text-muted-foreground"
                            />
                            <p className="text-xs text-muted-foreground">{t("product.noImage")}</p>
                        </div>
                    )}
                </Link>
            </div>
            <div className={"flex flex-col min-w-0 flex-1 justify-between p-4"}>
                <div className={"flex flex-col gap-2 min-w-0 overflow-hidden"}>
                    <Link
                        to="/shops/$shopSlugId/products/$productSlugId"
                        params={{
                            shopSlugId: product.shopSlugId,
                            productSlugId: product.productSlugId,
                        }}
                        className="min-w-0 overflow-hidden"
                    >
                        <H2
                            className={
                                "overflow-ellipsis line-clamp-2 hover:underline text-base! font-semibold!"
                            }
                        >
                            {product.title}
                        </H2>
                    </Link>
                    <H3 variant={"muted"} className={"line-clamp-1 overflow-ellipsis text-sm!"}>
                        {product.shopName}
                    </H3>
                </div>

                <div
                    className={
                        "flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-end w-full mt-4"
                    }
                >
                    <div className={"flex flex-col gap-2 shrink-0"}>
                        <StatusBadge status={product.state} />
                        <PriceText className="min-w-0 overflow-hidden text-ellipsis text-xl! sm:text-2xl! font-bold!">
                            {product.price ?? t("product.unknownPrice")}
                        </PriceText>
                    </div>

                    <Button
                        variant={"secondary"}
                        size={"sm"}
                        asChild
                        className="w-full sm:w-auto sm:shrink-0"
                    >
                        <Link
                            to="/shops/$shopSlugId/products/$productSlugId"
                            params={{
                                shopSlugId: product.shopSlugId,
                                productSlugId: product.productSlugId,
                            }}
                        >
                            <Eye />
                            <span>{t("product.details")}</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
