import type { RestorationData } from "@/client";

export type Restoration = "NONE" | "MINOR" | "MAJOR" | "UNKNOWN";

export function parseRestoration(restoration?: string | null): Restoration {
    const uppercasedRestorationData = restoration?.toUpperCase() ?? "UNKNOWN";

    switch (uppercasedRestorationData) {
        case "NONE":
        case "MINOR":
        case "MAJOR":
            return uppercasedRestorationData;
        default:
            return "UNKNOWN";
    }
}

export function mapToBackendRestoration(restoration: Restoration): RestorationData {
    switch (restoration) {
        case "NONE":
        case "MINOR":
        case "MAJOR":
        case "UNKNOWN":
            return restoration;
    }
}
