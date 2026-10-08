import { describe, expect, it } from "vitest";
import {
    createFederatedAuthState,
    parseFederatedAuthState,
} from "@/features/authentication/lib/federatedAuthState.ts";

describe("federated auth state", () => {
    it("serializes and validates the sign-in intent and same-origin destination", () => {
        const state = createFederatedAuthState({
            intent: "sign-in",
            locale: "fr",
            redirectPath: "/de/me/watchlist?sort=recent#saved",
        });

        expect(parseFederatedAuthState(state)).toEqual({
            version: 1,
            intent: "sign-in",
            locale: "fr",
            redirectPath: "/de/me/watchlist?sort=recent#saved",
        });
    });

    it("omits an unsafe destination when creating state", () => {
        const state = createFederatedAuthState({
            intent: "sign-up",
            locale: "de",
            redirectPath: "//example.com/account",
        });

        expect(parseFederatedAuthState(state)).toEqual({
            version: 1,
            intent: "sign-up",
            locale: "de",
        });
    });

    it.each([
        "not-json",
        JSON.stringify({ version: 2, intent: "sign-in", locale: "en" }),
        JSON.stringify({ version: 1, intent: "login", locale: "en" }),
        JSON.stringify({ version: 1, intent: "sign-in", locale: "xx" }),
        JSON.stringify({
            version: 1,
            intent: "sign-in",
            locale: "en",
            redirectPath: "https://example.com/private",
        }),
        JSON.stringify({
            version: 1,
            intent: "sign-in",
            locale: "en",
            email: "private@example.com",
        }),
        "x".repeat(4097),
    ])("rejects invalid or sensitive state: %s", (state) => {
        expect(parseFederatedAuthState(state)).toBeNull();
    });

    it("rejects redirect loops back to the login screen", () => {
        expect(
            parseFederatedAuthState(
                JSON.stringify({
                    version: 1,
                    intent: "sign-in",
                    locale: "en",
                    redirectPath: "/fr/login?mode=sign-up",
                }),
            ),
        ).toBeNull();
    });
});
