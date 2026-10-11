import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import type { ProductListingHistoryEntry } from "@/data/internal/product/ProductListingHistory.ts";
import { useOptionalProductListingHistory } from "@/features/product/detail/api/productListingHistoryQuery.ts";
import { ProductPriceChart } from "@/features/product/detail/components/ProductPriceChart.tsx";
import { ProductHistory } from "@/features/product/detail/components/ProductHistory.tsx";
import { ProductInfo } from "@/features/product/detail/components/ProductInfo.tsx";
import { ProductSimilar } from "@/features/product/detail/components/similar/ProductSimilar.tsx";
import { ProductDealerItems } from "@/features/product/detail/components/dealer/ProductDealerItems.tsx";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";

export function ProductDetailPage({
    product,
    productListingId,
    history,
}: {
    readonly product: ProductListingDetail;
    readonly productListingId?: string;
    readonly history?: readonly ProductListingHistoryEntry[];
}) {
    const { preferences } = useUserPreferences();
    const historyQuery = useOptionalProductListingHistory(productListingId, preferences.currency);
    const listingHistory = history ?? historyQuery.data;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 md:px-8">
            <ProductInfo product={product} />

            <div className="mt-16">
                <ProductPriceChart
                    key={productListingId ?? product.productListingId}
                    history={listingHistory}
                    displayCurrency={preferences.currency}
                />
            </div>

            <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-4">
                    <ProductHistory
                        history={listingHistory}
                        displayCurrency={preferences.currency}
                    />
                </div>
                <div className="lg:col-span-8">
                    <ProductSimilar productListingId={product.productListingId} />
                </div>
            </div>

            <div className="mt-16">
                <ProductDealerItems
                    source={product.source}
                    excludeProductListingId={product.productListingId}
                />
            </div>
        </div>
    );
}
