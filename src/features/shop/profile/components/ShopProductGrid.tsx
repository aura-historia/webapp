import { ProductGridItem } from "@/features/product/catalog/components/grid/ProductGridItem.tsx";
import { ProductGridItemSkeleton } from "@/features/product/catalog/components/grid/ProductGridItemSkeleton.tsx";
import { useShopProducts } from "@/features/shop/profile/hooks/useShopProducts.ts";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SearchX, ServerCrash } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState.tsx";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";

const SKELETON_COUNT = 8;
const SKELETON_IDS = Array.from({ length: SKELETON_COUNT }, (_, i) => `skeleton-${i}`);

type ShopProductGridProps = {
    readonly source: PublicListingSource;
};

export function ShopProductGrid({ source }: ShopProductGridProps) {
    const { ref, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useShopProducts(source.listingSourceId);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isPending) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12">
                {SKELETON_IDS.map((id) => (
                    <ProductGridItemSkeleton key={id} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState
                icon={ServerCrash}
                title={t("shop.products.error.title")}
                description={t("shop.products.error.description")}
            />
        );
    }

    const allProducts = data?.pages.flatMap((page) => page.products) ?? [];

    if (allProducts.length === 0 && hasNextPage) {
        return <div ref={ref} className="h-1" />;
    }

    if (allProducts.length === 0) {
        return (
            <EmptyState
                icon={SearchX}
                title={t("shop.products.noResults.title")}
                description={t("shop.products.noResults.description", { source: source.name })}
            />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-6">
                {allProducts.map((product) => (
                    <ProductGridItem key={product.productId} product={product} />
                ))}
            </div>
            {isFetchingNextPage && (
                <ListLoaderRow isFetchingNextPage loadingMoreKey="shop.products.loadingMore" />
            )}
            {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-1" />}
        </div>
    );
}
