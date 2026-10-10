import { describe, expect, it } from "vitest";
import { mapToBackendUserAccountPatch, mapToInternalUserAccount } from "../UserAccountData.ts";
import type { OwnUserAccountData } from "@/client";
import type { UserAccountPatchData } from "../UserAccountData.ts";

describe("mapToInternalUserAccount", () => {
    it("preserves nullable preferences and billing identity without audit fields", () => {
        const account = mapToInternalUserAccount({
            userId: "user-1",
            email: "user@example.com",
            tier: "FREE",
            role: "USER",
            firstName: null,
            lastName: null,
            language: null,
            currency: null,
            measurementUnit: null,
            stripeCustomerId: null,
            showUnassessedOrSensitiveContent: false,
        });
        expect(account).toMatchObject({
            firstName: null,
            lastName: null,
            language: null,
            currency: null,
            unitSystem: null,
            stripeCustomerId: null,
            showUnassessedOrSensitiveContent: false,
        });
        expect(account).not.toHaveProperty("created");
        expect(account).not.toHaveProperty("updated");
        expect(account).not.toHaveProperty("structuredAddress");
        expect(account).not.toHaveProperty("geoAddress");
    });
    it("maps measurement units and preserves a Stripe customer identifier", () => {
        expect(
            mapToInternalUserAccount({
                userId: "u",
                email: "u@example.com",
                tier: "PRO",
                role: "USER",
                measurementUnit: "IMPERIAL",
                stripeCustomerId: "cus_123",
                showUnassessedOrSensitiveContent: true,
            }),
        ).toMatchObject({ unitSystem: "IMPERIAL", stripeCustomerId: "cus_123" });
    });
    it.each(["KRW", "SEK", "ZAR", "JPY", "THB"] as const)(
        "maps the backend currency %s unchanged",
        (currency) => {
            expect(
                mapToInternalUserAccount({
                    userId: "u",
                    email: "u@example.com",
                    tier: "FREE",
                    role: "USER",
                    currency,
                    showUnassessedOrSensitiveContent: false,
                }).currency,
            ).toBe(currency);
        },
    );
    it("keeps an absent currency absent instead of defaulting it", () => {
        expect(
            mapToInternalUserAccount({
                userId: "u",
                email: "u@example.com",
                tier: "FREE",
                role: "USER",
                showUnassessedOrSensitiveContent: false,
            }).currency,
        ).toBeUndefined();
    });
    it("maps API tier to internal subscriptionType", () => {
        const apiData: OwnUserAccountData = {
            userId: "user-1",
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            language: "en",
            currency: "EUR",
            showUnassessedOrSensitiveContent: true,
            tier: "PRO",
            role: "USER",
        };

        const mappedData = mapToInternalUserAccount(apiData);

        expect(mappedData.subscriptionType).toBe("pro");
    });

    it("falls back to free for unknown tiers", () => {
        const apiData: OwnUserAccountData = {
            userId: "user-1",
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            language: "en",
            currency: "EUR",
            showUnassessedOrSensitiveContent: true,
            tier: "INVALID" as unknown as OwnUserAccountData["tier"],
            role: "USER",
        };

        const mappedData = mapToInternalUserAccount(apiData);

        expect(mappedData.subscriptionType).toBe("free");
    });
});

describe("mapToBackendUserAccountPatch", () => {
    it("omits unspecified fields including content visibility", () => {
        expect(mapToBackendUserAccountPatch({})).toEqual({});
        expect(mapToBackendUserAccountPatch({ firstName: "Jane" })).toEqual({ firstName: "Jane" });
        expect(
            mapToBackendUserAccountPatch({ showUnassessedOrSensitiveContent: undefined }),
        ).toEqual({});
    });
    it.each([true, false])("preserves explicit visibility %s", (visibility) => {
        expect(
            mapToBackendUserAccountPatch({ showUnassessedOrSensitiveContent: visibility }),
        ).toEqual({ showUnassessedOrSensitiveContent: visibility });
    });
    it("rejects null visibility before making an API request", () => {
        expect(() =>
            mapToBackendUserAccountPatch({
                showUnassessedOrSensitiveContent: null,
            } as unknown as UserAccountPatchData),
        ).toThrow(TypeError);
    });
    it("preserves explicit null for clearable profile fields", () => {
        expect(
            mapToBackendUserAccountPatch({
                firstName: null,
                lastName: null,
                language: null,
                currency: null,
                unitSystem: null,
            }),
        ).toEqual({
            firstName: null,
            lastName: null,
            language: null,
            currency: null,
            measurementUnit: null,
        });
    });
    it.each(["KRW", "SEK", "ZAR", "INR", "MXN"] as const)(
        "sends the new currency %s unchanged",
        (currency) => {
            expect(mapToBackendUserAccountPatch({ currency })).toEqual({ currency });
        },
    );
    it("omits an undefined currency from the patch", () => {
        expect(mapToBackendUserAccountPatch({ currency: undefined })).toEqual({});
    });
    it("keeps existing patch mapping behavior", () => {
        const patchData = mapToBackendUserAccountPatch({
            firstName: "Jane",
            lastName: "Doe",
            language: "de",
            currency: "USD",
            unitSystem: "IMPERIAL",
            showUnassessedOrSensitiveContent: false,
        });

        expect(patchData).toEqual({
            firstName: "Jane",
            lastName: "Doe",
            language: "de",
            currency: "USD",
            measurementUnit: "IMPERIAL",
            showUnassessedOrSensitiveContent: false,
        });
    });
});
