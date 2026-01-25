import type { ProvenanceData } from "@/client";

export const PROVENANCES = ["COMPLETE", "PARTIAL", "CLAIMED", "NONE", "UNKNOWN"] as const;
export type Provenance = (typeof PROVENANCES)[number];
export const PROVENANCE_TRANSLATION_CONFIG = {
    COMPLETE: {
        translationKey: "product.qualityIndicators.provenance.complete",
        descriptionKey: "product.qualityIndicators.provenance.completeDescription",
    },
    PARTIAL: {
        translationKey: "product.qualityIndicators.provenance.partial",
        descriptionKey: "product.qualityIndicators.provenance.partialDescription",
    },
    CLAIMED: {
        translationKey: "product.qualityIndicators.provenance.claimed",
        descriptionKey: "product.qualityIndicators.provenance.claimedDescription",
    },
    NONE: {
        translationKey: "product.qualityIndicators.provenance.none",
        descriptionKey: "product.qualityIndicators.provenance.noneDescription",
    },
    UNKNOWN: {
        translationKey: "product.qualityIndicators.provenance.unknown",
        descriptionKey: "product.qualityIndicators.provenance.unknownDescription",
    },
} as const;

export function parseProvenance(provenance?: string | null): Provenance {
    const uppercasedProvenanceData = provenance?.toUpperCase() ?? "UNKNOWN";

    switch (uppercasedProvenanceData) {
        case "COMPLETE":
        case "PARTIAL":
        case "CLAIMED":
        case "NONE":
            return uppercasedProvenanceData;
        default:
            return "UNKNOWN";
    }
}

export function mapToBackendProvenance(provenance: Provenance): ProvenanceData {
    switch (provenance) {
        case "COMPLETE":
        case "PARTIAL":
        case "CLAIMED":
        case "NONE":
        case "UNKNOWN":
            return provenance;
    }
}
