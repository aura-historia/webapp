import { describe, expect, it } from "vitest";
import { isBillingCycle, mapToBackendBillingCycle, parseBillingCycle } from "../BillingCycle.ts";

describe("parseBillingCycle", () => {
    it("should parse MONTHLY", () => {
        expect(parseBillingCycle("MONTHLY")).toBe("MONTHLY");
    });

    it("should parse YEARLY", () => {
        expect(parseBillingCycle("YEARLY")).toBe("YEARLY");
    });

    it("should parse lowercase values", () => {
        expect(parseBillingCycle("monthly")).toBe("MONTHLY");
        expect(parseBillingCycle("yearly")).toBe("YEARLY");
    });

    it("should return undefined for invalid values", () => {
        expect(parseBillingCycle("weekly")).toBeUndefined();
        expect(parseBillingCycle(undefined)).toBeUndefined();
        expect(parseBillingCycle(123)).toBeUndefined();
    });
});

describe("isBillingCycle", () => {
    it("should return true only for supported cycles", () => {
        expect(isBillingCycle("MONTHLY")).toBe(true);
        expect(isBillingCycle("YEARLY")).toBe(true);
        expect(isBillingCycle("monthly")).toBe(false);
        expect(isBillingCycle("WEEKLY")).toBe(false);
    });
});

describe("billing cycle mappers", () => {
    it("should map internal cycle to backend cycle", () => {
        expect(mapToBackendBillingCycle("MONTHLY")).toBe("MONTHLY");
        expect(mapToBackendBillingCycle("YEARLY")).toBe("YEARLY");
    });
});
