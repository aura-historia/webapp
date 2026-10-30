import { describe, expect, it } from "vitest";
import { ACCESS_TOKEN_SCOPES } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import {
    createFederatedAuthState,
    isFederatedRedirectPathTooLong,
    parseFederatedAuthState,
} from "@/features/authentication/lib/federatedAuthState.ts";

/** A consent page path as the login redirect carries it, with every scope and an MCP resource. */
function oauthAuthorizePath(state: string): string {
    const search = new URLSearchParams({
        response_type: "code",
        client_id: "oc_7b0gwc1x49e0mvbt3tfexfqgb5",
        redirect_uri: "https://client.example/api/oauth/callback",
        scope: ACCESS_TOKEN_SCOPES.join(" "),
        state,
        resource: "https://mcp.aura-historia.com/v1",
        code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
        code_challenge_method: "S256",
        requires_listing_source_id: "true",
    });
    return `/en/oauth/authorize?${search}`;
}

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
        ["a short MCP state", "x".repeat(43)],
        ["a 1,000-character signed client state", "e".repeat(1000)],
    ])("carries an OAuth authorization request with %s unchanged", (_, oauthState) => {
        const redirectPath = oauthAuthorizePath(oauthState);

        expect(isFederatedRedirectPathTooLong(redirectPath)).toBe(false);
        expect(
            parseFederatedAuthState(
                createFederatedAuthState({ intent: "sign-in", locale: "en", redirectPath }),
            )?.redirectPath,
        ).toBe(redirectPath);
    });

    it("carries a WooCommerce broker consent page, which names only its transaction", () => {
        const redirectPath =
            "/en/oauth/authorize?transaction_id=q2Jv7Wl3N1m8b0bTt0lpbq3c7S8Dzvq7m3x8W4cnD8I";

        expect(
            parseFederatedAuthState(
                createFederatedAuthState({ intent: "sign-in", locale: "en", redirectPath }),
            )?.redirectPath,
        ).toBe(redirectPath);
    });

    it.each([
        ["exceeds the path limit", oauthAuthorizePath("e".repeat(1400))],
        [
            "exceeds the state limit once JSON-escaped",
            `/en/oauth/authorize?state=${'"'.repeat(2020)}`,
        ],
    ])("reports a same-origin destination that %s instead of carrying it", (_, redirectPath) => {
        expect(isFederatedRedirectPathTooLong(redirectPath)).toBe(true);
        const state = createFederatedAuthState({ intent: "sign-in", locale: "en", redirectPath });
        expect(state.length).toBeLessThanOrEqual(4096);
        expect(parseFederatedAuthState(state)).toEqual({
            version: 1,
            intent: "sign-in",
            locale: "en",
        });
    });

    it.each([
        undefined,
        `//example.com/${"x".repeat(3000)}`,
        `/en/login?redirect=${"x".repeat(3000)}`,
    ])("keeps dropping a missing or unsafe destination of any length: %s", (redirectPath) => {
        expect(isFederatedRedirectPathTooLong(redirectPath)).toBe(false);
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
