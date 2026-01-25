import type { ConditionData } from "@/client";

export const CONDITIONS = ["EXCELLENT", "GREAT", "GOOD", "FAIR", "POOR", "UNKNOWN"] as const;
export type Condition = (typeof CONDITIONS)[number];
export const CONDITION_TRANSLATION_CONFIG = {
    EXCELLENT: {
        translationKey: "product.qualityIndicators.condition.excellent",
        descriptionKey: "product.qualityIndicators.condition.excellentDescription",
    },
    GREAT: {
        translationKey: "product.qualityIndicators.condition.great",
        descriptionKey: "product.qualityIndicators.condition.greatDescription",
    },
    GOOD: {
        translationKey: "product.qualityIndicators.condition.good",
        descriptionKey: "product.qualityIndicators.condition.goodDescription",
    },
    FAIR: {
        translationKey: "product.qualityIndicators.condition.fair",
        descriptionKey: "product.qualityIndicators.condition.fairDescription",
    },
    POOR: {
        translationKey: "product.qualityIndicators.condition.poor",
        descriptionKey: "product.qualityIndicators.condition.poorDescription",
    },
    UNKNOWN: {
        translationKey: "product.qualityIndicators.condition.unknown",
        descriptionKey: "product.qualityIndicators.condition.unknownDescription",
    },
} as const;

export function parseCondition(condition?: string | null): Condition {
    const uppercasedConditionData = condition?.toUpperCase() ?? "UNKNOWN";

    switch (uppercasedConditionData) {
        case "EXCELLENT":
        case "GREAT":
        case "GOOD":
        case "FAIR":
        case "POOR":
            return uppercasedConditionData;
        default:
            return "UNKNOWN";
    }
}

export function mapToBackendCondition(condition: Condition): ConditionData {
    switch (condition) {
        case "EXCELLENT":
        case "GREAT":
        case "GOOD":
        case "FAIR":
        case "POOR":
        case "UNKNOWN":
            return condition;
    }
}
