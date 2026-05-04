import { ProductCard } from "@/components/product/overview/ProductCard.tsx";
import { MatchFeedbackButtons } from "@/components/product/buttons/MatchFeedbackButtons.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";

interface SearchFilterMatchCardProps {
    readonly product: OverviewProduct;
    readonly filterId: string;
}

export function SearchFilterMatchCard({ product, filterId }: SearchFilterMatchCardProps) {
    const searchFilterData = product.userData?.searchFilterData;

    return (
        <div className="relative">
            <div className="absolute right-3 top-3 z-20 rounded-sm bg-surface-container-lowest/85 backdrop-blur-sm">
                <MatchFeedbackButtons
                    filterId={filterId}
                    shopId={product.shopId}
                    shopsProductId={product.shopsProductId}
                    currentFeedback={searchFilterData?.matchFeedback}
                />
            </div>
            <ProductCard product={product} />
        </div>
    );
}
