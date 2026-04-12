import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel.tsx";
import Autoplay from "embla-carousel-autoplay";
import { getCategoryAssetUrl } from "@/components/landing-page/categories-section/CategoriesSection.data.ts";
import type { CategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { Link } from "@tanstack/react-router";
import { CAROUSEL_AUTOPLAY_DELAY_MS } from "@/components/landing-page/common/landingPageConstants.ts";
import { H2 } from "@/components/typography/H2.tsx";

type CategoriesSectionProps = {
    readonly categories: CategoryOverview[];
};

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
    const { t, i18n } = useTranslation();
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!carouselApi) return;

        const updatePagination = () => {
            const snapCount =
                categories.length === 0 ? 1 : Math.max(carouselApi.scrollSnapList().length, 1);
            const selectedPage =
                snapCount === 1 ? 1 : Math.min(carouselApi.selectedScrollSnap() + 1, snapCount);

            setTotalPages(snapCount);
            setCurrentPage(selectedPage);
        };

        updatePagination();
        carouselApi.on("select", updatePagination);
        carouselApi.on("reInit", updatePagination);

        return () => {
            carouselApi.off("select", updatePagination);
            carouselApi.off("reInit", updatePagination);
        };
    }, [carouselApi, categories.length]);

    const carouselPositionLabel = `${currentPage} / ${totalPages}`;

    return (
        <section
            className="bg-background py-16 lg:py-24"
            aria-label={t("landingPage.categories.title")}
        >
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                <Carousel
                    setApi={setCarouselApi}
                    opts={{
                        align: "start",
                        loop: false,
                        slidesToScroll: "auto",
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
                        <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                                <CarouselPrevious className="static size-10 translate-y-0 rounded-xl border-border/30 bg-transparent text-primary hover:border-border hover:bg-card" />
                                <CarouselNext className="static size-10 translate-y-0 rounded-xl border-border/30 bg-transparent text-primary hover:border-border hover:bg-card" />
                            </div>
                        </div>
                    </div>
                    <CarouselContent className="-ml-6 overflow-visible py-2 [&>div]:overflow-visible">
                        {categories.map((category) => {
                            const categoryAssetUrl = getCategoryAssetUrl(category.categoryKey);
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
                                        <div className="mb-4 aspect-square overflow-hidden bg-surface-container-high transition-colors duration-300 group-hover:bg-surface-container">
                                            <img
                                                src={categoryAssetUrl}
                                                alt=""
                                                loading="eager"
                                                className="h-full w-full object-cover transition-transform duration-300"
                                            />
                                        </div>
                                        <p className="font-display text-2xl leading-8 text-primary">
                                            {category.name}
                                        </p>
                                        {!!category.productCount && (
                                            <p className="uppercase text-xs text-secondary">
                                                {t("landingPage.categories.objectCount", {
                                                    count: category.productCount,
                                                    formattedCount: new Intl.NumberFormat(
                                                        i18n.language,
                                                    ).format(category.productCount),
                                                })}
                                            </p>
                                        )}
                                    </Link>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <span
                            className="text-sm tabular-nums text-muted-foreground sm:hidden"
                            aria-live="polite"
                            data-testid="carousel-page-indicator-mobile"
                        >
                            {carouselPositionLabel}
                        </span>
                        <div className="hidden items-center justify-center gap-2 sm:flex">
                            {Array.from({ length: totalPages }, (_, index) => {
                                const isActive = currentPage === index + 1;

                                return (
                                    <span
                                        key={`carousel-page-indicator-${
                                            // biome-ignore lint/suspicious/noArrayIndexKey: index is fine for static list
                                            index + 1
                                        }`}
                                        className={`h-2 w-2 rounded-full transition-colors duration-200 ${isActive ? "bg-primary" : "bg-muted"}`}
                                        aria-current={isActive ? "true" : "false"}
                                        data-testid="carousel-page-indicator"
                                    />
                                );
                            })}
                        </div>
                    </div>
                </Carousel>
            </div>
        </section>
    );
}
