import type { BillingPlanData } from "@/client";

export const BILLING_PLANS = ["PRO", "ULTIMATE"] as const;
export type BillingPlan = (typeof BILLING_PLANS)[number];

export function isBillingPlan(value: unknown): value is BillingPlan {
    return typeof value === "string" && (BILLING_PLANS as readonly string[]).includes(value);
}

export function parseBillingPlan(value: unknown): BillingPlan | undefined {
    const uppercasedValue = typeof value === "string" ? value.toUpperCase() : undefined;

    switch (uppercasedValue) {
        case "PRO":
        case "ULTIMATE":
            return uppercasedValue;
        default:
            return undefined;
    }
}

export function mapToBackendBillingPlan(plan: BillingPlan): BillingPlanData {
    // This is kept to de-couple internal and backend representations
    switch (plan) {
        case "PRO":
        case "ULTIMATE":
            return plan;
    }
}
