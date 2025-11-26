import type {
    GetItemEventData,
    ItemEventPayloadData,
    ItemCreatedEventPayloadData,
    PriceData,
    ItemEventStateChangedPayloadData,
    ItemEventPriceChangedPayloadData,
    ItemEventPriceDiscoveredPayloadData,
    ItemEventPriceRemovedPayloadData,
    PersonalizedGetItemData,
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

export type ItemStateChangedPayload = {
    readonly oldState: ItemState;
    readonly newState: ItemState;
};

export type ItemPriceChangedPayload = {
    readonly oldPrice: Price;
    readonly newPrice: Price;
};

export type ItemPriceDiscoveredPayload = {
    readonly newPrice: Price;
};

export type ItemPriceRemovedPayload = {
    readonly oldPrice: Price;
};

export type ItemEvent = {
    readonly eventType: string;
    readonly itemId: string;
    readonly eventId: string;
    readonly shopId: string;
    readonly shopsItemId: string;
    readonly payload:
        | ItemCreatedPayload
        | ItemStateChangedPayload
        | ItemPriceChangedPayload
        | ItemPriceDiscoveredPayload
        | ItemPriceRemovedPayload;
    readonly timestamp: Date;
};

export type ItemDetail = OverviewItem & {
    readonly history?: readonly ItemEvent[];
};

/**
 *  Checks if payload is a STATE CHANGED event (has oldState + newState)
 */
function isStateChangedPayload(
    payload: ItemEventPayloadData,
): payload is ItemEventStateChangedPayloadData {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "oldState" in payload &&
        "newState" in payload
    );
}

/**
 * Checks if payload is a CREATED event (has state field and no old/new state)
 */
function isCreatedPayload(payload: ItemEventPayloadData): payload is ItemCreatedEventPayloadData {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "state" in payload &&
        !("oldState" in payload) &&
        !("newState" in payload)
    );
}

/**
 * Checks if payload is a PRICE CHANGED event (has oldPrice + newPrice)
 */
function isPriceChangedPayload(
    payload: ItemEventPayloadData,
): payload is ItemEventPriceChangedPayloadData {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "oldPrice" in payload &&
        "newPrice" in payload
    );
}

/**
 * Checks if payload is a PRICE DISCOVERED event (has only newPrice)
 */
function isPriceDiscoveredPayload(
    payload: ItemEventPayloadData,
): payload is ItemEventPriceDiscoveredPayloadData {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "newPrice" in payload &&
        !("oldPrice" in payload)
    );
}

function isPriceRemovedPayload(
    payload: ItemEventPayloadData,
): payload is ItemEventPriceRemovedPayloadData {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "oldPrice" in payload &&
        !("newPrice" in payload)
    );
}

/**
 * Converts a state string from the API to our internal ItemState type
 */
function mapStateChangedPayload(
    apiPayload: ItemEventStateChangedPayloadData,
): ItemStateChangedPayload {
    return {
        oldState: parseItemState(apiPayload.oldState),
        newState: parseItemState(apiPayload.newState),
    };
}

/**
 * Converts price data from the API to our internal Price type
 */
function mapPriceChangedPayload(
    apiPayload: ItemEventPriceChangedPayloadData,
): ItemPriceChangedPayload {
    return {
        oldPrice: mapPricePayload(apiPayload.oldPrice),
        newPrice: mapPricePayload(apiPayload.newPrice),
    };
}

function mapPriceDiscoveredPayload(
    apiPayload: ItemEventPriceDiscoveredPayloadData,
): ItemPriceDiscoveredPayload {
    return {
        newPrice: mapPricePayload(apiPayload.newPrice),
    };
}

function mapPriceRemovedPayload(
    apiPayload: ItemEventPriceRemovedPayloadData,
): ItemPriceRemovedPayload {
    return {
        oldPrice: mapPricePayload(apiPayload.oldPrice),
    };
}

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
function mapEventPayload(
    apiPayload: ItemEventPayloadData,
):
    | ItemCreatedPayload
    | ItemStateChangedPayload
    | ItemPriceChangedPayload
    | ItemPriceDiscoveredPayload
    | ItemPriceRemovedPayload {
    if (isCreatedPayload(apiPayload)) {
        return mapCreatedPayload(apiPayload);
    }

    if (isStateChangedPayload(apiPayload)) {
        return mapStateChangedPayload(apiPayload);
    }

    if (isPriceChangedPayload(apiPayload)) {
        return mapPriceChangedPayload(apiPayload);
    }

    if (isPriceDiscoveredPayload(apiPayload)) {
        return mapPriceDiscoveredPayload(apiPayload);
    }

    if (isPriceRemovedPayload(apiPayload)) {
        return mapPriceRemovedPayload(apiPayload);
    }

    return {
        state: parseItemState("UNKNOWN"),
        price: undefined,
    };
}

/**
 * Converts complete item data from the API to our internal ItemDetail type
 * Includes all item information and the full event history
 */
export function mapToDetailItem(apiData: PersonalizedGetItemData): ItemDetail {
    return {
        ...mapToInternalOverviewItem(apiData),
        history: apiData.item.history?.map(
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
