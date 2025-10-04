import type { ItemDetail } from "@/data/internal/ItemDetails.ts";
import { ItemPriceChart } from "@/components/item/ItemPriceChart.tsx";
import { ItemHistory } from "@/components/item/ItemHistory.tsx";
import { ItemInfo } from "@/components/item/ItemInfo.tsx";

export function ItemDetailPage({ item }: { readonly item: ItemDetail }) {
    return (
        <div className="max-w-[1400px] mx-auto px-4 py-8">
            <ItemInfo item={item} />
            <div className="grid grid-cols-2 gap-8 mt-8">
                <ItemPriceChart history={item.history} />
                <ItemHistory history={item.history} />
            </div>
        </div>
    );
}
