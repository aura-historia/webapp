import type { AuthenticityData } from "@/client";

export const AUTHENTICITY = [
    "ORIGINAL",
    "LATER_COPY",
    "REPRODUCTION",
    "QUESTIONABLE",
    "UNKNOWN",
] as const;
export type Authenticity = (typeof AUTHENTICITY)[number];
export const AUTHENTICITY_TRANSLATION_CONFIG = {
    ORIGINAL: {
        translationKey: "product.qualityIndicators.authenticity.original",
        descriptionKey: "product.qualityIndicators.authenticity.originalDescription",
    },
    LATER_COPY: {
        translationKey: "product.qualityIndicators.authenticity.later_copy",
        descriptionKey: "product.qualityIndicators.authenticity.later_copyDescription",
    },
    REPRODUCTION: {
        translationKey: "product.qualityIndicators.authenticity.reproduction",
        descriptionKey: "product.qualityIndicators.authenticity.reproductionDescription",
    },
    QUESTIONABLE: {
        translationKey: "product.qualityIndicators.authenticity.questionable",
        descriptionKey: "product.qualityIndicators.authenticity.questionableDescription",
    },
    UNKNOWN: {
        translationKey: "product.qualityIndicators.authenticity.unknown",
        descriptionKey: "product.qualityIndicators.authenticity.unknownDescription",
    },
} as const;

export function parseAuthenticity(authenticity?: string | null): Authenticity {
    const uppercasedAuthenticityData = authenticity?.toUpperCase() ?? "UNKNOWN";

    switch (uppercasedAuthenticityData) {
        case "ORIGINAL":
        case "LATER_COPY":
        case "REPRODUCTION":
        case "QUESTIONABLE":
            return uppercasedAuthenticityData;
        default:
            return "UNKNOWN";
    }
}

export function mapToBackendAuthenticity(authenticity: Authenticity): AuthenticityData {
    switch (authenticity) {
        case "ORIGINAL":
        case "LATER_COPY":
        case "REPRODUCTION":
        case "QUESTIONABLE":
        case "UNKNOWN":
            return authenticity;
    }
}
