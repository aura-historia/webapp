import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { ShopTypeBadge } from "@/components/product/badges/ShopTypeBadge.tsx";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { useTranslation } from "react-i18next";
import { ImageOff } from "lucide-react";

type ShopHeaderProps = {
    readonly shop: ShopDetail;
    readonly productCount: number | undefined;
};

export function ShopHeader({ shop, productCount }: ShopHeaderProps) {
    const { t, i18n } = useTranslation();

    const formattedDate = new Intl.DateTimeFormat(i18n.language, {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(shop.created);

    const formattedProductCount = new Intl.NumberFormat(i18n.language).format(productCount ?? 0);

    return (
        <header className="flex flex-col">
            <div className="relative isolate overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-linear-to-t from-primary/85 via-primary/45 to-primary/15" />
                <div className="relative mx-auto flex min-h-85 max-w-7xl items-end px-4 pb-10 pt-24 md:min-h-130 md:px-10 md:pb-16">
                    <div className="max-w-3xl space-y-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-tertiary-fixed">
                            {t("shop.header.archiveLabel")}
                        </p>
                        <H1 className="text-5xl font-normal italic leading-tight text-primary-foreground md:text-7xl">
                            {shop.name}
                        </H1>
                    </div>
                </div>
            </div>
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-[minmax(220px,320px)_1fr] md:items-start md:gap-12 md:px-10 md:py-14">
                <div className="overflow-hidden border border-border/20 bg-card p-2 shadow-[0_24px_48px_-24px_rgba(28,28,22,0.22)]">
                    {shop.image ? (
                        <img
                            src={shop.image}
                            alt={t("shop.header.imageAlt", { shop: shop.name })}
                            className="aspect-square w-full object-contain"
                            loading="lazy"
                        />
                    ) : (
                        <div
                            role="img"
                            className="flex aspect-square w-full items-center justify-center bg-muted"
                            aria-label={t("shop.header.noImage")}
                        >
                            <ImageOff className="size-12 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div className="max-w-3xl space-y-6">
                    <div className="space-y-3">
                        <H2 className="text-3xl font-normal italic leading-tight md:text-4xl">
                            {t("shop.header.overviewTitle")}
                        </H2>
                        <div className="flex flex-wrap items-center gap-2">
                            <ShopTypeBadge shopType={shop.shopType} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {t("shop.header.addedOn", { date: formattedDate })}
                        </p>
                    </div>
                    <div className="border-t border-border/30 pt-4">
                        <p className="font-display text-3xl italic text-primary md:text-4xl">
                            {formattedProductCount}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {t("shop.header.indexedItems")}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
