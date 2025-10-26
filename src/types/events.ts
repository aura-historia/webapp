export type StateEventType =
    | "STATE_LISTED"
    | "STATE_AVAILABLE"
    | "STATE_RESERVED"
    | "STATE_SOLD"
    | "STATE_REMOVED"
    | "STATE_UNKNOWN";

export type PriceEventType =
    | "PRICE_DISCOVERED"
    | "PRICE_DROPPED"
    | "PRICE_INCREASED"
    | "PRICE_REMOVED";
