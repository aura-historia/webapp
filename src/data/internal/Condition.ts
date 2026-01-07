import type { ConditionData } from "@/client";

export type Condition = "EXCELLENT" | "GREAT" | "GOOD" | "FAIR" | "POOR" | "UNKNOWN";

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
