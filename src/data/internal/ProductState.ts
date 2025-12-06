import type { ProductStateData } from "@/client";

export type ProductState = "LISTED" | "AVAILABLE" | "RESERVED" | "SOLD" | "REMOVED" | "UNKNOWN";

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
