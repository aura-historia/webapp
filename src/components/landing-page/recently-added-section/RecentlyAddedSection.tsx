import { useTranslation } from "react-i18next";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel.tsx";
import { ReverseAutoplay } from "@/lib/carousel/reverseAutoplay.ts";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { ProductGridItem } from "@/components/product/grid/ProductGridItem.tsx";
import { CAROUSEL_AUTOPLAY_DELAY_MS } from "@/components/landing-page/common/landingPageConstants.ts";
import { H2 } from "@/components/typography/H2.tsx";

type RecentlyAddedSectionProps = {
    readonly products: OverviewProduct[];
};

export default function RecentlyAddedSection({ products }: RecentlyAddedSectionProps) {
    const { t } = useTranslation();

    return (
        <section className="py-10 bg-muted/30" aria-label={t("landingPage.recentlyAdded.title")}>
            <div className="w-full max-w-6xl mx-auto px-4 py-2">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                        dragFree: true,
                    }}
                    plugins={[
                        ReverseAutoplay({
                            delay: CAROUSEL_AUTOPLAY_DELAY_MS,
                            stopOnInteraction: false,
                            stopOnMouseEnter: true,
                        }),
                    ]}
                    className="w-full overflow-visible"
                >
                    <div className="flex items-center justify-center mb-4">
                        <H2>{t("landingPage.recentlyAdded.title")}</H2>
                    </div>
                    <div className="relative">
                        <CarouselPrevious className="left-2 top-1/2 z-20 -translate-y-1/2 bg-card border border-primary/20 text-primary hover:bg-card/80 hover:border-primary/40 xl:-left-12" />
                        <CarouselNext className="right-2 top-1/2 z-20 -translate-y-1/2 bg-card border border-primary/20 text-primary hover:bg-card/80 hover:border-primary/40 xl:-right-12" />
                        <CarouselContent className="-ml-3 py-2 overflow-visible items-stretch [&>div]:overflow-visible cursor-grab active:cursor-grabbing">
                            {products.map((product) => (
                                <CarouselItem
                                    key={product.productId}
                                    className="pl-3 h-auto self-stretch basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                                >
                                    <div className="p-1 flex h-full w-full *:h-full *:w-full">
                                        <ProductGridItem product={product} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </div>
                </Carousel>
            </div>
        </section>
    );
}
