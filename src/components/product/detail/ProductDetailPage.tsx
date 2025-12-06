import type { ProductDetail } from "@/data/internal/ProductDetails.ts";
import { ProductPriceChart } from "@/components/product/detail/ProductPriceChart.tsx";
import { ProductHistory } from "@/components/product/detail/ProductHistory.tsx";
import { ProductInfo } from "@/components/product/detail/ProductInfo.tsx";
import { ProductSimilar } from "@/components/product/detail/ProductSimilar.tsx";

export function ProductDetailPage({ item }: { readonly item: ProductDetail }) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <ProductInfo item={item} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6 lg:gap-8 mt-6 md:mt-8 md:grid-rows-[575px] lg:grid-rows-[575px] xl:grid-rows-[550px]">
                <ProductPriceChart history={item.history} />
                <ProductHistory history={item.history} />
            </div>

            <div className="mt-6 md:mt-8">
                <ProductSimilar shopId={item.shopId} shopsProductId={item.shopsProductId} />
            </div>
        </div>
    );
}
