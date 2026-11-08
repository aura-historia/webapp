import { describe, expect, it, vi } from "vitest";
import {
    getOAuthDenialRedirectUrl,
    getOAuthIssuer,
    getSafeHttpsUrlOnHost,
    isValidatedOAuthRedirect,
} from "@/features/oauth/lib/oauthAuthorizeUrls.ts";

vi.mock("@/env.ts", () => ({
    env: { VITE_API_URL: "https://api.stage.aura-historia.com" },
}));

const client = {
    kind: "registered" as const,
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

/** A metadata document client whose consent metadata was read for a native client's callback. */
const agentClient = {
    kind: "metadataDocument" as const,
    clientId: "https://claude.ai/oauth/claude-code-client-metadata",
    redirectUri: "http://localhost:53682/callback",
};

const agentRequest = {
    client_id: agentClient.clientId,
    redirect_uri: agentClient.redirectUri,
    state: "agent-state",
};

describe("isValidatedOAuthRedirect", () => {
    it.each(client.redirectUris)("accepts the registered redirect URI %s", (redirectUri) => {
        expect(isValidatedOAuthRedirect(client, { ...request, redirect_uri: redirectUri })).toBe(
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
        expect(isValidatedOAuthRedirect(client, { ...request, redirect_uri: redirectUri })).toBe(
            false,
        );
    });

    it("rejects a registered redirect URI when the metadata belongs to another client", () => {
        expect(isValidatedOAuthRedirect(client, { ...request, client_id: "oc_other" })).toBe(false);
    });

    it("accepts exactly the callback a metadata document client's metadata was read for", () => {
        expect(isValidatedOAuthRedirect(agentClient, agentRequest)).toBe(true);
    });

    it.each([
        ["another loopback port", "http://localhost:53683/callback"],
        ["another path", "http://localhost:53682/other"],
        ["another host", "https://attacker.example/callback"],
    ])("rejects %s for a metadata document client", (_, redirectUri) => {
        expect(
            isValidatedOAuthRedirect(agentClient, { ...agentRequest, redirect_uri: redirectUri }),
        ).toBe(false);
    });

    it("never lets one kind of client stand in for the other", () => {
        expect(
            isValidatedOAuthRedirect(
                {
                    ...client,
                    clientId: agentClient.clientId,
                    redirectUris: [agentClient.redirectUri],
                },
                agentRequest,
            ),
        ).toBe(false);
        expect(
            isValidatedOAuthRedirect(
                { ...agentClient, clientId: client.clientId, redirectUri: request.redirect_uri },
                request,
            ),
        ).toBe(false);
    });
});

describe("getOAuthIssuer", () => {
    it("is the configured API origin", () => {
        expect(getOAuthIssuer()).toBe("https://api.stage.aura-historia.com");
    });
});

describe("getSafeHttpsUrlOnHost", () => {
    it("keeps an HTTPS URL on exactly the verified host", () => {
        expect(getSafeHttpsUrlOnHost("https://claude.ai/logo.png", "claude.ai")).toBe(
            "https://claude.ai/logo.png",
        );
        expect(getSafeHttpsUrlOnHost("https://CLAUDE.ai/logo.png", "Claude.AI")).toBe(
            "https://CLAUDE.ai/logo.png",
        );
    });

    it.each([
        ["another host", "https://code.visualstudio.com/logo.png", "vscode.dev"],
        ["a subdomain", "https://cdn.claude.ai/logo.png", "claude.ai"],
        ["a parent domain", "https://claude.ai/logo.png", "app.claude.ai"],
        ["another port", "https://claude.ai:8443/logo.png", "claude.ai"],
        ["plain HTTP", "http://claude.ai/logo.png", "claude.ai"],
        ["no URL", undefined, "claude.ai"],
        ["an unparseable value", "not a url", "claude.ai"],
    ])("drops %s", (_, url, host) => {
        expect(getSafeHttpsUrlOnHost(url, host)).toBeUndefined();
    });
});

describe("getOAuthDenialRedirectUrl", () => {
    it("returns access_denied with the original state and the issuer to the registered redirect URI", () => {
        const denied = new URL(getOAuthDenialRedirectUrl(client, request) ?? "");

        expect(`${denied.origin}${denied.pathname}`).toBe(
            "https://partner-connect.example/oauth/callback",
        );
        expect(Object.fromEntries(denied.searchParams)).toEqual({
            error: "access_denied",
            error_description: "The user denied the authorization request",
            state: "qa-browser-consent",
            iss: "https://api.stage.aura-historia.com",
        });
    });

    it("returns access_denied with state and issuer to a metadata document client's validated callback", () => {
        const denied = new URL(getOAuthDenialRedirectUrl(agentClient, agentRequest) ?? "");

        expect(`${denied.origin}${denied.pathname}`).toBe("http://localhost:53682/callback");
        expect(Object.fromEntries(denied.searchParams)).toEqual({
            error: "access_denied",
            error_description: "The user denied the authorization request",
            state: "agent-state",
            iss: "https://api.stage.aura-historia.com",
        });
        expect(
            getOAuthDenialRedirectUrl(agentClient, {
                ...agentRequest,
                redirect_uri: "http://localhost:1/callback",
            }),
        ).toBeUndefined();
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
            ["iss", "https://api.stage.aura-historia.com"],
        ]);
    });

    it("omits state when the request has none", () => {
        const denied = new URL(
            getOAuthDenialRedirectUrl(client, { ...request, state: undefined }) ?? "",
        );

        expect(denied.searchParams.has("state")).toBe(false);
        expect(denied.searchParams.get("error")).toBe("access_denied");
        expect(denied.searchParams.get("iss")).toBe("https://api.stage.aura-historia.com");
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
