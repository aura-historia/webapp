import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    getOAuthConsentClient,
    OAuthConsentMetadataError,
    OAuthConsentUnavailableError,
} from "../oauthConsentMetadata.ts";

const get = vi.hoisted(() => vi.fn());
vi.mock("@/client", () => ({ getOAuthConsentClient: get }));
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
