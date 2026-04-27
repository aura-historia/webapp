import { describe, expect, it } from "vitest";
import { mapToAdminUser, mapToAdminUserPatch, parseUserTier } from "../AdminUser.ts";
import type { GetUserAccountData } from "@/client";

describe("AdminUser", () => {
    it("maps admin users from the API response", () => {
        const apiUser: GetUserAccountData = {
            userId: "user-1",
            email: "ada@example.com",
            firstName: "Ada",
            lastName: "Lovelace",
            language: "en",
            currency: "EUR",
            prohibitedContentConsent: true,
            tier: "PRO",
            role: "ADMIN",
            stripeCustomerId: "cus_123",
            created: "2024-01-01T00:00:00Z",
            updated: "2024-01-02T00:00:00Z",
        };

        expect(mapToAdminUser(apiUser)).toEqual({
            userId: "user-1",
            email: "ada@example.com",
            firstName: "Ada",
            lastName: "Lovelace",
            language: "en",
            currency: "EUR",
            prohibitedContentConsent: true,
            tier: "PRO",
            role: "ADMIN",
            stripeCustomerId: "cus_123",
            created: new Date("2024-01-01T00:00:00Z"),
            updated: new Date("2024-01-02T00:00:00Z"),
        });
    });

    it("maps admin user patches to backend payloads", () => {
        expect(
            mapToAdminUserPatch({
                firstName: "Ada",
                lastName: null,
                language: "en",
                currency: null,
                prohibitedContentConsent: true,
                tier: "ULTIMATE",
                role: "ADMIN",
                stripeCustomerId: "cus_456",
            }),
        ).toEqual({
            firstName: "Ada",
            lastName: null,
            language: "en",
            currency: null,
            prohibitedContentConsent: true,
            tier: "ULTIMATE",
            role: "ADMIN",
            stripeCustomerId: "cus_456",
        });
    });

    it("falls back to FREE when an unknown tier is encountered", () => {
        expect(parseUserTier("SOMETHING_ELSE")).toBe("FREE");
    });
});
