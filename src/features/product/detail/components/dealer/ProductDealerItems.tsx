import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ServerCrash } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel.tsx";
import type { ProductListingSource } from "@/data/internal/product/ProductListingSource.ts";
import { useDealerProducts } from "@/features/product/detail/api/useDealerProducts.ts";
import {
    ProductCarouselNavButtons,
    ProductCarouselProgress,
} from "@/features/product/detail/components/ProductCarouselNavButtons.tsx";
import { ProductRailState } from "@/features/product/detail/components/ProductRailState.tsx";
import { ProductSectionHeading } from "@/features/product/detail/components/ProductSectionHeading.tsx";
import { SearchResultCard } from "@/features/search/products/components/results/SearchResultCard.tsx";
import { SearchResultCardSkeleton } from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { cn } from "@/lib/utils.ts";

const HEADING_ID = "product-dealer-title";
const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"];

interface ProductDealerItemsProps {
    readonly source: ProductListingSource;
    readonly excludeProductListingId: string;
}

/** The raised band at the foot of the page, wider than the content column. */
function DealerBand({ children }: { readonly children: ReactNode }) {
    return (
        <section
            aria-labelledby={HEADING_ID}
            className="bg-surface-raised py-12 shadow-[inset_0_1px_0_var(--color-line-subtle)] sm:pt-22 sm:pb-30"
        >
            <div className="mx-auto w-full max-w-[calc(var(--container-content)+2*var(--page-gutter))] px-(--page-gutter)">
                {children}
            </div>
        </section>
    );
}

export function ProductDealerItems({ source, excludeProductListingId }: ProductDealerItemsProps) {
    const { t } = useTranslation();
    const { data, isLoading, isError, error } = useDealerProducts(
        source.listingSourceId,
        excludeProductListingId,
    );
    const heading = (
        <ProductSectionHeading
            id={HEADING_ID}
            eyebrow={source.name}
            title={t("product.dealer.title")}
        />
    );
    const profileLink = (
        <Link
            to="/$lng/shops/$shopSlugId"
            params={(current) => ({ ...current, shopSlugId: source.slugId })}
            from="/$lng"
            className="inline-flex min-h-11 items-center gap-1.5 self-start text-body-sm font-medium underline decoration-line-strong underline-offset-3 outline-none hover:text-brass-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass"
        >
            {t("shop.card.viewSource")}
            <ArrowUpRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
        </Link>
    );

    if (isLoading) {
        return (
            <DealerBand>
                <div className="mb-6 sm:mb-9">{heading}</div>
                <div
                    aria-busy="true"
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    {SKELETON_IDS.map((skeletonId, index) => (
                        <div
                            key={skeletonId}
                            className={cn(
                                index > 0 && "max-sm:hidden",
                                index > 1 && "max-lg:hidden",
                                index > 2 && "max-xl:hidden",
                            )}
                        >
                            <SearchResultCardSkeleton />
                        </div>
                    ))}
                </div>
            </DealerBand>
        );
    }

    if (isError) {
        return (
            <DealerBand>
                <div className="mb-6 sm:mb-9">{heading}</div>
                <ProductRailState
                    icon={ServerCrash}
                    tone="error"
                    raised
                    title={t("product.dealer.error.title")}
                    description={error?.message ?? t("product.dealer.error.description")}
                />
            </DealerBand>
        );
    }

    if (!data || data.length === 0) return null;

    return (
        <DealerBand>
            <Carousel opts={{ align: "start" }} className="w-full min-w-0">
                <div className="mb-5 flex flex-col gap-2.5 sm:mb-9 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-6 sm:gap-y-4">
                    {heading}
                    <div className="flex items-center gap-4">
                        {profileLink}
                        <div className="max-sm:hidden">
                            <ProductCarouselNavButtons
                                previousLabel={t("product.dealer.previous")}
                                nextLabel={t("product.dealer.next")}
                            />
                        </div>
                    </div>
                </div>
                <CarouselContent className="-ml-3 sm:-ml-6">
                    {data.map((product) => (
                        <CarouselItem
                            key={product.productListingId}
                            className="basis-[72%] pl-3 sm:basis-1/2 sm:pl-6 lg:basis-1/3 xl:basis-1/4"
                        >
                            <SearchResultCard product={product} firstImageOnly />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <ProductCarouselProgress total={data.length} />
            </Carousel>
        </DealerBand>
    );
}
