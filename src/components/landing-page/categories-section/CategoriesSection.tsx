import { useTranslation } from "react-i18next";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel.tsx";
import Autoplay from "embla-carousel-autoplay";
import { getCategoryIcon } from "@/components/landing-page/categories-section/CategoriesSection.data.ts";
import type { CategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { Link } from "@tanstack/react-router";
import { CAROUSEL_AUTOPLAY_DELAY_MS } from "@/components/landing-page/common/landingPageConstants.ts";

type CategoriesSectionProps = {
    readonly categories: CategoryOverview[];
};

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
    const { t } = useTranslation();

    return (
        <section className="py-10 bg-muted/30" aria-label={t("landingPage.categories.title")}>
            <div className="w-full max-w-6xl mx-auto px-4 py-2">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                        dragFree: true,
                    }}
                    plugins={[
                        Autoplay({
                            delay: CAROUSEL_AUTOPLAY_DELAY_MS,
                            stopOnInteraction: false,
                            stopOnMouseEnter: true,
                        }),
                    ]}
                    className="w-full overflow-visible"
                >
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-2xl font-bold hyphens-auto">
                            {t("landingPage.categories.title")}
                        </p>
                        <div className="flex gap-2">
                            <CarouselPrevious className="static translate-y-0 bg-card border border-primary/20 text-primary hover:bg-card/80 hover:border-primary/40" />
                            <CarouselNext className="static translate-y-0 bg-card border border-primary/20 text-primary hover:bg-card/80 hover:border-primary/40" />
                        </div>
                    </div>
                    <CarouselContent className="-ml-3 py-2 overflow-visible [&>div]:overflow-visible">
                        {categories.map((category) => {
                            const Icon = getCategoryIcon(category.categoryKey);
                            return (
                                <CarouselItem
                                    key={category.categoryId}
                                    className="pl-3 basis-1/2 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                                >
                                    <Link
                                        to="/categories/$categoryId"
                                        params={{ categoryId: category.categoryId }}
                                        className="grow flex flex-col mx-1 group relative rounded-xl border border-primary/10 bg-card p-4 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-md"
                                    >
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <p className="text-sm font-medium leading-tight hyphens-auto">
                                            {category.name}
                                        </p>
                                    </Link>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
}
