import type { PriceEventTypeData, StateEventTypeData } from "@/types/events";
import type { ItemCreatedEventPayloadData, ItemStateData, PriceData } from "@/client";
import type { ItemEvent } from "@/data/internal/ItemDetails.ts";

/**
 * Filter only state events (where payload is a string like "AVAILABLE")
 * This excludes price events which have payload with {amount, currency}
 */
export function isStateEvent(event: ItemEvent): event is ItemEvent & {
    payload: ItemStateData;
    eventType: StateEventTypeData;
} {
    return event.payload !== null && typeof event.payload === "string";
}

/**
 * Filter only price events (where payload is a object like { amount: 4999, currency: "EUR" }
 * This excludes state events which have payload with string like "AVAILABLE"
 */
export function isPriceEvent(event: ItemEvent): event is ItemEvent & {
    payload: PriceData;
    eventType: PriceEventTypeData;
} {
    return (
        event.payload !== null &&
        typeof event.payload === "object" &&
        "amount" in event.payload &&
        "currency" in event.payload
    );
}

/**
 * Filter only CREATED events (where payload is an object with both state and price)
 * This excludes regular state events (string payload) and price-only events
 */
export function isCreatedEvent(event: ItemEvent): event is ItemEvent & {
    payload: ItemCreatedEventPayloadData;
    eventType: "CREATED";
} {
    return (
        event.eventType === "CREATED" &&
        event.payload !== null &&
        typeof event.payload === "object" &&
        "state" in event.payload &&
        "price" in event.payload
    );
}
