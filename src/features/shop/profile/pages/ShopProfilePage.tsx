import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { ShopHeader } from "@/features/shop/profile/components/ShopHeader.tsx";
import { ShopListings } from "@/features/shop/profile/components/ShopListings.tsx";
import { SHOP_PAGE_CLASS } from "@/features/shop/profile/lib/shopStyles.ts";

type ShopProfilePageProps = {
    readonly shop: PublicListingSource;
    /** The active in-page search from the URL; empty for the full list. */
    readonly query: string;
    readonly onQueryChange: (query: string) => void;
};

export function ShopProfilePage({ shop, query, onQueryChange }: ShopProfilePageProps) {
    return (
        <div className={SHOP_PAGE_CLASS}>
            <ShopHeader shop={shop} />
            <ShopListings source={shop} query={query} onQueryChange={onQueryChange} />
        </div>
    );
}
