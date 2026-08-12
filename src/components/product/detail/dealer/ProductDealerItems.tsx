import { useDealerProducts } from "@/hooks/shop/useDealerProducts.ts";
import { ProductGridItem } from "@/components/product/grid/ProductGridItem.tsx";
import { ProductGridItemSkeleton } from "@/components/product/grid/ProductGridItemSkeleton.tsx";
import { ProductSectionHeading } from "@/components/product/detail/ProductSectionHeading.tsx";
import { ProductCarouselNavButtons } from "@/components/product/detail/ProductCarouselNavButtons.tsx";
import { EmptyState } from "@/components/common/EmptyState.tsx";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, ServerCrash } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel.tsx";
import {
    buildBreadcrumbSearch,
    type BreadcrumbOrigin,
} from "@/data/internal/common/BreadcrumbOrigin.ts";

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"];

interface ProductDealerItemsProps {
    readonly shopName: string;
    readonly shopSlugId: string;
    readonly excludeProductId: string;
    readonly breadcrumbOrigin?: BreadcrumbOrigin;
}

export function ProductDealerItems({
    shopName,
    shopSlugId,
    excludeProductId,
    breadcrumbOrigin,
}: ProductDealerItemsProps) {
    const { t } = useTranslation();
    const breadcrumbSearch = buildBreadcrumbSearch(breadcrumbOrigin);
    const { data, isLoading, isError, error } = useDealerProducts(shopName, excludeProductId);

    if (isLoading) {
        return (
            <section className="flex min-w-0 flex-col gap-8">
                <ProductSectionHeading title={t("product.dealer.title")} />
                <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                    {SKELETON_IDS.map((skeletonId) => (
                        <ProductGridItemSkeleton key={skeletonId} />
                    ))}
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="flex min-w-0 flex-col gap-8">
                <ProductSectionHeading title={t("product.dealer.title")} />
                <EmptyState
                    icon={ServerCrash}
                    title={t("product.dealer.error.title")}
                    description={error?.message ?? t("product.dealer.error.description")}
                />
            </section>
        );
    }

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <section className="flex min-w-0 flex-col gap-8">
            <Carousel opts={{ align: "start" }} className="w-full min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <ProductSectionHeading title={t("product.dealer.title")} />
                    <div className="flex shrink-0 items-center gap-4">
                        <Link
                            to="/shops/$shopSlugId"
                            params={{ shopSlugId }}
                            search={breadcrumbSearch}
                            className="flex items-center gap-1 text-xs uppercase tracking-widest text-primary hover:underline"
                        >
                            <span>{t("shop.card.viewShop")}</span>
                            <ArrowUpRight className="size-4" />
                        </Link>
                        <ProductCarouselNavButtons />
                    </div>
                </div>
                <CarouselContent className="-ml-6 mt-6">
                    {data.map((product) => (
                        <CarouselItem
                            key={product.productId}
                            className="basis-full pl-6 sm:basis-1/2 lg:basis-1/4"
                        >
                            <ProductGridItem
                                product={product}
                                breadcrumbOrigin={breadcrumbOrigin}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
