import { ProductCard } from "@/features/product/catalog/components/cards/ProductCard.tsx";
import { MatchFeedbackButtons } from "@/features/saved-searches/components/MatchFeedbackButtons.tsx";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";

type Props = {
    readonly product: ProductListing;
    readonly filterId: string;
};

export function SearchFilterMatchCard({ product, filterId }: Props) {
    const searchFilterData = product.userState?.searchFilter;

    return (
        <div className="relative">
            <div className="absolute right-3 top-3 z-20 rounded-sm bg-surface-container-lowest/85 backdrop-blur-sm">
                <MatchFeedbackButtons
                    filterId={filterId}
                    productListingId={product.productListingId}
                    currentFeedback={searchFilterData?.matchFeedback}
                />
            </div>
            <ProductCard product={product} />
        </div>
    );
}
