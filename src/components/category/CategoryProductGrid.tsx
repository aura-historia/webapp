import { ProductGridItem } from "@/components/product/grid/ProductGridItem.tsx";
import { ProductGridItemSkeleton } from "@/components/product/grid/ProductGridItemSkeleton.tsx";
import { useCategoryProducts } from "@/hooks/category/useCategoryProducts.ts";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SearchX } from "lucide-react";
import { H3 } from "@/components/typography/H3.tsx";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";

const SKELETON_COUNT = 8;
const SKELETON_IDS = Array.from({ length: SKELETON_COUNT }, (_, i) => `skeleton-${i}`);

type CategoryProductGridProps = {
    readonly categoryId: string;
};

export function CategoryProductGrid({ categoryId }: CategoryProductGridProps) {
    const { ref, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useCategoryProducts(categoryId);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isPending) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {SKELETON_IDS.map((id) => (
                    <ProductGridItemSkeleton key={id} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center gap-4 py-16">
                <SearchX className="h-16 w-16 text-muted-foreground" />
                <div className="text-center space-y-2">
                    <H3>{t("category.products.error.title")}</H3>
                    <p className="text-base text-muted-foreground">
                        {t("category.products.error.description")}
                    </p>
                </div>
            </div>
        );
    }

    const allProducts = data?.pages.flatMap((page) => page.products) ?? [];
    const totalProducts = data?.pages[0]?.total ?? 0;

    if (allProducts.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-16">
                <SearchX className="h-16 w-16 text-muted-foreground" />
                <div className="text-center space-y-2">
                    <H3>{t("category.products.noResults.title")}</H3>
                    <p className="text-base text-muted-foreground">
                        {t("category.products.noResults.description")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allProducts.map((product) => (
                    <ProductGridItem key={product.productId} product={product} />
                ))}
            </div>
            {(isFetchingNextPage || !hasNextPage) && (
                <ListLoaderRow
                    isFetchingNextPage={isFetchingNextPage}
                    totalCount={totalProducts}
                    loadingMoreKey="category.products.loadingMore"
                    allLoadedKey="category.products.allLoaded"
                />
            )}
            {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-1" />}
        </div>
    );
}
