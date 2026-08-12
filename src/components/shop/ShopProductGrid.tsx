import { ProductGridItem } from "@/components/product/grid/ProductGridItem.tsx";
import { ProductGridItemSkeleton } from "@/components/product/grid/ProductGridItemSkeleton.tsx";
import { useShopProducts } from "@/hooks/shop/useShopProducts.ts";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SearchX, ServerCrash } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState.tsx";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";
import { SHOP_TYPE_TRANSLATION_CONFIG, type ShopType } from "@/data/internal/shop/ShopType.ts";
import { useLocation } from "@tanstack/react-router";
import type { BreadcrumbOrigin } from "@/data/internal/common/BreadcrumbOrigin.ts";

const SKELETON_COUNT = 8;
const SKELETON_IDS = Array.from({ length: SKELETON_COUNT }, (_, i) => `skeleton-${i}`);

type ShopProductGridProps = {
    readonly shopName: string;
    readonly shopType?: ShopType;
    readonly onTotalChange?: (total: number | undefined) => void;
};

export function ShopProductGrid({ shopName, shopType, onTotalChange }: ShopProductGridProps) {
    const { ref, inView } = useInView();
    const { t } = useTranslation();
    // pathname, not href: this shop page's own URL may itself carry a
    // ?from=...&fromKind=... (e.g. reached via a product's "sold by" link),
    // and the shop route's only search params ARE from/fromKind — so href
    // would nest that origin into every product card's own from, bloating
    // it by one extra percent-encoded level. See ProductDetailPage.tsx for
    // the same fix applied to the (unbounded, recursive) product->product case.
    const currentPathname = useLocation({ select: (location) => location.pathname });
    const breadcrumbOrigin: BreadcrumbOrigin = { from: currentPathname, fromKind: "shop" };
    const shopTypeName = shopType
        ? t(SHOP_TYPE_TRANSLATION_CONFIG[shopType].translationKey)
        : t("shop.typeFallback");
    const shopTypePossessive = shopType
        ? t(SHOP_TYPE_TRANSLATION_CONFIG[shopType].possessiveTranslationKey)
        : t("shop.typePossessiveFallback");
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
            <EmptyState
                icon={ServerCrash}
                title={t("shop.products.error.title")}
                description={t("shop.products.error.description")}
            />
        );
    }

    const allProducts = data?.pages.flatMap((page) => page.products) ?? [];

    if (allProducts.length === 0) {
        return (
            <EmptyState
                icon={SearchX}
                title={t("shop.products.noResults.title")}
                description={t("shop.products.noResults.description", { shopType: shopTypeName })}
            />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-6">
                {allProducts.map((product) => (
                    <ProductGridItem
                        key={product.productId}
                        product={product}
                        breadcrumbOrigin={breadcrumbOrigin}
                    />
                ))}
            </div>
            {(isFetchingNextPage || !hasNextPage) && (
                <ListLoaderRow
                    isFetchingNextPage={isFetchingNextPage}
                    totalCount={totalProducts}
                    loadingMoreKey="shop.products.loadingMore"
                    allLoadedKey="shop.products.allLoaded"
                    allLoadedValues={{ shopTypePossessive }}
                />
            )}
            {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-1" />}
        </div>
    );
}
