import type { GetItemData, ItemStateData } from "@/client";
import { formatPrice } from "@/lib/utils.ts";

export type OverviewItem = {
    readonly itemId: string;
    readonly eventId: string;
    readonly shopId: string;
    readonly shopsItemId: string;
    readonly shopName: string;
    readonly title: string;
    readonly description?: string;
    readonly price: string | undefined;
    readonly state: ItemStateData;
    readonly url: URL | null;
    readonly images: readonly URL[];
    readonly created: Date;
    readonly updated: Date;
};

export function mapToInternalOverviewItem(apiData: GetItemData): OverviewItem {
    return {
        itemId: apiData.itemId,
        eventId: apiData.eventId,
        shopId: apiData.shopId,
        shopsItemId: apiData.shopsItemId,
        shopName: apiData.shopName,
        title:
            apiData.title.text.length > 127
                ? apiData.title.text.slice(0, 127).trim() + "..."
                : apiData.title.text,
        description: apiData.description?.text,
        price: apiData.price ? formatPrice(apiData.price) : undefined,
        state: apiData.state,
        url: URL.parse(apiData.url),
        images: apiData.images.filter((url) => URL.canParse(url)).map((url): URL => new URL(url)),
        created: new Date(apiData.created),
        updated: new Date(apiData.updated),
    };
}
