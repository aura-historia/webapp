import type { BillingCycleData } from "@/client";

export const BILLING_CYCLES = ["MONTHLY", "YEARLY"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export function isBillingCycle(value: unknown): value is BillingCycle {
    return typeof value === "string" && (BILLING_CYCLES as readonly string[]).includes(value);
}

export function parseBillingCycle(value: unknown): BillingCycle | undefined {
    const uppercasedValue = typeof value === "string" ? value.toUpperCase() : undefined;

    switch (uppercasedValue) {
        case "MONTHLY":
        case "YEARLY":
            return uppercasedValue;
        default:
            return undefined;
    }
}

export function mapToBackendBillingCycle(cycle: BillingCycle): BillingCycleData {
    switch (cycle) {
        case "MONTHLY":
        case "YEARLY":
            return cycle;
    }
}
