import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

type ShopHeaderProps = {
    readonly shop: PublicListingSource;
};

export function ShopHeader({ shop }: ShopHeaderProps) {
    const { t } = useTranslation();

    return (
        <header className="flex flex-col">
            <div className="relative isolate overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-linear-to-t from-primary/85 via-primary/45 to-primary/15" />
                <div className="relative mx-auto flex min-h-85 max-w-7xl items-end px-4 pb-10 pt-24 md:min-h-130 md:px-10 md:pb-16">
                    <div className="max-w-3xl space-y-3">
                        <H1 className="text-5xl font-normal italic leading-tight text-primary-foreground md:text-7xl">
                            {shop.name}
                        </H1>
                    </div>
                </div>
            </div>
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-[minmax(220px,320px)_1fr] md:items-stretch md:gap-12 md:px-10 md:py-14">
                <div className="overflow-hidden bg-surface-container-lowest p-2 shadow-[0_12px_40px_rgba(28,28,22,0.06)]">
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
                <div className="flex max-w-3xl flex-col gap-6">
                    <div className="space-y-3">
                        <H2 className="text-3xl font-normal italic leading-tight md:text-4xl">
                            {t("shop.header.overviewTitle")}
                        </H2>
                        <div className="flex flex-wrap items-center gap-2">
                            {t("shop.header.operator", { operator: shop.operatorName })}
                        </div>
                    </div>
                    {shop.url && (
                        <div className="mt-auto">
                            <Button
                                variant="default"
                                className="h-14 rounded-none text-xs tracking-[0.12em] uppercase"
                                asChild
                            >
                                <a
                                    href={shop.url}
                                    target="_blank"
                                    rel="nofollow noopener noreferrer"
                                >
                                    <ArrowUpRight />
                                    <span>{t("shop.header.visitWebsite")}</span>
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
