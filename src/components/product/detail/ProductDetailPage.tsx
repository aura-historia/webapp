import { useLocation } from "@tanstack/react-router";
import type { ProductDetail } from "@/data/internal/product/ProductDetails.ts";
import { ProductPriceChart } from "@/components/product/detail/ProductPriceChart.tsx";
import { ProductHistory } from "@/components/product/detail/ProductHistory.tsx";
import { ProductInfo } from "@/components/product/detail/ProductInfo.tsx";
import { ProductLocationSection } from "@/components/product/detail/ProductLocationSection.tsx";
import { ProductSimilar } from "@/components/product/detail/similar/ProductSimilar.tsx";
import { ProductDealerItems } from "@/components/product/detail/dealer/ProductDealerItems.tsx";
import { DetailPageBreadcrumb } from "@/components/common/breadcrumb/DetailPageBreadcrumb.tsx";
import type { BreadcrumbOrigin } from "@/data/internal/common/BreadcrumbOrigin.ts";

export function ProductDetailPage({
    product,
    origin,
}: {
    readonly product: ProductDetail;
    readonly origin?: BreadcrumbOrigin;
}) {
    // Deliberately `pathname`, not `href`: this page's own URL may itself carry
    // a `?from=...&fromKind=...` (if we were reached via search/shop/etc.).
    // Using the full href here would nest that origin into every subsequent
    // product->product hop, growing the URL by a full percent-encoded copy of
    // itself on each click through "similar"/"more from this dealer" items.
    // `pathname` gives a clean one-hop-back link, matching the deliberate
    // "single pointer, not a growing stack" design (see BreadcrumbOrigin.ts).
    const currentPathname = useLocation({ select: (location) => location.pathname });
    const similarOrigin: BreadcrumbOrigin = { from: currentPathname, fromKind: "product" };

    return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 md:px-8">
            <DetailPageBreadcrumb title={product.title} origin={origin} />

            <ProductInfo product={product} breadcrumbOrigin={similarOrigin} />

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
                        breadcrumbOrigin={similarOrigin}
                    />
                </div>
            </div>

            <div className="mt-16">
                <ProductDealerItems
                    shopName={product.shopName}
                    shopSlugId={product.shopSlugId}
                    excludeProductId={product.productId}
                    breadcrumbOrigin={similarOrigin}
                />
            </div>
        </div>
    );
}
