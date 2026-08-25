import type { ProductDetail } from "@/data/internal/product/ProductDetails.ts";
import { ProductPriceChart } from "@/features/product/detail/components/ProductPriceChart.tsx";
import { ProductHistory } from "@/features/product/detail/components/ProductHistory.tsx";
import { ProductInfo } from "@/features/product/detail/components/ProductInfo.tsx";
import { ProductLocationSection } from "@/features/product/detail/components/ProductLocationSection.tsx";
import { ProductSimilar } from "@/features/product/detail/components/similar/ProductSimilar.tsx";
import { ProductDealerItems } from "@/features/product/detail/components/dealer/ProductDealerItems.tsx";

export function ProductDetailPage({ product }: { readonly product: ProductDetail }) {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 md:px-8">
            <ProductInfo product={product} />

            <ProductLocationSection
                title={product.title}
                structuredAddress={product.structuredAddress}
                geoAddress={product.geoAddress}
            />

            <div className="mt-16">
                <ProductPriceChart key={product.shopsProductId} history={product.history} />
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

            <div className="mt-16">
                <ProductDealerItems
                    shopName={product.shopName}
                    shopSlugId={product.shopSlugId}
                    excludeProductId={product.productId}
                />
            </div>
        </div>
    );
}
