import type { RestorationData } from "@/client";

export type Restoration = "NONE" | "MINOR" | "MAJOR" | "UNKNOWN";

export const RESTORATION_TRANSLATION_CONFIG = {
    NONE: {
        translationKey: "product.qualityIndicators.restoration.none",
        descriptionKey: "product.qualityIndicators.restoration.noneDescription",
    },
    MINOR: {
        translationKey: "product.qualityIndicators.restoration.minor",
        descriptionKey: "product.qualityIndicators.restoration.minorDescription",
    },
    MAJOR: {
        translationKey: "product.qualityIndicators.restoration.major",
        descriptionKey: "product.qualityIndicators.restoration.majorDescription",
    },
    UNKNOWN: {
        translationKey: "product.qualityIndicators.restoration.unknown",
        descriptionKey: "product.qualityIndicators.restoration.unknownDescription",
    },
} as const;

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
