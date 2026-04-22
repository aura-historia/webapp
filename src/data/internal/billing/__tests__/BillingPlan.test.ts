import { describe, expect, it } from "vitest";
import { isBillingPlan, mapToBackendBillingPlan, parseBillingPlan } from "../BillingPlan.ts";

describe("parseBillingPlan", () => {
    it("should parse PRO", () => {
        expect(parseBillingPlan("PRO")).toBe("PRO");
    });

    it("should parse ULTIMATE", () => {
        expect(parseBillingPlan("ULTIMATE")).toBe("ULTIMATE");
    });

    it("should parse lowercase values", () => {
        expect(parseBillingPlan("pro")).toBe("PRO");
        expect(parseBillingPlan("ultimate")).toBe("ULTIMATE");
    });

    it("should return undefined for invalid values", () => {
        expect(parseBillingPlan("free")).toBeUndefined();
        expect(parseBillingPlan(undefined)).toBeUndefined();
        expect(parseBillingPlan(123)).toBeUndefined();
    });
});

describe("isBillingPlan", () => {
    it("should return true only for supported plans", () => {
        expect(isBillingPlan("PRO")).toBe(true);
        expect(isBillingPlan("ULTIMATE")).toBe(true);
        expect(isBillingPlan("pro")).toBe(false);
        expect(isBillingPlan("FREE")).toBe(false);
    });
});

describe("billing plan mappers", () => {
    it("should map internal plan to backend plan", () => {
        expect(mapToBackendBillingPlan("PRO")).toBe("PRO");
        expect(mapToBackendBillingPlan("ULTIMATE")).toBe("ULTIMATE");
    });
});
