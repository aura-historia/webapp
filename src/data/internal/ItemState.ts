import type { ItemStateData } from "@/client";

export type ItemState = "LISTED" | "AVAILABLE" | "RESERVED" | "SOLD" | "REMOVED" | "UNKNOWN";

export function parseItemState(state?: string): ItemState {
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

export function mapToBackendState(state: ItemState): ItemStateData {
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
