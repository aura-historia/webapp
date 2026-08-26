import { ShopHeader } from "@/features/shop/profile/components/ShopHeader.tsx";
import { ShopLocationSection } from "@/features/shop/profile/components/ShopLocationSection.tsx";
import { ShopProductGrid } from "@/features/shop/profile/components/ShopProductGrid.tsx";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { useCallback, useState } from "react";

type ShopProfilePageProps = {
    readonly shop: ShopDetail;
};

export function ShopProfilePage({ shop }: ShopProfilePageProps) {
    const [productCount, setProductCount] = useState<number | undefined>(undefined);

    const handleTotalChange = useCallback((total: number | undefined) => {
        setProductCount(total);
    }, []);

    return (
        <div className="bg-background">
            <ShopHeader shop={shop} productCount={productCount} />
            <ShopLocationSection shop={shop} />
            <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-10">
                <ShopProductGrid
                    shopName={shop.name}
                    shopType={shop.shopType}
                    onTotalChange={handleTotalChange}
                />
            </div>
        </div>
    );
}
