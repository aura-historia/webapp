import { describe, expect, it } from "vitest";
import { mapToBackendUserTier, parseSubscriptionType } from "../SubscriptionType.ts";

describe("parseSubscriptionType", () => {
    it("returns free for FREE", () => {
        expect(parseSubscriptionType("FREE")).toBe("free");
    });

    it("returns pro for PRO", () => {
        expect(parseSubscriptionType("PRO")).toBe("pro");
    });

    it("returns ultimate for ULTIMATE", () => {
        expect(parseSubscriptionType("ULTIMATE")).toBe("ultimate");
    });

    it("handles lowercase input", () => {
        expect(parseSubscriptionType("pro")).toBe("pro");
    });

    it("returns free for unknown tiers", () => {
        expect(parseSubscriptionType("UNKNOWN")).toBe("free");
    });

    it("returns free for undefined", () => {
        expect(parseSubscriptionType(undefined)).toBe("free");
    });
});

describe("mapToBackendUserTier", () => {
    it("maps free to FREE", () => {
        expect(mapToBackendUserTier("free")).toBe("FREE");
    });

    it("maps pro to PRO", () => {
        expect(mapToBackendUserTier("pro")).toBe("PRO");
    });

    it("maps ultimate to ULTIMATE", () => {
        expect(mapToBackendUserTier("ultimate")).toBe("ULTIMATE");
    });

    it("returns undefined for undefined", () => {
        expect(mapToBackendUserTier(undefined)).toBeUndefined();
    });
});
