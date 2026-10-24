import { AlertTriangle, RefreshCw, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel.tsx";
import { useSimilarProducts } from "@/features/product/detail/api/useSimilarProducts.ts";
import { ProductCarouselNavButtons } from "@/features/product/detail/components/ProductCarouselNavButtons.tsx";
import { ProductRailState } from "@/features/product/detail/components/ProductRailState.tsx";
import { ProductSectionHeading } from "@/features/product/detail/components/ProductSectionHeading.tsx";
import { SearchResultCard } from "@/features/search/products/components/results/SearchResultCard.tsx";
import {
    SearchHiddenMatchCard,
    SearchResultCardSkeleton,
} from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";

const HEADING_ID = "product-similar-title";
const ITEM_CLASS = "basis-[72%] pl-3 sm:basis-1/2 sm:pl-6 lg:basis-1/3";

interface ProductSimilarProps {
    readonly productListingId: string;
}

function SimilarSection({ children }: { readonly children: ReactNode }) {
    return (
        <section aria-labelledby={HEADING_ID} className="flex min-w-0 flex-col">
            {children}
        </section>
    );
}

export function ProductSimilar({ productListingId }: ProductSimilarProps) {
    const { t } = useTranslation();
    const { data, isLoading, isError, error } = useSimilarProducts(productListingId);
    const heading = <ProductSectionHeading id={HEADING_ID} title={t("product.similar.title")} />;

    if (isLoading) {
        return (
            <SimilarSection>
                <div className="mb-5 sm:mb-6">{heading}</div>
                <div
                    aria-busy="true"
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {["skeleton-1", "skeleton-2", "skeleton-3"].map((skeletonId, index) => (
                        <div key={skeletonId} className={index > 0 ? "max-sm:hidden" : undefined}>
                            <SearchResultCardSkeleton />
                        </div>
                    ))}
                </div>
            </SimilarSection>
        );
    }

    const state = isError
        ? {
              icon: AlertTriangle,
              tone: "error" as const,
              title: t("product.similar.error.title"),
              description: error?.message ?? t("product.similar.error.description"),
          }
        : data?.isEmbeddingsPending
          ? {
                icon: RefreshCw,
                tone: "neutral" as const,
                spinning: true,
                title: t("product.similar.embeddingsPending.title"),
                description: t("product.similar.embeddingsPending.description"),
            }
          : !data?.products || data.products.length === 0
            ? {
                  icon: SearchX,
                  tone: "muted" as const,
                  title: t("product.similar.noData.title"),
                  description: t("product.similar.noData.description"),
              }
            : undefined;

    if (state || !data?.products) {
        return (
            <SimilarSection>
                <div className="mb-5 sm:mb-6">{heading}</div>
                {state && <ProductRailState {...state} />}
            </SimilarSection>
        );
    }

    return (
        <SimilarSection>
            <Carousel opts={{ align: "start" }} className="w-full min-w-0">
                <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
                    {heading}
                    <div className="max-sm:hidden">
                        <ProductCarouselNavButtons
                            previousLabel={t("product.similar.previous")}
                            nextLabel={t("product.similar.next")}
                        />
                    </div>
                </div>
                <CarouselContent className="-ml-3 sm:-ml-6">
                    {data.products.map((product) => (
                        <CarouselItem key={product.productListingId} className={ITEM_CLASS}>
                            {product.userState?.searchFilter?.hidden === true ? (
                                <SearchHiddenMatchCard />
                            ) : (
                                <SearchResultCard product={product} firstImageOnly />
                            )}
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </SimilarSection>
    );
}
