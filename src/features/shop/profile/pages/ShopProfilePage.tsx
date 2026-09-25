import { ShopHeader } from "@/features/shop/profile/components/ShopHeader.tsx";
import { ShopProductGrid } from "@/features/shop/profile/components/ShopProductGrid.tsx";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";

type ShopProfilePageProps = {
    readonly shop: PublicListingSource;
};

export function ShopProfilePage({ shop }: ShopProfilePageProps) {
    return (
        <div className="bg-background">
            <ShopHeader shop={shop} />
            <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-10">
                <ShopProductGrid source={shop} />
            </div>
        </div>
    );
}
