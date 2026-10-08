import { describe, expect, it } from "vitest";
import type { OAuthClientAdminData } from "@/client";
import {
    buildAdminOAuthClientCreateData,
    buildAdminOAuthClientPatchData,
    mapToAdminOAuthClient,
    mapToAdminOAuthClientPage,
    mapToCreatedAdminOAuthClient,
    mapToAdminOAuthClientListQuery,
    oauthClientMetadataPatchSchema,
    type AdminOAuthClientMetadataInput,
} from "./AdminOAuthClient.ts";

const clientDto = {
    client_id: "oc_test123",
    client_name: "Cabinet integration",
    tos_uri: "https://cabinet.example/terms",
    policy_uri: "https://cabinet.example/privacy",
    client_uri: "https://cabinet.example",
    logo_uri: "https://cabinet.example/logo.svg",
    redirect_uris: ["https://cabinet.example/oauth/callback"],
    scope: ["product-listings:write"],
    client_id_issued_at: 1_759_000_000,
} satisfies OAuthClientAdminData;

const input: AdminOAuthClientMetadataInput = {
    clientName: "Cabinet integration",
    tosUri: "https://cabinet.example/terms",
    policyUri: "https://cabinet.example/privacy",
    clientUri: "https://cabinet.example",
    logoUri: "https://cabinet.example/logo.svg",
    redirectUris: ["https://cabinet.example/oauth/callback"],
    scopes: ["product-listings:write"],
};

describe("AdminOAuthClient mapping", () => {
    it("maps secret-free detail DTOs without adding a secret field", () => {
        const client = mapToAdminOAuthClient(clientDto);

        expect(client).toMatchObject({
            clientId: clientDto.client_id,
            clientName: clientDto.client_name,
            redirectUris: clientDto.redirect_uris,
            scopes: clientDto.scope,
        });
        expect(client).not.toHaveProperty("clientSecret");
    });

    it("maps paginated collections and preserves optional totals and tuple cursors", () => {
        const page = mapToAdminOAuthClientPage({
            items: [clientDto],
            size: 1,
            searchAfter: ["2026-09-04T12:00:00Z", "oc_test123"],
        });

        expect(page.items[0]?.clientId).toBe("oc_test123");
        expect(page.size).toBe(1);
        expect(page.searchAfter).toEqual(["2026-09-04T12:00:00Z", "oc_test123"]);
        expect(page).not.toHaveProperty("total");
        expect(mapToAdminOAuthClientPage({ items: [], size: 0, total: 17 }).total).toBe(17);
    });

    it("maps the plaintext secret only from a create response", () => {
        expect(
            mapToCreatedAdminOAuthClient({
                ...clientDto,
                client_secret: "plaintext-once",
            }),
        ).toEqual({ clientId: "oc_test123", clientSecret: "plaintext-once" });
    });

    it("builds client ID/name filters and JSON-encodes the pagination tuple", () => {
        expect(
            mapToAdminOAuthClientListQuery({ clientId: " oc_test123 ", name: " Cabinet " }, [
                "2026-09-04T12:00:00Z",
                "oc_test123",
            ]),
        ).toEqual({
            size: 21,
            clientId: "oc_test123",
            name: "Cabinet",
            searchAfter: '["2026-09-04T12:00:00Z","oc_test123"]',
        });
    });

    it("sends an empty scope list to clear scopes and omits untouched patch fields", () => {
        expect(buildAdminOAuthClientPatchData({ scopes: [] })).toEqual({ scope: [] });
    });

    it("rejects explicit null patch members", () => {
        expect(() => oauthClientMetadataPatchSchema.parse({ scope: null })).toThrow();
        expect(() => oauthClientMetadataPatchSchema.parse({ client_name: null })).toThrow();
    });

    it("requires a nonempty HTTPS redirect URI without a fragment", () => {
        expect(() => buildAdminOAuthClientCreateData({ ...input, redirectUris: [] })).toThrow();
        expect(() =>
            buildAdminOAuthClientCreateData({
                ...input,
                redirectUris: ["http://cabinet.example/oauth/callback"],
            }),
        ).toThrow();
        expect(() =>
            buildAdminOAuthClientCreateData({
                ...input,
                redirectUris: ["https://cabinet.example/oauth/callback#fragment"],
            }),
        ).toThrow();
        expect(() =>
            buildAdminOAuthClientCreateData({
                ...input,
                redirectUris: [
                    "https://cabinet.example/oauth/callback",
                    "https://cabinet.example/oauth/callback",
                ],
            }),
        ).toThrow();
        expect(buildAdminOAuthClientCreateData({ ...input, scopes: [] }).scope).toEqual([]);
    });
});
