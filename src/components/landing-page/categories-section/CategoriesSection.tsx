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
import { H2 } from "@/components/typography/H2.tsx";

type CategoriesSectionProps = {
    readonly categories: CategoryOverview[];
};

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
    const { t } = useTranslation();

    return (
        <section
            className="bg-background py-16 lg:py-24"
            aria-label={t("landingPage.categories.title")}
        >
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
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
                    <div className="mb-8 flex items-end justify-between gap-6">
                        <H2 className="text-4xl font-normal italic leading-none text-primary lg:text-5xl">
                            {t("landingPage.categories.title")}
                        </H2>
                        <div className="flex gap-2">
                            <CarouselPrevious className="static size-10 translate-y-0 rounded-xl border-border/30 bg-transparent text-primary hover:border-border hover:bg-card" />
                            <CarouselNext className="static size-10 translate-y-0 rounded-xl border-border/30 bg-transparent text-primary hover:border-border hover:bg-card" />
                        </div>
                    </div>
                    <CarouselContent className="-ml-6 overflow-visible py-2 [&>div]:overflow-visible">
                        {categories.map((category) => {
                            const Icon = getCategoryIcon(category.categoryKey);
                            return (
                                <CarouselItem
                                    key={category.categoryId}
                                    className="basis-[80%] pl-6 sm:basis-1/2 lg:basis-70"
                                >
                                    <Link
                                        to="/categories/$categoryId"
                                        params={{ categoryId: category.categoryId }}
                                        className="group block"
                                    >
                                        <div className="mb-4 flex aspect-square items-center justify-center bg-surface-container-high transition-colors duration-300 group-hover:bg-surface-container">
                                            <Icon className="h-16 w-16 text-primary/70" />
                                        </div>
                                        <p className="font-display text-2xl leading-8 text-primary">
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
