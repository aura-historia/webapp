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
        <section className="py-16 bg-muted/30" aria-label={t("landingPage.recentlyAdded.title")}>
            <div className="w-full max-w-7xl mx-auto px-4 py-2">
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
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] uppercase tracking-[2px] text-primary">
                                {t("landingPage.recentlyAdded.eyebrow")}
                            </span>
                            <H2 className="text-4xl font-normal sm:text-5xl">
                                {t("landingPage.recentlyAdded.title")}
                            </H2>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <CarouselPrevious className="static top-auto left-auto translate-y-0 size-12 rounded-xl border border-primary/20 bg-card p-px text-primary hover:border-primary/40 hover:bg-card/80" />
                            <CarouselNext className="static top-auto right-auto translate-y-0 size-12 rounded-xl border border-primary/20 bg-card p-px text-primary hover:border-primary/40 hover:bg-card/80" />
                        </div>
                    </div>
                    <div className="relative">
                        <CarouselContent className="-ml-3 py-2 overflow-visible items-stretch [&>div]:overflow-visible cursor-grab active:cursor-grabbing">
                            {products.map((product) => (
                                <CarouselItem
                                    key={product.productId}
                                    className="pl-3 h-auto self-stretch basis-full sm:basis-1/2 lg:basis-1/3"
                                >
                                    <div className="p-1 flex h-full w-full *:h-full *:w-full">
                                        <ProductGridItem
                                            product={product}
                                            variant="recentlyAdded"
                                        />
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
