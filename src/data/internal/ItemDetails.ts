import type {
    GetItemData,
    GetItemEventData,
    ItemEventPayloadData,
    ItemCreatedEventPayloadData,
    PriceData,
    ItemStateData,
} from "@/client";
import { mapToInternalOverviewItem, type OverviewItem } from "@/data/internal/OverviewItem";
import { parseItemState, type ItemState } from "@/data/internal/ItemState";

export type Price = {
    readonly amount: number;
    readonly currency: string;
};

export type ItemCreatedPayload = {
    readonly state: ItemState;
    readonly price?: Price;
};

export type ItemEvent = {
    readonly eventType: string;
    readonly itemId: string;
    readonly eventId: string;
    readonly shopId: string;
    readonly shopsItemId: string;
    readonly payload: ItemState | Price | ItemCreatedPayload;
    readonly timestamp: Date;
};

export type ItemDetail = OverviewItem & {
    readonly history?: readonly ItemEvent[];
};

/**
 * Checks if the payload is a state string like "AVAILABLE" or "SOLD"
 */
function isStatePayload(payload: ItemEventPayloadData): payload is ItemStateData {
    return typeof payload === "string";
}

/**
 * Checks if the payload is a created event containing state and optional price
 */
function isCreatedPayload(payload: ItemEventPayloadData): payload is ItemCreatedEventPayloadData {
    return typeof payload === "object" && "state" in payload;
}

/**
 * Checks if the payload is a price object containing amount and currency
 */
function isPricePayload(payload: ItemEventPayloadData): payload is PriceData {
    return typeof payload === "object" && "amount" in payload && "currency" in payload;
}

/**
 * Converts a state string from the API to our internal ItemState type
 */
function mapStatePayload(apiPayload: ItemStateData): ItemState {
    return parseItemState(apiPayload);
}

/**
 * Converts price data from the API to our internal Price type
 */
function mapPricePayload(apiPayload: PriceData): Price {
    return {
        amount: apiPayload.amount,
        currency: apiPayload.currency,
    };
}

/**
 * Converts a created event from the API to our internal ItemCreatedPayload type
 */
function mapCreatedPayload(apiPayload: ItemCreatedEventPayloadData): ItemCreatedPayload {
    return {
        state: parseItemState(apiPayload.state),
        price: apiPayload.price ? mapPricePayload(apiPayload.price) : undefined,
    };
}

/**
 * Converts any event payload from the API to our internal types
 * Determines the payload type and calls the appropriate mapper function
 */
function mapEventPayload(apiPayload: ItemEventPayloadData): ItemState | Price | ItemCreatedPayload {
    if (isStatePayload(apiPayload)) {
        return mapStatePayload(apiPayload);
    }

    if (isCreatedPayload(apiPayload)) {
        return mapCreatedPayload(apiPayload);
    }

    if (isPricePayload(apiPayload)) {
        return mapPricePayload(apiPayload);
    }

    return parseItemState("UNKNOWN");
}

/**
 * Converts complete item data from the API to our internal ItemDetail type
 * Includes all item information and the full event history
 */
export function mapToDetailItem(apiData: GetItemData): ItemDetail {
    return {
        ...mapToInternalOverviewItem(apiData),
        history: apiData.history?.map(
            (apiEvent: GetItemEventData): ItemEvent => ({
                eventType: apiEvent.eventType,
                itemId: apiEvent.itemId,
                eventId: apiEvent.eventId,
                shopId: apiEvent.shopId,
                shopsItemId: apiEvent.shopsItemId,
                payload: mapEventPayload(apiEvent.payload),
                timestamp: new Date(apiEvent.timestamp),
            }),
        ),
    };
}
