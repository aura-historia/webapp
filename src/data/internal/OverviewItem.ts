import type { PersonalizedGetItemData } from "@/client";
import { formatPrice } from "@/lib/utils.ts";
import { type ItemState, parseItemState } from "@/data/internal/ItemState.ts";
import { mapToInternalUserItemData, type UserItemData } from "@/data/internal/UserItemData.ts";

export type OverviewItem = {
    readonly itemId: string;
    readonly eventId: string;
    readonly shopId: string;
    readonly shopsItemId: string;
    readonly shopName: string;
    readonly title: string;
    readonly description?: string;
    readonly price?: string;
    readonly state: ItemState;
    readonly url: URL | null;
    readonly images: readonly URL[];
    readonly created: Date;
    readonly updated: Date;
    readonly userData?: UserItemData;
};

export function mapToInternalOverviewItem(apiData: PersonalizedGetItemData): OverviewItem {
    const itemData = apiData.item;
    const userData = apiData.userState;

    return {
        itemId: itemData.itemId,
        eventId: itemData.eventId,
        shopId: itemData.shopId,
        shopsItemId: itemData.shopsItemId,
        shopName: itemData.shopName,
        title: itemData.title.text,
        description: itemData.description?.text,
        price: itemData.price ? formatPrice(itemData.price) : undefined,
        state: parseItemState(itemData.state),
        url: URL.parse(itemData.url),
        images:
            itemData.images == null
                ? []
                : itemData.images
                      .filter((url) => URL.canParse(url))
                      .map((url): URL => new URL(url)),
        created: new Date(itemData.created),
        updated: new Date(itemData.updated),
        userData: userData ? mapToInternalUserItemData(userData) : undefined,
    };
}
