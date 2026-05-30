import { describe, expect, it } from "vitest";
import { mapToInternalOAuthClient, type OAuthClient } from "../OAuthClient.ts";
import type { OAuthClientMetadataResponseData } from "@/client";

describe("mapToInternalOAuthClient", () => {
    it("maps all fields from API response to internal model", () => {
        const apiData: OAuthClientMetadataResponseData = {
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            client_secret: "aurahistoria_oauth_client_secret_abcdefghijk_****",
            client_name: "Test OAuth App",
            redirect_uris: ["https://client.example/callback"],
            scope: ["products:write"],
            client_id_issued_at: 1748539200,
        };

        const result: OAuthClient = mapToInternalOAuthClient(apiData);

        expect(result.clientId).toBe("01970f22-2bf0-7000-8000-000000000010");
        expect(result.clientName).toBe("Test OAuth App");
        expect(result.redirectUris).toEqual(["https://client.example/callback"]);
        expect(result.scopes).toEqual(["products:write"]);
    });

    it("maps multiple scopes correctly", () => {
        const apiData: OAuthClientMetadataResponseData = {
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            client_secret: "masked",
            client_name: "Multi-Scope App",
            redirect_uris: ["https://client.example/callback", "https://client.example/auth"],
            scope: ["products:write", "shops:manage"],
            client_id_issued_at: 1748539200,
        };

        const result = mapToInternalOAuthClient(apiData);

        expect(result.scopes).toEqual(["products:write", "shops:manage"]);
        expect(result.redirectUris).toHaveLength(2);
    });

    it("handles empty scopes array", () => {
        const apiData: OAuthClientMetadataResponseData = {
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            client_secret: "masked",
            client_name: "No Scope App",
            redirect_uris: ["https://client.example/callback"],
            scope: [],
            client_id_issued_at: 1748539200,
        };

        const result = mapToInternalOAuthClient(apiData);

        expect(result.scopes).toEqual([]);
    });

    it("does not include client_secret or client_id_issued_at in internal model", () => {
        const apiData: OAuthClientMetadataResponseData = {
            client_id: "01970f22-2bf0-7000-8000-000000000010",
            client_secret: "secret-value",
            client_name: "App",
            redirect_uris: ["https://example.com/cb"],
            scope: ["products:write"],
            client_id_issued_at: 1748539200,
        };

        const result = mapToInternalOAuthClient(apiData);

        expect(result).not.toHaveProperty("clientSecret");
        expect(result).not.toHaveProperty("client_secret");
        expect(result).not.toHaveProperty("clientIdIssuedAt");
        expect(result).not.toHaveProperty("client_id_issued_at");
    });
});
