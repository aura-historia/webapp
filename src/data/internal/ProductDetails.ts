import type {
    GetProductEventData,
    ProductEventPayloadData,
    ProductCreatedEventPayloadData,
    PriceData,
    ProductEventStateChangedPayloadData,
    ProductEventPriceChangedPayloadData,
    ProductEventPriceDiscoveredPayloadData,
    ProductEventPriceRemovedPayloadData,
    PersonalizedGetProductData,
} from "@/client";
import {
    mapToInternalOverviewProduct,
    type OverviewProduct,
} from "@/data/internal/OverviewProduct";
import { parseProductState, type ProductState } from "@/data/internal/ProductState";

export type Price = {
    readonly amount: number;
    readonly currency: string;
};

export type ProductCreatedPayload = {
    readonly state: ProductState;
    readonly price?: Price;
};

export type ProductStateChangedPayload = {
    readonly oldState: ProductState;
    readonly newState: ProductState;
};

export type ProductPriceChangedPayload = {
    readonly oldPrice: Price;
    readonly newPrice: Price;
};

export type ProductPriceDiscoveredPayload = {
    readonly newPrice: Price;
};

export type ProductPriceRemovedPayload = {
    readonly oldPrice: Price;
};

export type ProductEvent = {
    readonly eventType: string;
    readonly productId: string;
    readonly eventId: string;
    readonly shopId: string;
    readonly shopsProductId: string;
    readonly payload:
        | ProductCreatedPayload
        | ProductStateChangedPayload
        | ProductPriceChangedPayload
        | ProductPriceDiscoveredPayload
        | ProductPriceRemovedPayload;
    readonly timestamp: Date;
};

export type ProductDetail = OverviewProduct & {
    readonly history?: readonly ProductEvent[];
};

/**
 *  Checks if payload is a STATE CHANGED event (has oldState + newState)
 */
function isStateChangedPayload(
    payload: ProductEventPayloadData,
): payload is ProductEventStateChangedPayloadData {
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
function isCreatedPayload(
    payload: ProductEventPayloadData,
): payload is ProductCreatedEventPayloadData {
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
    payload: ProductEventPayloadData,
): payload is ProductEventPriceChangedPayloadData {
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
    payload: ProductEventPayloadData,
): payload is ProductEventPriceDiscoveredPayloadData {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "newPrice" in payload &&
        !("oldPrice" in payload)
    );
}

function isPriceRemovedPayload(
    payload: ProductEventPayloadData,
): payload is ProductEventPriceRemovedPayloadData {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "oldPrice" in payload &&
        !("newPrice" in payload)
    );
}

/**
 * Converts a state string from the API to our internal ProductState type
 */
function mapStateChangedPayload(
    apiPayload: ProductEventStateChangedPayloadData,
): ProductStateChangedPayload {
    return {
        oldState: parseProductState(apiPayload.oldState),
        newState: parseProductState(apiPayload.newState),
    };
}

/**
 * Converts price data from the API to our internal Price type
 */
function mapPriceChangedPayload(
    apiPayload: ProductEventPriceChangedPayloadData,
): ProductPriceChangedPayload {
    return {
        oldPrice: mapPricePayload(apiPayload.oldPrice),
        newPrice: mapPricePayload(apiPayload.newPrice),
    };
}

function mapPriceDiscoveredPayload(
    apiPayload: ProductEventPriceDiscoveredPayloadData,
): ProductPriceDiscoveredPayload {
    return {
        newPrice: mapPricePayload(apiPayload.newPrice),
    };
}

function mapPriceRemovedPayload(
    apiPayload: ProductEventPriceRemovedPayloadData,
): ProductPriceRemovedPayload {
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
 * Converts a created event from the API to our internal ProductCreatedPayload type
 */
function mapCreatedPayload(apiPayload: ProductCreatedEventPayloadData): ProductCreatedPayload {
    return {
        state: parseProductState(apiPayload.state),
        price: apiPayload.price ? mapPricePayload(apiPayload.price) : undefined,
    };
}

/**
 * Converts any event payload from the API to our internal types
 * Determines the payload type and calls the appropriate mapper function
 */
function mapEventPayload(
    apiPayload: ProductEventPayloadData,
):
    | ProductCreatedPayload
    | ProductStateChangedPayload
    | ProductPriceChangedPayload
    | ProductPriceDiscoveredPayload
    | ProductPriceRemovedPayload {
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
        state: parseProductState("UNKNOWN"),
        price: undefined,
    };
}

/**
 * Converts complete product data from the API to our internal ProductDetail type
 * Includes all product information and the full event history
 */
export function mapToDetailProduct(apiData: PersonalizedGetProductData): ProductDetail {
    return {
        ...mapToInternalOverviewProduct(apiData),
        history: apiData.item.history?.map(
            (apiEvent: GetProductEventData): ProductEvent => ({
                eventType: apiEvent.eventType,
                productId: apiEvent.productId,
                eventId: apiEvent.eventId,
                shopId: apiEvent.shopId,
                shopsProductId: apiEvent.shopsProductId,
                payload: mapEventPayload(apiEvent.payload),
                timestamp: new Date(apiEvent.timestamp),
            }),
        ),
    };
}
