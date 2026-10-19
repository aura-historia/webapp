import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import type { ProductListingHistoryEntry } from "@/data/internal/product/ProductListingHistory.ts";
import { useOptionalProductListingHistory } from "@/features/product/detail/api/productListingHistoryQuery.ts";
import { ProductPriceChart } from "@/features/product/detail/components/ProductPriceChart.tsx";
import { ProductHistory } from "@/features/product/detail/components/ProductHistory.tsx";
import { ProductInfo } from "@/features/product/detail/components/ProductInfo.tsx";
import { ProductActionBar } from "@/features/product/detail/components/ProductListingActions.tsx";
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
        <div className="text-ink">
            <div className="mx-auto w-full max-w-[calc(var(--container-content)+2*var(--page-gutter))] px-(--page-gutter) pt-0 pb-16 sm:pt-10 sm:pb-28">
                <ProductInfo product={product} />

                <div className="mt-14 sm:mt-24">
                    <ProductPriceChart
                        key={productListingId ?? product.productListingId}
                        history={listingHistory}
                        displayCurrency={preferences.currency}
                    />
                </div>

                <div className="mt-14 grid grid-cols-1 items-start gap-14 sm:mt-24 lg:gap-16 xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
                    <ProductHistory
                        history={listingHistory}
                        displayCurrency={preferences.currency}
                    />
                    <ProductSimilar productListingId={product.productListingId} />
                </div>
            </div>

            <ProductDealerItems
                source={product.source}
                excludeProductListingId={product.productListingId}
            />

            <ProductActionBar product={product} />
        </div>
    );
}
