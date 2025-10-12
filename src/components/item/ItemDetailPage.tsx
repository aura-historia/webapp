import type { ItemDetail } from "@/data/internal/ItemDetails.ts";
import { ItemPriceChart } from "@/components/item/ItemPriceChart.tsx";
import { ItemHistory } from "@/components/item/ItemHistory.tsx";
import { ItemInfo } from "@/components/item/ItemInfo.tsx";

export function ItemDetailPage({ item }: { readonly item: ItemDetail }) {
    return (
        <div className="max-w-[1400px] mx-auto px-4 py-8">
            <ItemInfo item={item} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6 lg:gap-8 mt-6 md:mt-8 md:grid-rows-[500px] lg:grid-rows-[550px] xl:grid-rows-[600px]">
                <ItemPriceChart history={item.history} />
                <ItemHistory history={item.history} />
            </div>
        </div>
    );
}
