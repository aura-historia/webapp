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
