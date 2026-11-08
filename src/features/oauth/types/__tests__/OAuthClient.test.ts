import { describe, expect, it } from "vitest";
import {
    isMetadataDocumentClientId,
    mapToInternalOAuthClient,
    type OAuthClient,
} from "@/data/internal/oauth/OAuthClient.ts";
import type { OAuthClientConsentMetadataData } from "@/client";

describe("mapToInternalOAuthClient", () => {
    it("maps all fields from API response to internal model", () => {
        const apiData: OAuthClientConsentMetadataData & {
            client_secret: string;
            client_id_issued_at: number;
        } = {
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            client_secret: "aurahistoria_oauth_client_secret_abcdefghijk_****",
            client_name: "Test OAuth App",
            tos_uri: "https://client.example/tos",
            policy_uri: "https://client.example/privacy",
            client_uri: "https://client.example",
            logo_uri: "https://client.example/logo.png",
            redirect_uris: ["https://client.example/callback"],
            scope: ["product-listings:write"],
            client_id_issued_at: 1748539200,
        };

        const result: OAuthClient = mapToInternalOAuthClient(apiData);

        expect(result.kind).toBe("registered");
        expect(result.clientId).toBe("01970f22-2bf0-7000-8000-000000000010");
        expect(result.clientName).toBe("Test OAuth App");
        expect(result.tosUri).toBe("https://client.example/tos");
        expect(result.policyUri).toBe("https://client.example/privacy");
        expect(result.clientUri).toBe("https://client.example");
        expect(result.logoUri).toBe("https://client.example/logo.png");
        expect(result.redirectUris).toEqual(["https://client.example/callback"]);
        expect(result.scopes).toEqual(["product-listings:write"]);
    });

    it("maps multiple scopes correctly", () => {
        const apiData: OAuthClientConsentMetadataData & {
            client_secret: string;
            client_id_issued_at: number;
        } = {
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            client_secret: "masked",
            client_name: "Multi-Scope App",
            tos_uri: "https://client.example/tos",
            policy_uri: "https://client.example/privacy",
            client_uri: "https://client.example",
            logo_uri: "https://client.example/logo.png",
            redirect_uris: ["https://client.example/callback", "https://client.example/auth"],
            scope: ["product-listings:write", "listing-sources:write", "watchlist:read"],
            client_id_issued_at: 1748539200,
        };

        const result = mapToInternalOAuthClient(apiData);

        expect(result.scopes).toEqual([
            "product-listings:write",
            "listing-sources:write",
            "watchlist:read",
        ]);
        expect(result.redirectUris).toHaveLength(2);
    });

    it("handles empty scopes array", () => {
        const apiData: OAuthClientConsentMetadataData & {
            client_secret: string;
            client_id_issued_at: number;
        } = {
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            client_secret: "masked",
            client_name: "No Scope App",
            tos_uri: "https://client.example/tos",
            policy_uri: "https://client.example/privacy",
            client_uri: "https://client.example",
            logo_uri: "https://client.example/logo.png",
            redirect_uris: ["https://client.example/callback"],
            scope: [],
            client_id_issued_at: 1748539200,
        };

        const result = mapToInternalOAuthClient(apiData);

        expect(result.scopes).toEqual([]);
    });

    it("does not include client_secret or client_id_issued_at in internal model", () => {
        const apiData: OAuthClientConsentMetadataData & {
            client_secret: string;
            client_id_issued_at: number;
        } = {
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            client_secret: "secret-value",
            client_name: "App",
            tos_uri: "https://client.example/tos",
            policy_uri: "https://client.example/privacy",
            client_uri: "https://client.example",
            logo_uri: "https://client.example/logo.png",
            redirect_uris: ["https://example.com/cb"],
            scope: ["product-listings:write"],
            client_id_issued_at: 1748539200,
        };

        const result = mapToInternalOAuthClient(apiData);

        expect(result).not.toHaveProperty("clientSecret");
        expect(result).not.toHaveProperty("client_secret");
        expect(result).not.toHaveProperty("clientIdIssuedAt");
        expect(result).not.toHaveProperty("client_id_issued_at");
    });
});

describe("isMetadataDocumentClientId", () => {
    it.each([
        "https://claude.ai/oauth/claude-code-client-metadata",
        "https://vscode.dev/oauth/client-metadata.json",
        "https://aura-historia.com/oauth/webmcp-client.json",
    ])("treats the HTTPS URL %s as a metadata document client", (clientId) => {
        expect(isMetadataDocumentClientId(clientId)).toBe(true);
    });

    it.each([
        "oc_7b0gwc1x49e0mvbt3tfexfqgb5",
        "01970f22-2bf0-7000-8000-000000000010",
        "http://client.example/metadata.json",
        "claude.ai/oauth/claude-code-client-metadata",
        "",
    ])("treats %j as a registered client", (clientId) => {
        expect(isMetadataDocumentClientId(clientId)).toBe(false);
    });
});
