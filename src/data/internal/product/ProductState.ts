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
