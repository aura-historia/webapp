import { useTranslation } from "react-i18next";
import { CATEGORY_CARDS } from "@/components/landing-page/categories-section/CategoriesSection.data.ts";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel.tsx";
import Autoplay from "embla-carousel-autoplay";

export default function CategoriesSection() {
    const { t } = useTranslation();

    return (
        <section className="py-10 overflow-hidden" aria-label={t("landingPage.categories.title")}>
            <div className="max-w-6xl mx-auto px-4 mb-6">
                <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {t("landingPage.categories.title")}
                </p>
            </div>
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                    dragFree: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 2000,
                        stopOnInteraction: false,
                        stopOnMouseEnter: true,
                    }),
                ]}
                className="w-full max-w-6xl mx-auto"
            >
                <CarouselContent className="-ml-3">
                    {CATEGORY_CARDS.map((category) => (
                        <CarouselItem
                            key={category.titleKey}
                            className="pl-3 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                        >
                            <div className="group relative overflow-hidden rounded-xl border border-primary/10 bg-card p-4 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-md">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                                    <category.icon className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-xs font-medium leading-tight">
                                    {t(category.titleKey)}
                                </p>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
