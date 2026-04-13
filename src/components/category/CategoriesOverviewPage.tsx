import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesOptions } from "@/client/@tanstack/react-query.gen.ts";
import { mapToCategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { getCategoryAssetUrl } from "@/components/landing-page/categories-section/CategoriesSection.data.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { H1 } from "@/components/typography/H1.tsx";

export function CategoriesOverviewPage() {
    const { t, i18n } = useTranslation();

    const { data: categoriesData } = useQuery(
        getCategoriesOptions({
            query: { language: parseLanguage(i18n.language) },
        }),
    );

    const categories = (categoriesData ?? []).map(mapToCategoryOverview);

    return (
        <div className="bg-background">
            <header className="relative isolate overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-linear-to-b from-primary/90 to-primary/70" />
                <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-24 md:px-10 md:pb-16 md:pt-32">
                    <p className="text-xs uppercase tracking-[0.2em] text-tertiary-fixed">
                        {t("categoriesOverview.subtitle")}
                    </p>
                    <H1 className="mt-3 text-5xl font-normal italic leading-tight text-primary-foreground md:text-7xl">
                        {t("categoriesOverview.title")}
                    </H1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-primary-foreground/80 md:text-lg">
                        {t("categoriesOverview.description")}
                    </p>
                </div>
            </header>

            <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-10 md:py-16">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categories.map((category) => {
                        const categoryAssetUrl = getCategoryAssetUrl(category.categoryKey);
                        const description = t(`category.descriptions.${category.categoryKey}`, {
                            defaultValue: "",
                        });
                        const formattedCount = new Intl.NumberFormat(i18n.language).format(
                            category.productCount,
                        );

                        return (
                            <Link
                                key={category.categoryId}
                                to="/categories/$categoryId"
                                params={{ categoryId: category.categoryId }}
                                className="group block"
                                data-testid="category-overview-card"
                            >
                                <article className="h-full overflow-hidden border border-border/20 bg-card transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(28,28,22,0.18)]">
                                    <div className="aspect-square overflow-hidden bg-surface-container-high">
                                        <img
                                            src={categoryAssetUrl}
                                            alt={t("category.header.imageAlt", {
                                                category: category.name,
                                            })}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-5">
                                        <h2 className="font-display text-xl leading-7 text-primary">
                                            {category.name}
                                        </h2>
                                        {description && (
                                            <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                                                {description}
                                            </p>
                                        )}
                                        <p className="mt-3 text-xs uppercase tracking-[0.15em] text-secondary">
                                            {t("categoriesOverview.itemCount", {
                                                count: category.productCount,
                                                formattedCount,
                                            })}
                                        </p>
                                    </div>
                                </article>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
