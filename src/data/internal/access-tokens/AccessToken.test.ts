import { describe, expect, it } from "vitest";
import type {
    CreatedAccessTokenData,
    OwnAccessTokenData,
    OwnAccessTokenListEntryData,
} from "@/client";
import {
    mapToAccessToken,
    mapToAccessTokenListEntry,
    mapToCreatedAccessToken,
} from "@/data/internal/access-tokens/AccessToken.ts";

const apiAccessToken: OwnAccessTokenData = {
    userId: "usr_owner",
    accessTokenId: "token-123",
    name: "Product sync",
    scopes: ["product-listings:write"],
    origin: "User",
    expires: "2026-08-01T12:00:00Z",
};

describe("mapToAccessToken", () => {
    it("maps generated API data to the dashboard domain type", () => {
        expect(mapToAccessToken(apiAccessToken)).toEqual({
            id: "token-123",
            name: "Product sync",
            scopes: ["product-listings:write"],
            expiresAt: new Date("2026-08-01T12:00:00Z"),
        });
    });

    it("keeps an empty scope set and maps an omitted expiry to null", () => {
        expect(
            mapToAccessToken({
                ...apiAccessToken,
                scopes: [],
                expires: undefined,
            }),
        ).toMatchObject({
            scopes: [],
            expiresAt: null,
        });
    });
});

describe("mapToAccessTokenListEntry", () => {
    it("maps a token entry like a single token", () => {
        expect(mapToAccessTokenListEntry(apiAccessToken)).toEqual(mapToAccessToken(apiAccessToken));
    });

    it("leaves out a metadata document client's connection entry, which has no token ID", () => {
        const connection: OwnAccessTokenListEntryData = {
            userId: "usr_owner",
            connectionId: "ocn_06e2x7g9xm8y5r0gkw4wz1n3tg",
            name: "Claude Code",
            scopes: ["users:read", "watchlist:read"],
            origin: "OAuthMetadataDocument",
            client: {
                clientId: "https://claude.ai/oauth/claude-code-client-metadata",
                name: "Claude Code",
                kind: "METADATA_DOCUMENT",
                host: "claude.ai",
            },
            created: "2026-11-01T09:00:00Z",
            lastUsed: "2026-11-06T12:00:00Z",
        };

        expect(mapToAccessTokenListEntry(connection)).toBeUndefined();
    });
});

describe("mapToCreatedAccessToken", () => {
    it("keeps only the token ID and the one-time plaintext token", () => {
        const created: CreatedAccessTokenData = {
            userId: "usr_owner",
            accessTokenId: "token-123",
            accessToken: "aurahistoria_plaintext_token",
        };

        expect(mapToCreatedAccessToken(created)).toEqual({
            id: "token-123",
            plaintextToken: "aurahistoria_plaintext_token",
        });
    });
});
