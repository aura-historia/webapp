import { describe, expect, it } from "vitest";
import { mapToBackendUserAccountPatch, mapToInternalUserAccount } from "../UserAccountData.ts";
import type { GetUserAccountData } from "@/client";

describe("mapToInternalUserAccount", () => {
    it("maps API tier to internal subscriptionType", () => {
        const apiData: GetUserAccountData = {
            userId: "user-1",
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            language: "en",
            currency: "EUR",
            prohibitedContentConsent: true,
            tier: "PRO",
            role: "USER",
            created: "2024-01-01T00:00:00.000Z",
            updated: "2024-01-02T00:00:00.000Z",
        };

        const mappedData = mapToInternalUserAccount(apiData);

        expect(mappedData.subscriptionType).toBe("pro");
    });

    it("falls back to free for unknown tiers", () => {
        const apiData: GetUserAccountData = {
            userId: "user-1",
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            language: "en",
            currency: "EUR",
            prohibitedContentConsent: true,
            tier: "INVALID" as unknown as GetUserAccountData["tier"],
            role: "USER",
            created: "2024-01-01T00:00:00.000Z",
            updated: "2024-01-02T00:00:00.000Z",
        };

        const mappedData = mapToInternalUserAccount(apiData);

        expect(mappedData.subscriptionType).toBe("free");
    });
});

describe("mapToBackendUserAccountPatch", () => {
    it("keeps existing patch mapping behavior", () => {
        const patchData = mapToBackendUserAccountPatch({
            firstName: "Jane",
            lastName: "Doe",
            language: "de",
            currency: "USD",
            prohibitedContentConsent: false,
        });

        expect(patchData).toEqual({
            firstName: "Jane",
            lastName: "Doe",
            language: "de",
            currency: "USD",
            prohibitedContentConsent: false,
        });
    });
});
