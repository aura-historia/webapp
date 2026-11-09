import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    getOAuthConsentClient,
    getOAuthMetadataDocumentConsentClient,
    OAuthConsentMetadataError,
    OAuthConsentUnavailableError,
} from "../oauthConsentMetadata.ts";

const get = vi.hoisted(() => vi.fn());
const getDocument = vi.hoisted(() => vi.fn());
vi.mock("@/client", () => ({
    getOAuthConsentClient: get,
    getOAuthMetadataDocumentConsentClient: getDocument,
}));
vi.mock("@/env.ts", () => ({ env: { VITE_API_URL: "https://api.test.example" } }));
const dto = {
    client_id: "oc_test",
    client_name: "Consent client",
    tos_uri: "https://client.example/terms",
    policy_uri: "https://client.example/privacy",
    client_uri: "https://client.example",
    logo_uri: "https://client.example/logo",
    redirect_uris: ["https://client.example/callback"],
    scope: ["watchlist:read"],
};
describe("ordinary-user consent metadata adapter", () => {
    beforeEach(() => {
        get.mockReset();
        get.mockResolvedValue({ data: dto, response: new Response(null, { status: 200 }) });
    });
    it("uses the generated consent operation without caching", async () => {
        const mapped = await getOAuthConsentClient("oc_test");
        expect(get).toHaveBeenCalledWith(
            expect.objectContaining({
                path: { clientId: "oc_test" },
                cache: "no-store",
                redirect: "error",
            }),
        );
        expect(get.mock.calls[0][0]).not.toHaveProperty("auth");
        expect(mapped).toMatchObject({
            kind: "registered",
            clientId: "oc_test",
            clientName: "Consent client",
            scopes: ["watchlist:read"],
        });
        expect(mapped).not.toHaveProperty("client_id");
        expect(mapped.redirectUris).not.toBe(dto.redirect_uris);
    });
    it("discards unexpected credentials before returning metadata", async () => {
        get.mockResolvedValue({
            data: { ...dto, client_secret: "private", client_id_issued_at: 42 },
            response: new Response(),
        });
        const mapped = await getOAuthConsentClient("oc_test");
        expect(JSON.stringify(mapped)).not.toContain("private");
        expect(mapped).not.toHaveProperty("client_id_issued_at");
    });
    it("rejects metadata for a different client", async () => {
        get.mockResolvedValue({
            data: { ...dto, client_id: "oc_another" },
            response: new Response(),
        });
        await expect(getOAuthConsentClient("oc_test")).rejects.toBeInstanceOf(
            OAuthConsentUnavailableError,
        );
    });
    it("preserves an empty allowed scope set", async () => {
        get.mockResolvedValue({ data: { ...dto, scope: [] }, response: new Response() });
        expect((await getOAuthConsentClient("oc_test")).scopes).toEqual([]);
    });
    it.each([400, 401, 403, 404])(
        "handles HTTP %s without exposing backend detail",
        async (status) => {
            get.mockResolvedValue({
                error: { detail: "private backend detail" },
                response: new Response(null, { status }),
            });
            await expect(getOAuthConsentClient("oc_test")).rejects.toMatchObject({
                status,
                message: "OAuth consent metadata request failed.",
            });
            await expect(getOAuthConsentClient("oc_test")).rejects.toBeInstanceOf(
                OAuthConsentMetadataError,
            );
        },
    );
    it.each([500, 503])("fails closed on HTTP %s", async (status) => {
        get.mockResolvedValue({ error: {}, response: new Response(null, { status }) });
        await expect(getOAuthConsentClient("oc_test")).rejects.toBeInstanceOf(
            OAuthConsentUnavailableError,
        );
    });
    it("fails closed on transport errors", async () => {
        get.mockRejectedValue(new Error("private transport details"));
        await expect(getOAuthConsentClient("oc_test")).rejects.toMatchObject({
            message: "OAuth consent metadata is unavailable.",
        });
    });
});

const CLIENT_ID = "https://claude.ai/oauth/claude-code-client-metadata";
const REDIRECT_URI = "http://localhost:53682/callback";
const documentDto = {
    client_id: CLIENT_ID,
    client_name: "Claude Code",
    client_uri: "https://claude.ai/",
    logo_uri: "https://claude.ai/logo.png",
    client_host: "claude.ai",
    redirect_uri_host: "localhost",
    loopback_redirect_uris_only: true,
    scope: ["users:read", "watchlist:read"],
    granted_scope: ["users:read"],
};

describe("metadata document client consent metadata adapter", () => {
    beforeEach(() => {
        getDocument.mockReset();
        getDocument.mockResolvedValue({
            data: documentDto,
            response: new Response(null, { status: 200 }),
        });
    });

    it("reads the metadata for the requested callback without caching", async () => {
        const mapped = await getOAuthMetadataDocumentConsentClient(CLIENT_ID, REDIRECT_URI);

        expect(getDocument).toHaveBeenCalledWith(
            expect.objectContaining({
                baseUrl: "https://api.test.example",
                query: { client_id: CLIENT_ID, redirect_uri: REDIRECT_URI },
                cache: "no-store",
                redirect: "error",
            }),
        );
        expect(getDocument.mock.calls[0][0]).not.toHaveProperty("auth");
        expect(mapped).toEqual({
            kind: "metadataDocument",
            clientId: CLIENT_ID,
            clientName: "Claude Code",
            clientUri: "https://claude.ai/",
            logoUri: "https://claude.ai/logo.png",
            clientHost: "claude.ai",
            redirectUriHost: "localhost",
            redirectUri: REDIRECT_URI,
            loopbackRedirectUrisOnly: true,
            scopes: ["users:read", "watchlist:read"],
            grantedScopes: ["users:read"],
        });
    });

    it("leaves out an omitted client URI and logo", async () => {
        const { client_uri: _clientUri, logo_uri: _logoUri, ...withoutUris } = documentDto;
        getDocument.mockResolvedValue({ data: withoutUris, response: new Response() });

        const mapped = await getOAuthMetadataDocumentConsentClient(CLIENT_ID, REDIRECT_URI);

        expect(mapped).not.toHaveProperty("clientUri");
        expect(mapped).not.toHaveProperty("logoUri");
    });

    it("rejects metadata for a different client", async () => {
        getDocument.mockResolvedValue({
            data: { ...documentDto, client_id: "https://attacker.example/client.json" },
            response: new Response(),
        });

        await expect(
            getOAuthMetadataDocumentConsentClient(CLIENT_ID, REDIRECT_URI),
        ).rejects.toBeInstanceOf(OAuthConsentUnavailableError);
    });

    it.each(["OAUTH_INVALID_CLIENT", "OAUTH_INVALID_REDIRECT_URI", "BAD_QUERY_PARAMETER_VALUE"])(
        "keeps the refusal code %s without backend detail",
        async (code) => {
            getDocument.mockResolvedValue({
                error: { status: 400, error: code, detail: "private backend detail" },
                response: new Response(null, { status: 400 }),
            });

            const failure = await getOAuthMetadataDocumentConsentClient(
                CLIENT_ID,
                REDIRECT_URI,
            ).catch((error: unknown) => error);

            expect(failure).toBeInstanceOf(OAuthConsentMetadataError);
            expect(failure).toMatchObject({
                status: 400,
                code,
                message: "OAuth consent metadata request failed.",
            });
            expect(JSON.stringify(failure)).not.toContain("private backend detail");
        },
    );

    it("drops an unknown refusal code", async () => {
        getDocument.mockResolvedValue({
            error: { status: 401, error: "INVALID_CREDENTIALS" },
            response: new Response(null, { status: 401 }),
        });

        await expect(
            getOAuthMetadataDocumentConsentClient(CLIENT_ID, REDIRECT_URI),
        ).rejects.toMatchObject({ status: 401, code: undefined });
    });

    it.each([500, 503])("fails closed on HTTP %s", async (status) => {
        getDocument.mockResolvedValue({
            error: { error: "AUTH_TEMPORARILY_UNAVAILABLE" },
            response: new Response(null, { status }),
        });

        await expect(
            getOAuthMetadataDocumentConsentClient(CLIENT_ID, REDIRECT_URI),
        ).rejects.toBeInstanceOf(OAuthConsentUnavailableError);
    });

    it("fails closed on transport errors", async () => {
        getDocument.mockRejectedValue(new Error("private transport details"));

        await expect(
            getOAuthMetadataDocumentConsentClient(CLIENT_ID, REDIRECT_URI),
        ).rejects.toBeInstanceOf(OAuthConsentUnavailableError);
    });
});
