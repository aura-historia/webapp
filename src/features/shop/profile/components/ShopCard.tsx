import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ImageOff } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

function ShopCardComponent({ shop }: { readonly shop: PublicListingSource }) {
    const { t } = useTranslation();

    return (
        <article
            data-testid="shop-card"
            className={
                "relative flex h-full min-w-0 flex-col overflow-hidden border border-outline-variant/20 bg-surface-container-lowest shadow-[0_12px_40px_rgba(28,28,22,0.06)] transition-all duration-300 ease-out"
            }
        >
            <Link
                to="/$lng/shops/$shopSlugId"
                params={(current) => ({ ...current, shopSlugId: shop.slugId })}
                className="block"
                from="/$lng"
            >
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-muted">
                    {shop.image ? (
                        <img
                            src={shop.image}
                            alt={t("shop.header.imageAlt", { shop: shop.name })}
                            className="h-full w-full object-contain"
                            loading="lazy"
                        />
                    ) : (
                        <div
                            role="img"
                            aria-label={t("shop.header.noImage")}
                            className="flex h-full w-full items-center justify-center"
                        >
                            <ImageOff className="size-12 text-muted-foreground" />
                        </div>
                    )}
                </div>
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
                <div className="min-w-0 space-y-1">
                    <Link
                        to="/$lng/shops/$shopSlugId"
                        params={(current) => ({ ...current, shopSlugId: shop.slugId })}
                        className="block"
                        from="/$lng"
                    >
                        <H2 className="break-words text-2xl font-normal italic leading-tight">
                            {shop.name}
                        </H2>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        {t("shop.header.operator", { operator: shop.operatorName })}
                    </p>
                </div>
                <div className="mt-auto flex flex-col gap-2 pt-3">
                    <Button asChild variant="outline" className="h-10 rounded-none">
                        <Link
                            to="/$lng/shops/$shopSlugId"
                            params={(current) => ({ ...current, shopSlugId: shop.slugId })}
                            from="/$lng"
                        >
                            <ArrowUpRight className="size-4" />
                            <span>{t("shop.card.viewSource")}</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}

export const ShopCard = memo(ShopCardComponent);
