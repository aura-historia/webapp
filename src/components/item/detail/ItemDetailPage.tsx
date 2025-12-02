import type { ItemDetail } from "@/data/internal/ItemDetails.ts";
import { ItemPriceChart } from "@/components/item/detail/ItemPriceChart.tsx";
import { ItemHistory } from "@/components/item/detail/ItemHistory.tsx";
import { ItemInfo } from "@/components/item/detail/ItemInfo.tsx";
import { ItemSimilar } from "@/components/item/ItemSimilar.tsx";

export function ItemDetailPage({ item }: { readonly item: ItemDetail }) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <ItemInfo item={item} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6 lg:gap-8 mt-6 md:mt-8 md:grid-rows-[575px] lg:grid-rows-[575px] xl:grid-rows-[550px]">
                <ItemPriceChart history={item.history} />
                <ItemHistory history={item.history} />
            </div>

            <div className="mt-6 md:mt-8">
                <ItemSimilar shopId={item.shopId} shopsItemId={item.shopsItemId} />
            </div>
        </div>
    );
}
