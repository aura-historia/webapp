import { describe, expect, it } from "vitest";
import {
    getOAuthDenialRedirectUrl,
    isRegisteredOAuthRedirect,
} from "@/features/oauth/lib/oauthAuthorizeUrls.ts";

const client = {
    clientId: "oc_01m5avv95qeyj84c66cn827eyh",
    redirectUris: [
        "https://partner-connect.example/oauth/callback",
        "https://partner-connect.example/oauth/callback?tenant=north&return=/admin",
    ],
};

const request = {
    client_id: client.clientId,
    redirect_uri: "https://partner-connect.example/oauth/callback",
    state: "qa-browser-consent",
};

describe("isRegisteredOAuthRedirect", () => {
    it.each(client.redirectUris)("accepts the registered redirect URI %s", (redirectUri) => {
        expect(isRegisteredOAuthRedirect(client, { ...request, redirect_uri: redirectUri })).toBe(
            true,
        );
    });

    it.each([
        ["an unregistered HTTPS destination", "https://example.com/qa-oauth-callback"],
        ["a registered path on another origin", "https://example.com/oauth/callback"],
        ["a plain HTTP variant", "http://partner-connect.example/oauth/callback"],
        ["a trailing slash", "https://partner-connect.example/oauth/callback/"],
        ["a different letter case", "https://Partner-Connect.example/oauth/callback"],
        ["a path beneath the registration", "https://partner-connect.example/oauth/callback/x"],
        ["a dot segment", "https://partner-connect.example/oauth/callback/../other"],
        ["an added query", "https://partner-connect.example/oauth/callback?next=/admin"],
        [
            "registered query parameters in another order",
            "https://partner-connect.example/oauth/callback?return=/admin&tenant=north",
        ],
        ["a fragment", "https://partner-connect.example/oauth/callback#x"],
        ["an empty value", ""],
    ])("rejects %s", (_, redirectUri) => {
        expect(isRegisteredOAuthRedirect(client, { ...request, redirect_uri: redirectUri })).toBe(
            false,
        );
    });

    it("rejects a registered redirect URI when the metadata belongs to another client", () => {
        expect(isRegisteredOAuthRedirect(client, { ...request, client_id: "oc_other" })).toBe(
            false,
        );
    });
});

describe("getOAuthDenialRedirectUrl", () => {
    it("returns access_denied with the original state to the registered redirect URI", () => {
        const denied = new URL(getOAuthDenialRedirectUrl(client, request) ?? "");

        expect(`${denied.origin}${denied.pathname}`).toBe(
            "https://partner-connect.example/oauth/callback",
        );
        expect(Object.fromEntries(denied.searchParams)).toEqual({
            error: "access_denied",
            error_description: "The user denied the authorization request",
            state: "qa-browser-consent",
        });
    });

    it("keeps the query of a registered redirect URI", () => {
        const denied = new URL(
            getOAuthDenialRedirectUrl(client, {
                ...request,
                redirect_uri:
                    "https://partner-connect.example/oauth/callback?tenant=north&return=/admin",
            }) ?? "",
        );

        expect(`${denied.origin}${denied.pathname}`).toBe(
            "https://partner-connect.example/oauth/callback",
        );
        expect([...denied.searchParams]).toEqual([
            ["tenant", "north"],
            ["return", "/admin"],
            ["error", "access_denied"],
            ["error_description", "The user denied the authorization request"],
            ["state", "qa-browser-consent"],
        ]);
    });

    it("omits state when the request has none", () => {
        const denied = new URL(
            getOAuthDenialRedirectUrl(client, { ...request, state: undefined }) ?? "",
        );

        expect(denied.searchParams.has("state")).toBe(false);
        expect(denied.searchParams.get("error")).toBe("access_denied");
    });

    it.each([
        [
            "an unregistered HTTPS destination",
            { redirect_uri: "https://example.com/qa-oauth-callback" },
        ],
        [
            "an added query",
            {
                redirect_uri:
                    "https://partner-connect.example/oauth/callback?next=https://example.com",
            },
        ],
        ["metadata for another client", { client_id: "oc_other" }],
    ])("returns no destination for %s", (_, change) => {
        expect(getOAuthDenialRedirectUrl(client, { ...request, ...change })).toBeUndefined();
    });
});
