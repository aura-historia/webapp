import { describe, expect, it } from "vitest";
import { mapToInternalUserAccount } from "../UserAccountData.ts";
import { parseUserRole } from "../UserRole.ts";
import type { GetUserAccountData } from "@/client";

describe("UserRole", () => {
    it("parses ADMIN role", () => {
        expect(parseUserRole("ADMIN")).toBe("ADMIN");
    });

    it("parses USER role", () => {
        expect(parseUserRole("USER")).toBe("USER");
    });

    it("falls back to USER for unknown values", () => {
        expect(parseUserRole(undefined)).toBe("USER");
        expect(parseUserRole("ROOT")).toBe("USER");
    });
});

describe("mapToInternalUserAccount", () => {
    const baseApi: GetUserAccountData = {
        userId: "u-1",
        email: "user@example.com",
        prohibitedContentConsent: false,
        tier: "FREE",
        role: "USER",
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-02T00:00:00Z",
    };

    it("includes the role in the mapped result", () => {
        const result = mapToInternalUserAccount({ ...baseApi, role: "ADMIN" });
        expect(result.role).toBe("ADMIN");
    });

    it("defaults to USER when API role is missing or unknown", () => {
        const result = mapToInternalUserAccount({
            ...baseApi,
            role: "USER",
        });
        expect(result.role).toBe("USER");
    });
});
