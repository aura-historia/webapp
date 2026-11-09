import { describe, expect, it } from "vitest";
import type { AccessTokenClientData, OwnAccessTokenListEntryData } from "@/client";
import {
    groupCredentialEntries,
    mapToOwnCredentials,
    type CredentialListEntryData,
} from "@/data/internal/access-tokens/OwnCredentials.ts";

const SHOPIFY: AccessTokenClientData = {
    clientId: "oc_shopify",
    name: "Shopify",
    kind: "REGISTERED",
    host: "shopify.com",
};

const CLAUDE_CODE: AccessTokenClientData = {
    clientId: "https://claude.ai/oauth/claude-code-client-metadata",
    name: "Claude Code",
    kind: "METADATA_DOCUMENT",
    host: "claude.ai",
};

const personalToken: OwnAccessTokenListEntryData = {
    userId: "usr_owner",
    accessTokenId: "token-123",
    name: "Product sync",
    scopes: ["product-listings:write"],
    origin: "User",
    expires: "2026-08-01T12:00:00Z",
};

const agentConnection: OwnAccessTokenListEntryData = {
    userId: "usr_owner",
    connectionId: "ocn_06e2x7g9xm8y5r0gkw4wz1n3tg",
    name: "Claude Code",
    scopes: ["watchlist:read", "users:read"],
    origin: "OAuthMetadataDocument",
    client: CLAUDE_CODE,
    created: "2026-11-01T09:00:00Z",
    lastUsed: "2026-11-06T12:00:00Z",
};

function shopifyToken(
    accessTokenId: string,
    extra: Partial<OwnAccessTokenListEntryData> = {},
): OwnAccessTokenListEntryData {
    return {
        userId: "usr_owner",
        accessTokenId,
        name: "Shopify",
        scopes: [],
        origin: "OAuth",
        client: SHOPIFY,
        ...extra,
    };
}

describe("groupCredentialEntries", () => {
    const byId = (entry: CredentialListEntryData & { readonly accessTokenId: string }) =>
        entry.accessTokenId;

    it("groups a registered client's token entries into one app with unioned scopes", () => {
        const grouped = groupCredentialEntries(
            [
                shopifyToken("at_shop_1", {
                    scopes: ["product-listings:write", "listing-sources:read"],
                    expires: "2027-01-01T00:00:00Z",
                }),
                shopifyToken("at_shop_2", {
                    scopes: ["listing-sources:write", "users:read", "product-listings:write"],
                }),
            ],
            byId,
        );

        expect(grouped.personalTokens).toEqual([]);
        expect(grouped.connectedApps).toEqual([
            {
                client: {
                    clientId: "oc_shopify",
                    name: "Shopify",
                    kind: "registered",
                    host: "shopify.com",
                },
                origin: "OAuth",
                // Each scope once, in the contract's order.
                scopes: [
                    "users:read",
                    "product-listings:write",
                    "listing-sources:read",
                    "listing-sources:write",
                ],
                connection: null,
                tokens: [
                    {
                        id: "at_shop_1",
                        scopes: ["product-listings:write", "listing-sources:read"],
                        expiresAt: new Date("2027-01-01T00:00:00Z"),
                    },
                    {
                        id: "at_shop_2",
                        scopes: ["listing-sources:write", "users:read", "product-listings:write"],
                        expiresAt: null,
                    },
                ],
            },
        ]);
    });

    it("maps an agent's connection entry to an app with its dates and no tokens", () => {
        const grouped = groupCredentialEntries([agentConnection], byId);

        expect(grouped.personalTokens).toEqual([]);
        expect(grouped.connectedApps).toEqual([
            {
                client: {
                    clientId: "https://claude.ai/oauth/claude-code-client-metadata",
                    name: "Claude Code",
                    kind: "metadataDocument",
                    host: "claude.ai",
                },
                origin: "OAuthMetadataDocument",
                scopes: ["users:read", "watchlist:read"],
                connection: {
                    id: "ocn_06e2x7g9xm8y5r0gkw4wz1n3tg",
                    connectedAt: new Date("2026-11-01T09:00:00Z"),
                    lastUsedAt: new Date("2026-11-06T12:00:00Z"),
                },
                tokens: [],
            },
        ]);
    });

    it("maps a connection entry without dates to null dates", () => {
        const { created: _created, lastUsed: _lastUsed, ...undated } = agentConnection;

        const [app] = groupCredentialEntries([undated], byId).connectedApps;

        expect(app?.connection).toEqual({
            id: "ocn_06e2x7g9xm8y5r0gkw4wz1n3tg",
            connectedAt: null,
            lastUsedAt: null,
        });
    });

    it("keeps an entry without a client but with a token ID as a personal token", () => {
        const grouped = groupCredentialEntries([personalToken], byId);

        expect(grouped).toEqual({ personalTokens: ["token-123"], connectedApps: [] });
    });

    it("drops an entry with neither a client nor a token ID", () => {
        const { client: _client, ...orphan } = agentConnection;

        expect(groupCredentialEntries([orphan], byId)).toEqual({
            personalTokens: [],
            connectedApps: [],
        });
    });

    it("keeps apps in the order their client first appears and personal tokens in backend order", () => {
        const grouped = groupCredentialEntries(
            [
                shopifyToken("at_shop_1"),
                { ...personalToken, accessTokenId: "token-b" },
                agentConnection,
                shopifyToken("at_shop_2"),
                { ...personalToken, accessTokenId: "token-a" },
            ],
            byId,
        );

        expect(grouped.personalTokens).toEqual(["token-b", "token-a"]);
        expect(grouped.connectedApps.map((app) => app.client.clientId)).toEqual([
            "oc_shopify",
            "https://claude.ai/oauth/claude-code-client-metadata",
        ]);
        expect(grouped.connectedApps[0]?.tokens.map((token) => token.id)).toEqual([
            "at_shop_1",
            "at_shop_2",
        ]);
    });
});

describe("mapToOwnCredentials", () => {
    it("maps personal tokens like single tokens", () => {
        expect(mapToOwnCredentials([personalToken])).toEqual({
            personalTokens: [
                {
                    id: "token-123",
                    name: "Product sync",
                    scopes: ["product-listings:write"],
                    expiresAt: new Date("2026-08-01T12:00:00Z"),
                },
            ],
            connectedApps: [],
        });
    });

    it("keeps an empty scope set and maps an omitted expiry to null", () => {
        const { expires: _expires, ...undated } = personalToken;

        expect(mapToOwnCredentials([{ ...undated, scopes: [] }]).personalTokens).toEqual([
            { id: "token-123", name: "Product sync", scopes: [], expiresAt: null },
        ]);
    });

    it("separates personal tokens from connected apps", () => {
        const credentials = mapToOwnCredentials([
            personalToken,
            agentConnection,
            shopifyToken("at_shop_1"),
        ]);

        expect(credentials.personalTokens.map((token) => token.id)).toEqual(["token-123"]);
        expect(credentials.connectedApps.map((app) => app.client.name)).toEqual([
            "Claude Code",
            "Shopify",
        ]);
    });
});
