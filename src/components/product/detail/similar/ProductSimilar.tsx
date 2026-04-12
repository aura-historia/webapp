import { useSimilarProducts } from "@/hooks/useSimilarProducts.ts";
import { ProductSimilarCard } from "@/components/product/detail/similar/ProductSimilarCard.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel.tsx";
import { useTranslation } from "react-i18next";
import { AlertCircle, SearchX, RefreshCw } from "lucide-react";
import { ProductSimilarCardSkeleton } from "@/components/product/detail/similar/ProductSimilarCardSkeleton.tsx";

interface ProductSimilarProps {
    readonly shopId: string;
    readonly shopsProductId: string;
}

export function ProductSimilar({ shopId, shopsProductId }: ProductSimilarProps) {
    const { t } = useTranslation();
    const { data, isLoading, isError, error } = useSimilarProducts(shopId, shopsProductId);
    const sectionHeadingClass =
        "font-display text-2xl font-normal uppercase tracking-[-0.02em] text-primary";
    const headingUnderlineClass = "mt-4 block h-0.5 w-12 bg-primary";

    if (isLoading) {
        return (
            <section className="flex min-w-0 flex-col gap-6">
                <div>
                    <H2 className={sectionHeadingClass}>{t("product.similar.title")}</H2>
                    <span className={headingUnderlineClass} />
                </div>
                <div className="relative">
                    <Carousel
                        opts={{
                            align: "center",
                            containScroll: "trimSnaps",
                        }}
                        className="w-full"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex gap-2 md:hidden">
                                <CarouselPrevious className="static translate-y-0" disabled />
                                <CarouselNext className="static translate-y-0" disabled />
                            </div>
                        </div>

                        <CarouselContent className="pb-4">
                            {["skeleton-1", "skeleton-2", "skeleton-3"].map((skeletonId) => (
                                <CarouselItem
                                    key={skeletonId}
                                    className="pl-4 basis-[calc(100vw-80px)] md:basis-1/2 xl:basis-1/3"
                                >
                                    <ProductSimilarCardSkeleton />
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        <CarouselPrevious className="hidden md:flex" disabled />
                        <CarouselNext className="hidden md:flex" disabled />
                    </Carousel>
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="flex min-w-0 flex-col gap-4">
                <div>
                    <H2 className={sectionHeadingClass}>{t("product.similar.title")}</H2>
                    <span className={headingUnderlineClass} />
                </div>
                <div className="flex flex-col items-center gap-4 py-16">
                    <AlertCircle className="h-16 w-16 text-muted-foreground" />
                    <div className="text-center space-y-2">
                        <H3>{t("product.similar.error.title")}</H3>
                        <p className="text-base text-muted-foreground">
                            {error?.message ?? t("product.similar.error.description")}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (data?.isEmbeddingsPending) {
        return (
            <section className="flex min-w-0 flex-col gap-4">
                <div>
                    <H2 className={sectionHeadingClass}>{t("product.similar.title")}</H2>
                    <span className={headingUnderlineClass} />
                </div>
                <div className="flex flex-col items-center gap-4 py-16">
                    <RefreshCw className="h-16 w-16 text-muted-foreground animate-[spin_2s_linear_infinite]" />
                    <div className="text-center space-y-2">
                        <H3>{t("product.similar.embeddingsPending.title")}</H3>
                        <p className="text-base text-muted-foreground">
                            {t("product.similar.embeddingsPending.description")}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (!data?.products || data.products.length === 0) {
        return (
            <section className="flex min-w-0 flex-col gap-4">
                <div>
                    <H2 className={sectionHeadingClass}>{t("product.similar.title")}</H2>
                    <span className={headingUnderlineClass} />
                </div>
                <div className="flex flex-col items-center gap-4 py-16">
                    <SearchX className="h-16 w-16 text-muted-foreground" />
                    <div className="text-center space-y-2">
                        <H3>{t("product.similar.noData.title")}</H3>
                        <p className="text-base text-muted-foreground">
                            {t("product.similar.noData.description")}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-w-0 flex-col gap-6">
            <div>
                <H2 className={sectionHeadingClass}>{t("product.similar.title")}</H2>
                <span className={headingUnderlineClass} />
            </div>
            <div className="relative">
                <Carousel
                    opts={{
                        align: "center",
                        containScroll: "trimSnaps",
                    }}
                    className="w-full"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex gap-2 md:hidden">
                            <CarouselPrevious className="static translate-y-0" />
                            <CarouselNext className="static translate-y-0" />
                        </div>
                    </div>

                    <CarouselContent className="pb-4">
                        {data.products.map((product) => (
                            <CarouselItem
                                key={product.productId}
                                className="pl-4 basis-[calc(100vw-80px)] md:basis-1/2 xl:basis-1/3"
                            >
                                <ProductSimilarCard product={product} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            </div>
        </section>
    );
}
