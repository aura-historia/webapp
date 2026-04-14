import type { ProductStateData } from "@/client";

export const PRODUCT_STATES = [
    "LISTED",
    "AVAILABLE",
    "RESERVED",
    "SOLD",
    "REMOVED",
    "UNKNOWN",
] as const;
export type ProductState = (typeof PRODUCT_STATES)[number];
export const PRODUCT_STATE_TRANSLATION_CONFIG = {
    LISTED: {
        translationKey: "productState.listed",
        descriptionKey: "productState.listedDescription",
    },
    AVAILABLE: {
        translationKey: "productState.available",
        descriptionKey: "productState.availableDescription",
    },
    RESERVED: {
        translationKey: "productState.reserved",
        descriptionKey: "productState.reservedDescription",
    },
    SOLD: {
        translationKey: "productState.sold",
        descriptionKey: "productState.soldDescription",
    },
    REMOVED: {
        translationKey: "productState.removed",
        descriptionKey: "productState.removedDescription",
    },
    UNKNOWN: {
        translationKey: "productState.unknown",
        descriptionKey: "productState.unknownDescription",
    },
} as const;

export function parseProductState(state?: string): ProductState {
    const uppercasedStateData = state?.toUpperCase() ?? "UNKNOWN";

    switch (uppercasedStateData) {
        case "LISTED":
        case "AVAILABLE":
        case "RESERVED":
        case "SOLD":
        case "REMOVED":
            return uppercasedStateData;
        default:
            return "UNKNOWN";
    }
}

export function mapToBackendState(state: ProductState): ProductStateData {
    // This is kept to de-couple internal and backend representations
    switch (state) {
        case "LISTED":
        case "AVAILABLE":
        case "RESERVED":
        case "SOLD":
        case "REMOVED":
        case "UNKNOWN":
            return state;
    }
}
