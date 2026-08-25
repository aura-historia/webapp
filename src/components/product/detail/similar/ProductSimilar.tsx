import { useSimilarProducts } from "@/hooks/useSimilarProducts.ts";
import { ProductGridItem } from "@/features/product/catalog/components/grid/ProductGridItem.tsx";
import { ProductGridItemSkeleton } from "@/features/product/catalog/components/grid/ProductGridItemSkeleton.tsx";
import { HiddenMatchCard } from "@/features/product/catalog/components/cards/HiddenMatchCard.tsx";
import { ProductSectionHeading } from "@/components/product/detail/ProductSectionHeading.tsx";
import { ProductCarouselNavButtons } from "@/components/product/detail/ProductCarouselNavButtons.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { useTranslation } from "react-i18next";
import { AlertCircle, SearchX, RefreshCw } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel.tsx";
import type { ReactNode } from "react";

interface ProductSimilarProps {
    readonly shopId: string;
    readonly shopsProductId: string;
}

function SimilarState({
    title,
    icon,
    description,
}: {
    readonly title: string;
    readonly icon: ReactNode;
    readonly description: string;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-4 bg-card p-6">
            <div className="flex flex-col items-center gap-4 py-8">
                {icon}
                <div className="space-y-2 text-center">
                    <H3>{title}</H3>
                    <p className="text-base text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    );
}

export function ProductSimilar({ shopId, shopsProductId }: ProductSimilarProps) {
    const { t } = useTranslation();
    const { data, isLoading, isError, error } = useSimilarProducts(shopId, shopsProductId);

    if (isLoading) {
        return (
            <section className="flex max-h-[500px] min-w-0 flex-col gap-8 overflow-hidden">
                <ProductSectionHeading title={t("product.similar.title")} />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {["skeleton-1", "skeleton-2", "skeleton-3"].map((skeletonId) => (
                        <ProductGridItemSkeleton key={skeletonId} />
                    ))}
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="flex max-h-[500px] min-w-0 flex-col gap-8 overflow-hidden">
                <ProductSectionHeading title={t("product.similar.title")} />
                <SimilarState
                    title={t("product.similar.error.title")}
                    icon={<AlertCircle className="h-16 w-16 text-muted-foreground" />}
                    description={error?.message ?? t("product.similar.error.description")}
                />
            </section>
        );
    }

    if (data?.isEmbeddingsPending) {
        return (
            <section className="flex max-h-[500px] min-w-0 flex-col gap-8 overflow-hidden">
                <ProductSectionHeading title={t("product.similar.title")} />
                <SimilarState
                    title={t("product.similar.embeddingsPending.title")}
                    icon={
                        <RefreshCw className="h-16 w-16 animate-[spin_2s_linear_infinite] text-muted-foreground" />
                    }
                    description={t("product.similar.embeddingsPending.description")}
                />
            </section>
        );
    }

    if (!data?.products || data.products.length === 0) {
        return (
            <section className="flex max-h-[500px] min-w-0 flex-col gap-8 overflow-hidden">
                <ProductSectionHeading title={t("product.similar.title")} />
                <SimilarState
                    title={t("product.similar.noData.title")}
                    icon={<SearchX className="h-16 w-16 text-muted-foreground" />}
                    description={t("product.similar.noData.description")}
                />
            </section>
        );
    }

    return (
        <section className="flex max-h-[500px] min-w-0 flex-col gap-8 overflow-hidden">
            <Carousel opts={{ align: "start" }} className="w-full min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <ProductSectionHeading title={t("product.similar.title")} />
                    <ProductCarouselNavButtons />
                </div>
                <CarouselContent className="-ml-6 mt-6">
                    {data.products.map((product) => {
                        const isHidden = product.userData?.searchFilterData?.hidden === true;
                        return (
                            <CarouselItem
                                key={product.productId}
                                className="basis-full pl-6 sm:basis-1/2 lg:basis-1/3"
                            >
                                {isHidden ? (
                                    <HiddenMatchCard />
                                ) : (
                                    <ProductGridItem product={product} />
                                )}
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
