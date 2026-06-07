import { describe, expect, it } from "vitest";
import { parseResourceState } from "../ResourceState.ts";

describe("parseResourceState", () => {
    it("returns ACTIVE for 'ACTIVE'", () => {
        expect(parseResourceState("ACTIVE")).toBe("ACTIVE");
    });

    it("returns INACTIVE_BY_USER for 'INACTIVE_BY_USER'", () => {
        expect(parseResourceState("INACTIVE_BY_USER")).toBe("INACTIVE_BY_USER");
    });

    it("returns INACTIVE_BY_RESTRICTED_PLAN for 'INACTIVE_BY_RESTRICTED_PLAN'", () => {
        expect(parseResourceState("INACTIVE_BY_RESTRICTED_PLAN")).toBe(
            "INACTIVE_BY_RESTRICTED_PLAN",
        );
    });

    it("returns ACTIVE for undefined", () => {
        expect(parseResourceState(undefined)).toBe("ACTIVE");
    });

    it("returns ACTIVE for null", () => {
        expect(parseResourceState(null)).toBe("ACTIVE");
    });

    it("returns ACTIVE for unknown string", () => {
        expect(parseResourceState("UNKNOWN")).toBe("ACTIVE");
    });
});
