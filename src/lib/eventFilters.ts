import type {
    ProductEvent,
    ProductCreatedPayload,
    ProductStateChangedPayload,
    ProductPriceChangedPayload,
    ProductPriceDiscoveredPayload,
    ProductPriceRemovedPayload,
} from "@/data/internal/ProductDetails";
import type { StateEventType, PriceEventType } from "@/types/events";

/**
 * Filter only CREATED events (where payload has state field and optional price)
 * This excludes state change events which have oldState/newState instead
 */
export function isCreatedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductCreatedPayload;
    eventType: "CREATED";
} {
    return (
        event.eventType === "CREATED" &&
        typeof event.payload === "object" &&
        event.payload !== null &&
        "state" in event.payload &&
        !("oldState" in event.payload) &&
        !("newState" in event.payload)
    );
}

/**
 * Filter only STATE CHANGED events (where payload has oldState and newState)
 * This excludes CREATED events which have only a state field
 */
export function isStateChangedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductStateChangedPayload;
    eventType: StateEventType;
} {
    return (
        typeof event.payload === "object" &&
        event.payload !== null &&
        "oldState" in event.payload &&
        "newState" in event.payload
    );
}

/**
 * Filter only PRICE CHANGED events (where payload has both oldPrice and newPrice)
 * This excludes PRICE_DISCOVERED (only newPrice) and PRICE_REMOVED (only oldPrice)
 */
export function isPriceChangedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductPriceChangedPayload;
    eventType: "PRICE_DROPPED" | "PRICE_INCREASED";
} {
    return (
        (event.eventType === "PRICE_DROPPED" || event.eventType === "PRICE_INCREASED") &&
        typeof event.payload === "object" &&
        event.payload !== null &&
        "oldPrice" in event.payload &&
        "newPrice" in event.payload
    );
}

/**
 * Filter only PRICE DISCOVERED events (where payload has only newPrice)
 * This excludes price change events which have both oldPrice and newPrice
 */
export function isPriceDiscoveredEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductPriceDiscoveredPayload;
    eventType: "PRICE_DISCOVERED";
} {
    return (
        event.eventType === "PRICE_DISCOVERED" &&
        typeof event.payload === "object" &&
        event.payload !== null &&
        "newPrice" in event.payload &&
        !("oldPrice" in event.payload)
    );
}

/**
 * Filter only PRICE REMOVED events (where payload has only oldPrice)
 * This excludes price change events which have both oldPrice and newPrice
 */
export function isPriceRemovedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductPriceRemovedPayload;
    eventType: "PRICE_REMOVED";
} {
    return (
        event.eventType === "PRICE_REMOVED" &&
        typeof event.payload === "object" &&
        event.payload !== null &&
        "oldPrice" in event.payload &&
        !("newPrice" in event.payload)
    );
}

/**
 * Filter all price events (where payload has price-related fields)
 * This excludes state events which have state or oldState/newState fields
 */
export function isPriceEvent(event: ProductEvent): event is ProductEvent & {
    payload:
        | ProductCreatedPayload
        | ProductPriceChangedPayload
        | ProductPriceDiscoveredPayload
        | ProductPriceRemovedPayload;
    eventType: PriceEventType;
} {
    return (
        isCreatedEvent(event) ||
        isPriceDiscoveredEvent(event) ||
        isPriceChangedEvent(event) ||
        isPriceRemovedEvent(event)
    );
}

/**
 * Filter all state events (where payload has state-related fields)
 * This excludes price events which have price-related fields
 */
export function isStateEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductCreatedPayload | ProductStateChangedPayload;
    eventType: StateEventType | "CREATED";
} {
    return isCreatedEvent(event) || isStateChangedEvent(event);
}
