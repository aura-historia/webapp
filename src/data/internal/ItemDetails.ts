import type { GetItemData } from "@/client";
import { mapToInternalOverviewItem, type OverviewItem } from "@/data/internal/OverviewItem";
import { parseItemState, type ItemState } from "@/data/internal/ItemState";

export type Currency = "EUR" | "GBP" | "USD" | "AUD" | "CAD" | "NZD";

export type PriceData = {
    readonly currency: Currency;
    readonly amount: number;
};

export type ItemEvent = {
    readonly eventType:
        | "STATE_AVAILABLE"
        | "PRICE_DROPPED"
        | "STATE_LISTED"
        | "STATE_RESERVED"
        | "STATE_SOLD"
        | "STATE_REMOVED";
    readonly itemId: string;
    readonly eventId: string;
    readonly shopId: string;
    readonly shopsItemId: string;
    readonly payload: ItemState | PriceData;
    readonly timestamp: Date;
};

export type ItemDetail = OverviewItem & {
    readonly history?: readonly ItemEvent[];
};

export function mapToDetailItem(apiData: GetItemData): ItemDetail {
    const overviewItem = mapToInternalOverviewItem(apiData);

    return {
        ...overviewItem,
        history: apiData.history?.map((event) => ({
            eventType: event.eventType,
            itemId: event.itemId,
            eventId: event.eventId,
            shopId: event.shopId,
            shopsItemId: event.shopsItemId,
            payload:
                typeof event.payload === "string" ? parseItemState(event.payload) : event.payload,
            timestamp: new Date(event.timestamp),
        })),
    };
}
