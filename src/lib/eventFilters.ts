import type { ItemEvent, Price, ItemCreatedPayload } from "@/data/internal/ItemDetails";
import type { ItemState } from "@/data/internal/ItemState";
import type { StateEventType, PriceEventType } from "@/types/events";

/**
 * Filter only state events (where payload is a string like "AVAILABLE")
 * This excludes price events which have payload with {amount, currency}
 */
export function isStateEvent(event: ItemEvent): event is ItemEvent & {
    payload: ItemState;
    eventType: StateEventType;
} {
    return typeof event.payload === "string";
}

/**
 * Filter only price events (where payload is object like { amount: 4999, currency: "EUR" })
 * This excludes state events which have string payload like "AVAILABLE"
 */
export function isPriceEvent(event: ItemEvent): event is ItemEvent & {
    payload: Price;
    eventType: PriceEventType;
} {
    return (
        typeof event.payload === "object" &&
        "amount" in event.payload &&
        "currency" in event.payload &&
        !("state" in event.payload)
    );
}

/**
 * Filter only CREATED events (where payload is an object with both state and price)
 * This excludes regular state events (string payload) and price-only events
 */
export function isCreatedEvent(event: ItemEvent): event is ItemEvent & {
    payload: ItemCreatedPayload;
    eventType: "CREATED";
} {
    return (
        event.eventType === "CREATED" &&
        typeof event.payload === "object" &&
        "state" in event.payload
    );
}
