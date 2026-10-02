import { beforeEach, describe, expect, it, vi } from "vitest";
import { postOAuthAuthorizeApprove } from "../oauthAuthorizeApproveHandler.ts";
import { OAuthConsentMetadataError } from "../oauthConsentMetadata.ts";
import { encodeOAuthClientBrokerState } from "@/features/oauth-client-broker/lib/oauthClientBrokerState.ts";
import {
    getS256Challenge,
    verifyOAuthClientBrokerState,
} from "@/features/oauth-client-broker/lib/signedOAuthClientBrokerState.ts";

const mockGetServerAuthToken = vi.hoisted(() => vi.fn());
const mockFetch = vi.hoisted(() => vi.fn());
const mockConsent = vi.hoisted(() => vi.fn());
const mockSources = vi.hoisted(() => vi.fn());

vi.mock("../oauthConsentMetadata.ts", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../oauthConsentMetadata.ts")>()),
    getOAuthConsentClient: mockConsent,
}));
vi.mock("@/client", () => ({ getMyListingSources: mockSources }));

vi.mock("@/env.ts", () => ({
    env: {
        VITE_API_URL: "https://api.test.example",
        OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_ID: "01970f22-2bf0-7000-8000-000000000010",
        OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_SECRET: "broker-secret",
    },
}));

vi.mock("@/lib/server/amplify.server.ts", () => ({
    getServerAuthToken: mockGetServerAuthToken,
}));

type PostHandler = (ctx: { request: Request }) => Promise<Response>;

const defaultFormFields = {
    lng: "de",
    response_type: "code",
    client_id: "01970f22-2bf0-7000-8000-000000000010",
    redirect_uri: "https://client.example/callback",
    scope: "product-listings:write watchlist:read",
    state: "csrf-state-123",
    code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    code_challenge_method: "S256",
};

describe("/api/oauth/authorize/approve", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", mockFetch);
        mockGetServerAuthToken.mockResolvedValue("access-token");
        mockConsent.mockResolvedValue({
            clientId: defaultFormFields.client_id,
            redirectUris: [defaultFormFields.redirect_uri],
            scopes: ["product-listings:write", "watchlist:read"],
        });
        mockSources.mockResolvedValue({
            data: [{ listingSourceId: "shop-1", name: "Source", listingSourceSlugId: "source" }],
        });
    });

    it("rejects invalid form submissions", async () => {
        const response = await post(createRequest({ client_id: "missing-required-fields" }));

        expect(response.status).toBe(400);
        await expect(response.text()).resolves.toBe("Invalid OAuth authorization request.");
        expect(mockGetServerAuthToken).not.toHaveBeenCalled();
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("blocks approval when trustworthy ordinary-user metadata is unavailable", async () => {
        mockConsent.mockRejectedValue(new Error("No consent contract"));
        const response = await post(createRequest(defaultFormFields));
        expect(response.status).toBe(503);
        expect(response.headers.get("Cache-Control")).toBe("no-store");
        expect(mockFetch).not.toHaveBeenCalled();
        expect(mockSources).not.toHaveBeenCalled();
        expect(mockConsent).toHaveBeenCalledWith(defaultFormFields.client_id, "access-token");
    });

    it.each([400, 401, 403, 404])("stops approval on metadata HTTP %s", async (status) => {
        mockConsent.mockRejectedValue(new OAuthConsentMetadataError(status));
        const response = await post(createRequest(defaultFormFields));
        expect(response.status).toBe(status);
        expect(response.headers.get("Cache-Control")).toBe("no-store");
        expect(mockFetch).not.toHaveBeenCalled();
        expect(mockSources).not.toHaveBeenCalled();
    });

    it("rejects a cross-origin approval before reading credentials", async () => {
        const request = createRequest(defaultFormFields);
        request.headers.set("Origin", "https://attacker.example");
        const response = await post(request);
        expect(response.status).toBe(403);
        expect(mockGetServerAuthToken).not.toHaveBeenCalled();
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("signs WooCommerce source selection after grant and PKCE checks without changing authorize parameters", async () => {
        const redirectUri = "https://auth.example/api/oauth/client/redirect-broker/woocommerce";
        const verifier = "x".repeat(43);
        const challenge = await getS256Challenge(verifier);
        mockConsent.mockResolvedValue({
            clientId: defaultFormFields.client_id,
            redirectUris: [redirectUri],
            scopes: ["product-listings:write"],
        });
        mockFetch.mockImplementation(async (input: string) => {
            const backend = new URL(input);
            const callback = new URL(redirectUri);
            callback.searchParams.set("code", "auth-code");
            callback.searchParams.set("state", backend.searchParams.get("state") ?? "");
            return new Response(null, { status: 302, headers: { Location: callback.toString() } });
        });
        const response = await post(
            createRequest({
                ...defaultFormFields,
                redirect_uri: redirectUri,
                scope: "product-listings:write",
                code_challenge: challenge,
                listing_source_id: "shop-1",
                state: encodeOAuthClientBrokerState({
                    redirectUri: "https://merchant.example/callback",
                    codeVerifier: verifier,
                    clientState: "csrf",
                }),
            }),
        );
        expect(response.status).toBe(302);
        const callback = new URL(response.headers.get("Location") ?? "");
        const signed = callback.searchParams.get("state") ?? "";
        expect(
            await verifyOAuthClientBrokerState(
                signed,
                "broker-secret",
                `${defaultFormFields.client_id}\n${redirectUri}`,
            ),
        ).toEqual({
            redirectUri: "https://merchant.example/callback",
            codeVerifier: verifier,
            clientState: "csrf",
            listingSourceId: "shop-1",
        });
        const backend = new URL(mockFetch.mock.calls[0][0]);
        expect(backend.searchParams.get("redirect_uri")).toBe(redirectUri);
        expect(backend.searchParams.get("code_challenge")).toBe(challenge);
        expect(backend.searchParams.has("listing_source_id")).toBe(false);
        expect(response.headers.get("Location")).not.toContain("broker-secret");
        expect(mockSources).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: { Authorization: "Bearer access-token" },
                cache: "no-store",
            }),
        );
    });

    it("rejects unregistered redirects and mismatched returned state", async () => {
        expect(
            (
                await post(
                    createRequest({
                        ...defaultFormFields,
                        redirect_uri: "https://attacker.example",
                    }),
                )
            ).status,
        ).toBe(400);
        expect(mockFetch).not.toHaveBeenCalled();
        mockFetch.mockResolvedValue(
            new Response(null, {
                status: 302,
                headers: { Location: "https://client.example/callback?code=code&state=attacker" },
            }),
        );
        expect((await post(createRequest(defaultFormFields))).status).toBe(502);
    });

    it("signs a WooCommerce denial without selecting a source or issuing an authorization code", async () => {
        const redirectUri = "https://auth.example/api/oauth/client/redirect-broker/woocommerce";
        const verifier = "x".repeat(43);
        mockConsent.mockResolvedValue({
            clientId: defaultFormFields.client_id,
            redirectUris: [redirectUri],
            scopes: ["product-listings:write", "watchlist:read"],
        });
        const response = await post(
            createRequest({
                ...defaultFormFields,
                decision: "deny",
                redirect_uri: redirectUri,
                code_challenge: await getS256Challenge(verifier),
                state: encodeOAuthClientBrokerState({
                    redirectUri: "https://merchant.example/callback",
                    codeVerifier: verifier,
                    clientState: "csrf",
                    listingSourceId: "ls_hint",
                }),
            }),
        );
        expect(response.status).toBe(302);
        const callback = new URL(response.headers.get("Location") ?? "");
        expect(callback.searchParams.get("error")).toBe("access_denied");
        expect(
            await verifyOAuthClientBrokerState(
                callback.searchParams.get("state") ?? "",
                "broker-secret",
                `${defaultFormFields.client_id}\n${redirectUri}`,
            ),
        ).toEqual({
            redirectUri: "https://merchant.example/callback",
            codeVerifier: verifier,
            clientState: "csrf",
        });
        expect(mockSources).not.toHaveBeenCalled();
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("rejects a missing source or mismatched PKCE verifier for WooCommerce before authorization", async () => {
        const redirectUri = "https://auth.example/api/oauth/client/redirect-broker/woocommerce";
        mockConsent.mockResolvedValue({
            clientId: defaultFormFields.client_id,
            redirectUris: [redirectUri],
            scopes: ["product-listings:write", "watchlist:read"],
        });
        const fields = {
            ...defaultFormFields,
            redirect_uri: redirectUri,
            state: encodeOAuthClientBrokerState({
                redirectUri: "https://merchant.example/callback",
                codeVerifier: "x".repeat(43),
            }),
        };
        expect((await post(createRequest(fields))).status).toBe(400);
        expect((await post(createRequest({ ...fields, listing_source_id: "shop-1" }))).status).toBe(
            400,
        );
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("rejects revoked source access before authorization", async () => {
        mockSources.mockResolvedValue({ data: [] });
        const response = await post(
            createRequest({ ...defaultFormFields, listing_source_id: "ls_revoked" }),
        );
        expect(response.status).toBe(403);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("validates redirects and scopes before denying without issuing a code", async () => {
        const response = await post(createRequest({ ...defaultFormFields, decision: "deny" }));
        expect(response.status).toBe(302);
        const location = new URL(response.headers.get("Location") ?? "");
        expect(location.searchParams.get("error")).toBe("access_denied");
        expect(location.searchParams.get("state")).toBe(defaultFormFields.state);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("rejects unsupported scopes instead of substituting permissions", async () => {
        const response = await post(
            createRequest({ ...defaultFormFields, scope: "products:write" }),
        );
        expect(response.status).toBe(400);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("redirects unauthenticated users back through login", async () => {
        mockGetServerAuthToken.mockResolvedValue(undefined);

        const response = await post(createRequest(defaultFormFields));

        expect(response.status).toBe(302);
        const location = response.headers.get("Location");
        if (!location) {
            throw new Error("Missing redirect location");
        }

        const loginUrl = new URL(location);
        expect(loginUrl.origin).toBe("https://auth.example");
        expect(loginUrl.pathname).toBe("/de/login");

        const redirectParam = loginUrl.searchParams.get("redirect");
        if (!redirectParam) {
            throw new Error("Missing login redirect parameter");
        }
        const redirectUrl = new URL(redirectParam, loginUrl.origin);
        expect(redirectUrl.pathname).toBe("/de/oauth/authorize");
        expect(redirectUrl.searchParams.get("client_id")).toBe(defaultFormFields.client_id);
        expect(redirectUrl.searchParams.get("redirect_uri")).toBe(defaultFormFields.redirect_uri);
        expect(redirectUrl.searchParams.get("scope")).toBe(defaultFormFields.scope);
        expect(redirectUrl.searchParams.get("state")).toBe(defaultFormFields.state);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("converts a backend authorization redirect into a browser redirect", async () => {
        mockFetch.mockResolvedValue(
            new Response(null, {
                status: 302,
                headers: {
                    Location: "https://client.example/callback?code=auth-code&state=csrf-state-123",
                },
            }),
        );

        const response = await post(createRequest(defaultFormFields));

        expect(response.status).toBe(302);
        expect(response.headers.get("Location")).toBe(
            "https://client.example/callback?code=auth-code&state=csrf-state-123",
        );

        const [backendUrl, init] = mockFetch.mock.calls[0] as [string, RequestInit];
        const url = new URL(backendUrl);
        expect(url.origin).toBe("https://api.test.example");
        expect(url.pathname).toBe("/api/v1/oauth/authorize");
        expect(url.searchParams.get("response_type")).toBe("code");
        expect(url.searchParams.get("client_id")).toBe(defaultFormFields.client_id);
        expect(url.searchParams.get("redirect_uri")).toBe(defaultFormFields.redirect_uri);
        expect(url.searchParams.get("scope")).toBe(defaultFormFields.scope);
        expect(url.searchParams.get("state")).toBe(defaultFormFields.state);
        expect(url.searchParams.get("code_challenge")).toBe(defaultFormFields.code_challenge);
        expect(url.searchParams.get("code_challenge_method")).toBe("S256");
        expect(init).toEqual({
            headers: {
                Authorization: "Bearer access-token",
            },
            redirect: "manual",
        });
    });

    it("appends listing_source_id to the browser redirect without sending it to the backend authorize request", async () => {
        mockFetch.mockResolvedValue(
            new Response(null, {
                status: 302,
                headers: {
                    Location: "https://client.example/callback?code=auth-code&state=csrf-state-123",
                },
            }),
        );

        const response = await post(
            createRequest({
                ...defaultFormFields,
                listing_source_id: "shop-1",
            }),
        );

        expect(response.status).toBe(302);
        expect(response.headers.get("Location")).toBe(
            "https://client.example/callback?code=auth-code&state=csrf-state-123&listing_source_id=shop-1",
        );

        const [backendUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
        const url = new URL(backendUrl);
        expect(url.searchParams.get("redirect_uri")).toBe(defaultFormFields.redirect_uri);
        expect(url.searchParams.has("listing_source_id")).toBe(false);
    });

    it("does not add optional parameters when scope and state are omitted", async () => {
        mockFetch.mockResolvedValue(
            new Response("Redirect without location", {
                status: 302,
            }),
        );

        const response = await post(
            createRequest({
                lng: defaultFormFields.lng,
                response_type: defaultFormFields.response_type,
                client_id: defaultFormFields.client_id,
                redirect_uri: defaultFormFields.redirect_uri,
                code_challenge: defaultFormFields.code_challenge,
                code_challenge_method: defaultFormFields.code_challenge_method,
            }),
        );

        expect(response.status).toBe(302);
        await expect(response.text()).resolves.toBe("Redirect without location");

        const [backendUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
        const url = new URL(backendUrl);
        expect(url.searchParams.has("scope")).toBe(false);
        expect(url.searchParams.has("state")).toBe(false);
    });

    it("forwards backend error responses", async () => {
        mockFetch.mockResolvedValue(
            new Response('{"error":"UNAUTHORIZED"}', {
                status: 401,
                headers: {
                    "Content-Type": "application/problem+json",
                },
            }),
        );

        const response = await post(createRequest(defaultFormFields));

        expect(response.status).toBe(401);
        expect(response.headers.get("Content-Type")).toBe("application/problem+json");
        await expect(response.text()).resolves.toBe('{"error":"UNAUTHORIZED"}');
    });

    it("forwards backend error responses without a content type", async () => {
        mockFetch.mockResolvedValue(
            new Response(null, {
                status: 500,
            }),
        );

        const response = await post(createRequest(defaultFormFields));

        expect(response.status).toBe(500);
        expect(response.headers.get("Content-Type")).not.toBe("application/problem+json");
        await expect(response.text()).resolves.toBe("");
    });

    it("returns a bad gateway response when the backend request fails", async () => {
        mockFetch.mockRejectedValue(new Error("Network error"));

        const response = await post(createRequest(defaultFormFields));

        expect(response.status).toBe(502);
        await expect(response.text()).resolves.toBe("OAuth authorization request failed.");
    });

    it("uses the default API URL when no API URL is configured", async () => {
        vi.resetModules();
        vi.doMock("@/env.ts", () => ({
            env: {
                VITE_API_URL: undefined,
            },
        }));
        const { postOAuthAuthorizeApprove: postWithDefaultApiUrl } = await import(
            "../oauthAuthorizeApproveHandler.ts"
        );
        mockFetch.mockResolvedValue(
            new Response(null, {
                status: 302,
                headers: {
                    Location: "https://client.example/callback?code=auth-code",
                },
            }),
        );

        await post(createRequest(defaultFormFields), postWithDefaultApiUrl);

        const [backendUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
        expect(new URL(backendUrl).origin).toBe("https://api.dev.aura-historia.com");
    });
});

function post(
    request: Request,
    handler: PostHandler = postOAuthAuthorizeApprove,
): Promise<Response> {
    return handler({ request });
}

function createRequest(fields: Record<string, string | undefined>): Request {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
            formData.set(key, value);
        }
    }

    return new Request("https://auth.example/api/oauth/authorize/approve", {
        method: "POST",
        headers: { Origin: "https://auth.example" },
        body: formData,
    });
}
