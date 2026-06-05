import { beforeEach, describe, expect, it, vi } from "vitest";
import { postOAuthAuthorizeApprove } from "../oauthAuthorizeApproveHandler.ts";

const mockGetServerAuthToken = vi.hoisted(() => vi.fn());
const mockFetch = vi.hoisted(() => vi.fn());

vi.mock("@/env.ts", () => ({
    env: {
        VITE_API_URL: "https://api.test.example",
    },
}));

vi.mock("@/lib/server/amplify.server.ts", () => ({
    getServerAuthToken: mockGetServerAuthToken,
}));

type PostHandler = (ctx: { request: Request }) => Promise<Response>;

const defaultFormFields = {
    response_type: "code",
    client_id: "01970f22-2bf0-7000-8000-000000000010",
    redirect_uri: "https://client.example/callback",
    scope: "products:write shops:manage",
    state: "csrf-state-123",
    code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    code_challenge_method: "S256",
};

describe("/api/oauth/authorize/approve", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("fetch", mockFetch);
        mockGetServerAuthToken.mockResolvedValue("access-token");
    });

    it("rejects invalid form submissions", async () => {
        const response = await post(createRequest({ client_id: "missing-required-fields" }));

        expect(response.status).toBe(400);
        await expect(response.text()).resolves.toBe("Invalid OAuth authorization request.");
        expect(mockGetServerAuthToken).not.toHaveBeenCalled();
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
        expect(loginUrl.pathname).toBe("/login");

        const redirectParam = loginUrl.searchParams.get("redirect");
        if (!redirectParam) {
            throw new Error("Missing login redirect parameter");
        }
        const redirectUrl = new URL(redirectParam, loginUrl.origin);
        expect(redirectUrl.pathname).toBe("/oauth/authorize");
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

    it("does not add optional parameters when scope and state are omitted", async () => {
        mockFetch.mockResolvedValue(
            new Response("Redirect without location", {
                status: 302,
            }),
        );

        const response = await post(
            createRequest({
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
        body: formData,
    });
}
