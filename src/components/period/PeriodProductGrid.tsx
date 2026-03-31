import { ProductGridItem } from "@/components/product/grid/ProductGridItem.tsx";
import { ProductGridItemSkeleton } from "@/components/product/grid/ProductGridItemSkeleton.tsx";
import { usePeriodProducts } from "@/hooks/period/usePeriodProducts.ts";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SearchX } from "lucide-react";
import { H3 } from "@/components/typography/H3.tsx";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";

const SKELETON_COUNT = 8;
const SKELETON_IDS = Array.from({ length: SKELETON_COUNT }, (_, i) => `skeleton-${i}`);

interface PeriodProductGridProps {
    readonly periodId: string;
}

/**
 * Displays a grid of products for a specific period with infinite scrolling.
 */
export function PeriodProductGrid({ periodId }: PeriodProductGridProps) {
    const { ref, inView } = useInView();
    const { t } = useTranslation();
    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
        usePeriodProducts(periodId);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {SKELETON_IDS.map((id) => (
                    <ProductGridItemSkeleton key={id} />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center gap-4 py-16">
                <SearchX className="h-16 w-16 text-muted-foreground" />
                <div className="text-center space-y-2">
                    <H3>{t("period.products.error.title")}</H3>
                    <p className="text-base text-muted-foreground">
                        {t("period.products.error.description")}
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
                    <H3>{t("period.products.noResults.title")}</H3>
                    <p className="text-base text-muted-foreground">
                        {t("period.products.noResults.description")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allProducts.map((product) => (
                    <ProductGridItem
                        key={`${product.shopId}-${product.shopsProductId}`}
                        product={product}
                    />
                ))}
            </div>
            {(isFetchingNextPage || !hasNextPage) && (
                <ListLoaderRow
                    isFetchingNextPage={isFetchingNextPage}
                    totalCount={totalProducts}
                    loadingMoreKey="period.products.loadingMore"
                    allLoadedKey="period.products.allLoaded"
                />
            )}
            {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-1" />}
        </div>
    );
}
