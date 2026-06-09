import { beforeEach, describe, expect, it, vi } from "vitest";
import { encodeOAuthClientBrokerState } from "@/features/oauth-client-broker/lib/oauthClientBrokerState.ts";
import { getOAuthClientRedirectBroker } from "../oauthClientRedirectBrokerHandler.ts";

const mockFetch = vi.hoisted(() => vi.fn());
const mockEnv = vi.hoisted<{
    VITE_API_URL: string | undefined;
    OAUTH_CLIENT_BROKER_CLIENT_ID: string | undefined;
    OAUTH_CLIENT_BROKER_CLIENT_SECRET: string | undefined;
}>(() => ({
    VITE_API_URL: "https://api.test.example",
    OAUTH_CLIENT_BROKER_CLIENT_ID: "01970f22-2bf0-7000-8000-000000000010",
    OAUTH_CLIENT_BROKER_CLIENT_SECRET: "broker-client-secret",
}));

vi.mock("@/env.ts", () => ({
    env: mockEnv,
}));

const codeVerifier = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
const thirdPartyExchangeCode = "01970f22-2bf0-7000-8000-000000000099";

type GetHandler = (ctx: { request: Request }) => Promise<Response>;

describe("/api/oauth/client/redirect-broker", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", mockFetch);
        mockEnv.VITE_API_URL = "https://api.test.example";
        mockEnv.OAUTH_CLIENT_BROKER_CLIENT_ID = "01970f22-2bf0-7000-8000-000000000010";
        mockEnv.OAUTH_CLIENT_BROKER_CLIENT_SECRET = "broker-client-secret";
    });

    it("exchanges the authorization code and redirects with only the third-party exchange code", async () => {
        mockFetch.mockResolvedValue(
            jsonResponse({
                access_token: "secret-access-token",
                token_type: "BEARER",
                expires_in: null,
                scope: "products:write",
                third_party_exchange_code: thirdPartyExchangeCode,
            }),
        );

        const response = await get(createBrokerRequest());

        expect(response.status).toBe(302);
        expect(response.headers.get("Cache-Control")).toBe("no-store");
        expect(response.headers.get("Pragma")).toBe("no-cache");
        expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
        expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();

        const location = getLocation(response);
        const redirectUrl = new URL(location);
        expect(redirectUrl.origin).toBe("https://merchant.example");
        expect(redirectUrl.pathname).toBe("/wp-admin/admin.php");
        expect(redirectUrl.searchParams.get("page")).toBe("aura");
        expect(redirectUrl.searchParams.get("third_party_exchange_code")).toBe(
            thirdPartyExchangeCode,
        );
        expect(redirectUrl.searchParams.get("state")).toBe("merchant-csrf-state");
        expect(location).not.toContain("secret-access-token");
        expect(location).not.toContain("access_token");

        const [tokenUrl, init] = mockFetch.mock.calls[0] as [URL, RequestInit];
        expect(tokenUrl.toString()).toBe("https://api.test.example/api/v1/oauth/token");
        expect(init.method).toBe("POST");
        expect(init.redirect).toBe("manual");
        expect(init.headers).toEqual({
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        });
        expect(init.headers).not.toHaveProperty("Authorization");

        const body = init.body as URLSearchParams;
        expect(body.get("grant_type")).toBe("authorization_code");
        expect(body.get("code")).toBe("authorization-code");
        expect(body.get("redirect_uri")).toBe(
            "https://auth.example/api/oauth/client/redirect-broker",
        );
        expect(body.get("client_id")).toBe("01970f22-2bf0-7000-8000-000000000010");
        expect(body.get("client_secret")).toBe("broker-client-secret");
        expect(body.get("code_verifier")).toBe(codeVerifier);
    });

    it("forwards additional authorization redirect query params to the final client", async () => {
        mockFetch.mockResolvedValue(
            jsonResponse({
                access_token: "secret-access-token",
                token_type: "BEARER",
                expires_in: null,
                scope: "products:write",
                third_party_exchange_code: thirdPartyExchangeCode,
            }),
        );

        const response = await get(
            createBrokerRequest({
                extraParams: [
                    ["partner_shop_id", "shop-1"],
                    ["resource", "products"],
                    ["resource", "shops"],
                    ["iss", "https://api.test.example"],
                    ["access_token", "must-not-forward"],
                    ["third_party_exchange_code", "attacker-code"],
                    ["token", "must-not-forward"],
                    ["id_token", "must-not-forward"],
                ],
            }),
        );

        const location = getLocation(response);
        const redirectUrl = new URL(location);
        expect(redirectUrl.searchParams.get("third_party_exchange_code")).toBe(
            thirdPartyExchangeCode,
        );
        expect(redirectUrl.searchParams.get("partner_shop_id")).toBe("shop-1");
        expect(redirectUrl.searchParams.getAll("resource")).toEqual(["products", "shops"]);
        expect(redirectUrl.searchParams.get("iss")).toBe("https://api.test.example");
        expect(redirectUrl.searchParams.get("state")).toBe("merchant-csrf-state");
        expect(redirectUrl.searchParams.has("code")).toBe(false);
        expect(location).not.toContain("must-not-forward");
        expect(location).not.toContain("attacker-code");
    });

    it("rejects callbacks without state before exchanging a code", async () => {
        const response = await get(
            new Request(
                "https://auth.example/api/oauth/client/redirect-broker?code=authorization-code",
            ),
        );

        expect(response.status).toBe(400);
        await expect(response.text()).resolves.toBe("Invalid OAuth broker callback.");
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("rejects invalid broker state before exchanging a code", async () => {
        const response = await get(
            new Request(
                "https://auth.example/api/oauth/client/redirect-broker?code=authorization-code&state=not-valid-state",
            ),
        );

        expect(response.status).toBe(400);
        await expect(response.text()).resolves.toBe("Invalid OAuth broker state.");
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("redirects authorization endpoint errors to the final redirect target", async () => {
        const response = await get(
            createBrokerRequest({
                code: undefined,
                error: "access_denied",
                error_description: "The user denied access.",
                error_uri: "https://docs.example/access-denied",
                extraParams: [["partner_shop_id", "shop-1"]],
            }),
        );

        expect(response.status).toBe(302);
        expect(mockFetch).not.toHaveBeenCalled();

        const redirectUrl = new URL(getLocation(response));
        expect(redirectUrl.searchParams.get("error")).toBe("access_denied");
        expect(redirectUrl.searchParams.get("error_description")).toBe("The user denied access.");
        expect(redirectUrl.searchParams.get("error_uri")).toBe(
            "https://docs.example/access-denied",
        );
        expect(redirectUrl.searchParams.get("partner_shop_id")).toBe("shop-1");
        expect(redirectUrl.searchParams.get("state")).toBe("merchant-csrf-state");
    });

    it("redirects authorization endpoint errors without optional error fields", async () => {
        const response = await get(
            createBrokerRequest({
                code: undefined,
                error: "temporarily_unavailable",
            }),
        );

        expect(response.status).toBe(302);
        expect(mockFetch).not.toHaveBeenCalled();

        const redirectUrl = new URL(getLocation(response));
        expect(redirectUrl.searchParams.get("error")).toBe("temporarily_unavailable");
        expect(redirectUrl.searchParams.has("error_description")).toBe(false);
        expect(redirectUrl.searchParams.has("error_uri")).toBe(false);
        expect(redirectUrl.searchParams.get("state")).toBe("merchant-csrf-state");
    });

    it("redirects missing authorization codes to the final target as OAuth errors", async () => {
        const response = await get(createBrokerRequest({ code: undefined }));

        expect(response.status).toBe(302);
        expect(mockFetch).not.toHaveBeenCalled();

        const redirectUrl = new URL(getLocation(response));
        expect(redirectUrl.searchParams.get("error")).toBe("invalid_request");
        expect(redirectUrl.searchParams.get("error_description")).toBe(
            "Missing OAuth authorization code.",
        );
    });

    it("returns a server error when broker credentials are not configured", async () => {
        mockEnv.OAUTH_CLIENT_BROKER_CLIENT_SECRET = undefined;

        const response = await get(createBrokerRequest());

        expect(response.status).toBe(500);
        await expect(response.text()).resolves.toBe("OAuth broker is not configured.");
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("redirects backend bad-request token failures as invalid_grant", async () => {
        mockFetch.mockResolvedValue(
            new Response('{"error":"OAUTH_AUTHORIZATION_CODE_EXPIRED"}', {
                status: 400,
                headers: { "Content-Type": "application/problem+json" },
            }),
        );

        const response = await get(createBrokerRequest());

        expect(response.status).toBe(302);
        const redirectUrl = new URL(getLocation(response));
        expect(redirectUrl.searchParams.get("error")).toBe("invalid_grant");
        expect(redirectUrl.searchParams.get("error_description")).toBe(
            "OAuth token exchange failed.",
        );
        expect(redirectUrl.searchParams.has("third_party_exchange_code")).toBe(false);
    });

    it("redirects backend unauthorized token failures as server_error", async () => {
        mockFetch.mockResolvedValue(new Response("Unauthorized", { status: 401 }));

        const response = await get(createBrokerRequest());

        const redirectUrl = new URL(getLocation(response));
        expect(redirectUrl.searchParams.get("error")).toBe("server_error");
        expect(redirectUrl.searchParams.get("error_description")).toBe(
            "OAuth token exchange failed.",
        );
    });

    it("redirects network failures as server_error without exposing backend details", async () => {
        mockFetch.mockRejectedValue(new Error("Network details"));

        const response = await get(createBrokerRequest());

        expect(response.status).toBe(302);
        const redirectUrl = new URL(getLocation(response));
        expect(redirectUrl.searchParams.get("error")).toBe("server_error");
        expect(redirectUrl.searchParams.get("error_description")).toBe(
            "OAuth token exchange request failed.",
        );
        expect(getLocation(response)).not.toContain("Network details");
    });

    it("redirects invalid token JSON responses as server_error", async () => {
        mockFetch.mockResolvedValue(
            new Response("not-json", {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }),
        );

        const response = await get(createBrokerRequest());

        const redirectUrl = new URL(getLocation(response));
        expect(redirectUrl.searchParams.get("error")).toBe("server_error");
        expect(redirectUrl.searchParams.get("error_description")).toBe(
            "OAuth token response was invalid.",
        );
    });

    it("redirects non-object token JSON responses as server_error", async () => {
        mockFetch.mockResolvedValue(jsonResponse(null));

        const response = await get(createBrokerRequest());

        const redirectUrl = new URL(getLocation(response));
        expect(redirectUrl.searchParams.get("error")).toBe("server_error");
        expect(redirectUrl.searchParams.get("error_description")).toBe(
            "OAuth token response did not include a third-party exchange code.",
        );
    });

    it("redirects successful token responses without an exchange code as server_error", async () => {
        mockFetch.mockResolvedValue(
            jsonResponse({
                access_token: "secret-access-token",
                token_type: "BEARER",
                expires_in: null,
                scope: "products:write",
            }),
        );

        const response = await get(createBrokerRequest());

        const redirectUrl = new URL(getLocation(response));
        expect(redirectUrl.searchParams.get("error")).toBe("server_error");
        expect(redirectUrl.searchParams.get("error_description")).toBe(
            "OAuth token response did not include a third-party exchange code.",
        );
        expect(getLocation(response)).not.toContain("secret-access-token");
    });

    it("uses the default API URL when no API URL is configured", async () => {
        mockEnv.VITE_API_URL = undefined;
        mockFetch.mockResolvedValue(
            jsonResponse({
                access_token: "secret-access-token",
                token_type: "BEARER",
                expires_in: null,
                scope: "products:write",
                third_party_exchange_code: thirdPartyExchangeCode,
            }),
        );

        await get(createBrokerRequest());

        const [tokenUrl] = mockFetch.mock.calls[0] as [URL, RequestInit];
        expect(tokenUrl.toString()).toBe("https://api.dev.aura-historia.com/api/v1/oauth/token");
    });
});

function get(
    request: Request,
    handler: GetHandler = getOAuthClientRedirectBroker,
): Promise<Response> {
    return handler({ request });
}

function createBrokerRequest(
    params: {
        readonly code?: string;
        readonly state?: string;
        readonly error?: string;
        readonly error_description?: string;
        readonly error_uri?: string;
        readonly extraParams?: ReadonlyArray<readonly [string, string]>;
    } = {},
): Request {
    const url = new URL("https://auth.example/api/oauth/client/redirect-broker");
    const code =
        params.code === undefined && !("code" in params) ? "authorization-code" : params.code;
    const state =
        params.state ??
        encodeOAuthClientBrokerState({
            redirectUri: "https://merchant.example/wp-admin/admin.php?page=aura",
            codeVerifier,
            clientState: "merchant-csrf-state",
        });

    if (code !== undefined) {
        url.searchParams.set("code", code);
    }

    url.searchParams.set("state", state);

    if (params.error !== undefined) {
        url.searchParams.set("error", params.error);
    }

    if (params.error_description !== undefined) {
        url.searchParams.set("error_description", params.error_description);
    }

    if (params.error_uri !== undefined) {
        url.searchParams.set("error_uri", params.error_uri);
    }

    for (const [key, value] of params.extraParams ?? []) {
        url.searchParams.append(key, value);
    }

    return new Request(url);
}

function jsonResponse(body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

function getLocation(response: Response): string {
    const location = response.headers.get("Location");
    if (!location) {
        throw new Error("Missing redirect location");
    }
    return location;
}
