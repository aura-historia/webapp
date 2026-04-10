import type {
    ProductEvent,
    ProductCreatedPayload,
    ProductStateChangedPayload,
    ProductPriceChangedPayload,
    ProductPriceDiscoveredPayload,
    ProductPriceRemovedPayload,
    ProductEstimatePriceChangedPayload,
    ProductUrlChangedPayload,
    ProductImagesChangedPayload,
    ProductAuctionTimeChangedPayload,
    ProductOriginYearChangedPayload,
    ProductAuthenticityChangedPayload,
    ProductConditionChangedPayload,
    ProductProvenanceChangedPayload,
    ProductRestorationChangedPayload,
} from "@/data/internal/product/ProductDetails.ts";
import type { StateEventType } from "@/types/events";

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
        event.eventType === "STATE_CHANGED" &&
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
    eventType: "PRICE_CHANGED";
} {
    return (
        event.eventType === "PRICE_CHANGED" &&
        typeof event.payload === "object" &&
        event.payload !== null &&
        "oldPrice" in event.payload &&
        event.payload.oldPrice != null &&
        "newPrice" in event.payload &&
        event.payload.newPrice != null
    );
}

/**
 * Filter only PRICE DISCOVERED events (where payload has only newPrice)
 * This excludes price change events which have both oldPrice and newPrice
 */
export function isPriceDiscoveredEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductPriceDiscoveredPayload;
    eventType: "PRICE_CHANGED";
} {
    return (
        event.eventType === "PRICE_CHANGED" &&
        typeof event.payload === "object" &&
        event.payload !== null &&
        "newPrice" in event.payload &&
        event.payload.newPrice != null &&
        !("oldPrice" in event.payload && event.payload.oldPrice != null)
    );
}

/**
 * Filter only PRICE REMOVED events (where payload has only oldPrice)
 * This excludes price change events which have both oldPrice and newPrice
 */
export function isPriceRemovedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductPriceRemovedPayload;
    eventType: "PRICE_CHANGED";
} {
    return (
        event.eventType === "PRICE_CHANGED" &&
        typeof event.payload === "object" &&
        event.payload !== null &&
        "oldPrice" in event.payload &&
        event.payload.oldPrice != null &&
        !("newPrice" in event.payload && event.payload.newPrice != null)
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
    eventType: "PRICE_CHANGED" | "CREATED";
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

/**
 * Filter ESTIMATE_PRICE_CHANGED events
 */
export function isEstimatePriceChangedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductEstimatePriceChangedPayload;
    eventType: "ESTIMATE_PRICE_CHANGED";
} {
    return event.eventType === "ESTIMATE_PRICE_CHANGED";
}

/**
 * Filter URL_CHANGED events
 */
export function isUrlChangedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductUrlChangedPayload;
    eventType: "URL_CHANGED";
} {
    return event.eventType === "URL_CHANGED";
}

/**
 * Filter IMAGES_CHANGED events
 */
export function isImagesChangedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductImagesChangedPayload;
    eventType: "IMAGES_CHANGED";
} {
    return event.eventType === "IMAGES_CHANGED";
}

/**
 * Filter AUCTION_TIME_CHANGED events
 */
export function isAuctionTimeChangedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductAuctionTimeChangedPayload;
    eventType: "AUCTION_TIME_CHANGED";
} {
    return event.eventType === "AUCTION_TIME_CHANGED";
}

/**
 * Filter ORIGIN_YEAR_CHANGED events
 */
export function isOriginYearChangedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductOriginYearChangedPayload;
    eventType: "ORIGIN_YEAR_CHANGED";
} {
    return event.eventType === "ORIGIN_YEAR_CHANGED";
}

/**
 * Filter AUTHENTICITY_CHANGED events
 */
export function isAuthenticityChangedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductAuthenticityChangedPayload;
    eventType: "AUTHENTICITY_CHANGED";
} {
    return event.eventType === "AUTHENTICITY_CHANGED";
}

/**
 * Filter CONDITION_CHANGED events
 */
export function isConditionChangedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductConditionChangedPayload;
    eventType: "CONDITION_CHANGED";
} {
    return event.eventType === "CONDITION_CHANGED";
}

/**
 * Filter PROVENANCE_CHANGED events
 */
export function isProvenanceChangedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductProvenanceChangedPayload;
    eventType: "PROVENANCE_CHANGED";
} {
    return event.eventType === "PROVENANCE_CHANGED";
}

/**
 * Filter RESTORATION_CHANGED events
 */
export function isRestorationChangedEvent(event: ProductEvent): event is ProductEvent & {
    payload: ProductRestorationChangedPayload;
    eventType: "RESTORATION_CHANGED";
} {
    return event.eventType === "RESTORATION_CHANGED";
}

/**
 * Filter all detail events (the 9 new event types for product attributes)
 */
export function isDetailsEvent(event: ProductEvent): boolean {
    return (
        isEstimatePriceChangedEvent(event) ||
        isUrlChangedEvent(event) ||
        isImagesChangedEvent(event) ||
        isAuctionTimeChangedEvent(event) ||
        isOriginYearChangedEvent(event) ||
        isAuthenticityChangedEvent(event) ||
        isConditionChangedEvent(event) ||
        isProvenanceChangedEvent(event) ||
        isRestorationChangedEvent(event)
    );
}
