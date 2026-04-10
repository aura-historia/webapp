import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import {
    getCategoryAssetUrl,
    getCategoryHeaderAssetUrl,
} from "@/components/landing-page/categories-section/CategoriesSection.data.ts";
import type { CategoryDetail } from "@/data/internal/category/CategoryDetail.ts";
import { useTranslation } from "react-i18next";

type CategoryHeaderProps = {
    readonly category: CategoryDetail;
};

export function CategoryHeader({ category }: CategoryHeaderProps) {
    const { t, i18n } = useTranslation();
    const categoryAssetUrl = getCategoryAssetUrl(category.categoryKey);
    const categoryHeaderAssetUrl = getCategoryHeaderAssetUrl(category.categoryKey);
    const description = t(`category.descriptions.${category.categoryKey}`, {
        defaultValue: t("category.descriptions.default"),
    });
    const formattedProductCount = new Intl.NumberFormat(i18n.language).format(
        category.productCount,
    );

    return (
        <header className="flex flex-col">
            <div className="relative isolate overflow-hidden bg-primary">
                <img
                    src={categoryHeaderAssetUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary/85 via-primary/45 to-primary/15" />
                <div className="relative mx-auto flex min-h-85 max-w-7xl items-end px-4 pb-10 pt-24 md:min-h-130 md:px-10 md:pb-16">
                    <div className="max-w-3xl space-y-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-tertiary-fixed">
                            {t("category.header.archiveLabel")}
                        </p>
                        <H1 className="text-5xl font-normal italic leading-tight text-primary-foreground md:text-7xl">
                            {category.name}
                        </H1>
                    </div>
                </div>
            </div>
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-[minmax(220px,320px)_1fr] md:items-start md:gap-12 md:px-10 md:py-14">
                <div className="overflow-hidden border border-border/20 bg-card p-2 shadow-[0_24px_48px_-24px_rgba(28,28,22,0.22)]">
                    <img
                        src={categoryAssetUrl}
                        alt={t("category.header.imageAlt", { category: category.name })}
                        className="aspect-square w-full object-cover"
                        loading="lazy"
                    />
                </div>
                <div className="max-w-3xl space-y-6">
                    <div className="space-y-3">
                        <H2 className="text-3xl font-normal italic leading-tight md:text-4xl">
                            {t("category.header.overviewTitle")}
                        </H2>
                        <p className="text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
                            {description}
                        </p>
                    </div>
                    <div className="border-t border-border/30 pt-4">
                        <p className="font-display text-3xl italic text-primary md:text-4xl">
                            {formattedProductCount}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {t("category.header.indexedItems")}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
