import { pricingCtaFor } from "@/features/billing/lib/pricingCta.ts";

describe("pricingCtaFor", () => {
    it("offers the defaults when the current plan is unknown", () => {
        expect(pricingCtaFor("free")).toBe("get-started");
        expect(pricingCtaFor("pro")).toBe("subscribe");
        expect(pricingCtaFor("ultimate")).toBe("subscribe");
    });

    it.each([
        ["free", "free", "current"],
        ["free", "pro", "upgrade"],
        ["free", "ultimate", "upgrade"],
        ["pro", "free", "switch"],
        ["pro", "pro", "current"],
        ["pro", "ultimate", "upgrade"],
        ["ultimate", "free", "switch"],
        ["ultimate", "pro", "switch"],
        ["ultimate", "ultimate", "current"],
    ] as const)("on %s, the %s card offers %s", (currentPlan, tier, expected) => {
        expect(pricingCtaFor(tier, currentPlan)).toBe(expected);
    });
});
