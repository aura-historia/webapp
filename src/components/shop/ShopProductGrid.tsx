import { ProductGridItem } from "@/components/product/grid/ProductGridItem.tsx";
import { ProductGridItemSkeleton } from "@/components/product/grid/ProductGridItemSkeleton.tsx";
import { useShopProducts } from "@/hooks/shop/useShopProducts.ts";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SearchX } from "lucide-react";
import { H3 } from "@/components/typography/H3.tsx";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";

const SKELETON_COUNT = 8;
const SKELETON_IDS = Array.from({ length: SKELETON_COUNT }, (_, i) => `skeleton-${i}`);

type ShopProductGridProps = {
    readonly shopName: string;
    readonly onTotalChange?: (total: number | undefined) => void;
};

export function ShopProductGrid({ shopName, onTotalChange }: ShopProductGridProps) {
    const { ref, inView } = useInView();
    const { t } = useTranslation();
    const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useShopProducts(shopName);

    const totalProducts = data?.pages[0]?.total ?? 0;

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        onTotalChange?.(totalProducts);
    }, [totalProducts, onTotalChange]);

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
            <div className="flex flex-col items-center gap-4 py-16">
                <SearchX className="h-16 w-16 text-muted-foreground" />
                <div className="text-center space-y-2">
                    <H3>{t("shop.products.error.title")}</H3>
                    <p className="text-base text-muted-foreground">
                        {t("shop.products.error.description")}
                    </p>
                </div>
            </div>
        );
    }

    const allProducts = data?.pages.flatMap((page) => page.products) ?? [];

    if (allProducts.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-16">
                <SearchX className="h-16 w-16 text-muted-foreground" />
                <div className="text-center space-y-2">
                    <H3>{t("shop.products.noResults.title")}</H3>
                    <p className="text-base text-muted-foreground">
                        {t("shop.products.noResults.description")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-6">
                {allProducts.map((product) => (
                    <ProductGridItem key={product.productId} product={product} />
                ))}
            </div>
            {(isFetchingNextPage || !hasNextPage) && (
                <ListLoaderRow
                    isFetchingNextPage={isFetchingNextPage}
                    totalCount={totalProducts}
                    loadingMoreKey="shop.products.loadingMore"
                    allLoadedKey="shop.products.allLoaded"
                />
            )}
            {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-1" />}
        </div>
    );
}
