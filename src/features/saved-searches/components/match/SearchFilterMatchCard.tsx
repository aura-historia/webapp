import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { MatchFeedbackButtons } from "@/features/saved-searches/components/MatchFeedbackButtons.tsx";
import { SearchResultCard } from "@/features/search/products/components/results/SearchResultCard.tsx";

type Props = {
    readonly product: ProductListing;
    readonly filterId: string;
};

/** A search filter match: the search result card with the feedback row beneath it. */
export function SearchFilterMatchCard({ product, filterId }: Props) {
    return (
        <div className="flex min-w-0 flex-col">
            <SearchResultCard product={product} />
            <MatchFeedbackButtons
                filterId={filterId}
                productListingId={product.productListingId}
                currentFeedback={product.userState?.searchFilter?.matchFeedback}
            />
        </div>
    );
}
