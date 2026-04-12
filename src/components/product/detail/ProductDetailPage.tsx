import type { ProductDetail } from "@/data/internal/product/ProductDetails.ts";
import { ProductPriceChart } from "@/components/product/detail/ProductPriceChart.tsx";
import { ProductHistory } from "@/components/product/detail/ProductHistory.tsx";
import { ProductInfo } from "@/components/product/detail/ProductInfo.tsx";
import { ProductSimilar } from "@/components/product/detail/similar/ProductSimilar.tsx";

export function ProductDetailPage({ product }: { readonly product: ProductDetail }) {
    return (
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-8 md:px-8">
            <ProductInfo product={product} />

            <div className="mt-16">
                <ProductPriceChart history={product.history} />
            </div>

            <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-4">
                    <ProductHistory history={product.history} />
                </div>
                <div className="lg:col-span-8">
                    <ProductSimilar
                        shopId={product.shopId}
                        shopsProductId={product.shopsProductId}
                    />
                </div>
            </div>
        </div>
    );
}
