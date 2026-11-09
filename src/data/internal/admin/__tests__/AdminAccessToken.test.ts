import { describe, expect, it } from "vitest";
import type { AdminAccessTokenData } from "@/client";
import { groupAdminCredentials, mapToAdminCredentialEntry } from "../AdminAccessToken.ts";

const connectionEntry: AdminAccessTokenData = {
    userId: "usr_target",
    connectionId: "ocn_06e2x7g9xm8y5r0gkw4wz1n3tg",
    name: "Claude Code",
    scopes: ["users:read"],
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

describe("mapToAdminCredentialEntry", () => {
    it("drops the user ID and keeps the listing fields", () => {
        const mapped = mapToAdminCredentialEntry(
            {
                userId: "usr_target",
                accessTokenId: "at_opaque",
                name: "Catalog integration",
                scopes: ["product-listings:write"],
                origin: "User",
                expires: "2026-12-01T00:00:00Z",
            },
            "usr_target",
        );

        expect(mapped).toEqual({
            accessTokenId: "at_opaque",
            name: "Catalog integration",
            scopes: ["product-listings:write"],
            origin: "User",
            expires: "2026-12-01T00:00:00Z",
        });
        expect(mapped).not.toHaveProperty("userId");
    });

    it("keeps a metadata document client's connection entry, which has no token ID", () => {
        const { userId: _userId, ...expected } = connectionEntry;

        expect(mapToAdminCredentialEntry(connectionEntry, "usr_target")).toEqual(expected);
    });

    it("rejects metadata returned for a different target user", () => {
        expect(() =>
            mapToAdminCredentialEntry(
                {
                    userId: "usr_other",
                    accessTokenId: "at_other",
                    name: "Other user token",
                    scopes: [],
                    origin: "User",
                },
                "usr_target",
            ),
        ).toThrow("Admin access-token response did not match the selected user");
    });
});

describe("groupAdminCredentials", () => {
    it("keeps only the supported secret-free metadata of a personal token", () => {
        const entry = mapToAdminCredentialEntry(
            {
                userId: "usr_target",
                accessTokenId: "at_opaque",
                name: "Catalog integration",
                scopes: ["product-listings:write"],
                origin: "User",
                token: "raw-token-must-not-escape",
                tokenHash: "hash-must-not-escape",
                maskedToken: "masked-token-must-not-escape",
                created: "2026-01-01T00:00:00Z",
            } as unknown as AdminAccessTokenData,
            "usr_target",
        );

        const grouped = groupAdminCredentials([entry]);

        expect(grouped).toEqual({
            personalTokens: [
                {
                    accessTokenId: "at_opaque",
                    name: "Catalog integration",
                    scopes: ["product-listings:write"],
                    origin: "User",
                },
            ],
            connectedApps: [],
        });
        expect(JSON.stringify(grouped)).not.toContain("must-not-escape");
    });

    it("groups a connection entry and a registered client's tokens into connected apps", () => {
        const shopify = {
            clientId: "oc_shopify",
            name: "Shopify",
            kind: "REGISTERED",
            host: "shopify.com",
        } as const;
        const entries = [
            mapToAdminCredentialEntry(connectionEntry, "usr_target"),
            mapToAdminCredentialEntry(
                {
                    userId: "usr_target",
                    accessTokenId: "at_shop_1",
                    name: "Shopify",
                    scopes: ["product-listings:write"],
                    origin: "OAuth",
                    client: shopify,
                },
                "usr_target",
            ),
            mapToAdminCredentialEntry(
                {
                    userId: "usr_target",
                    accessTokenId: "at_shop_2",
                    name: "Shopify",
                    scopes: ["listing-sources:read"],
                    origin: "OAuth",
                    client: shopify,
                    expires: "2027-01-01T00:00:00Z",
                },
                "usr_target",
            ),
        ];

        const grouped = groupAdminCredentials(entries);

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
                scopes: ["users:read"],
                connection: {
                    id: "ocn_06e2x7g9xm8y5r0gkw4wz1n3tg",
                    connectedAt: new Date("2026-11-01T09:00:00Z"),
                    lastUsedAt: new Date("2026-11-06T12:00:00Z"),
                },
                tokens: [],
            },
            {
                client: {
                    clientId: "oc_shopify",
                    name: "Shopify",
                    kind: "registered",
                    host: "shopify.com",
                },
                origin: "OAuth",
                scopes: ["product-listings:write", "listing-sources:read"],
                connection: null,
                tokens: [
                    { id: "at_shop_1", scopes: ["product-listings:write"], expiresAt: null },
                    {
                        id: "at_shop_2",
                        scopes: ["listing-sources:read"],
                        expiresAt: new Date("2027-01-01T00:00:00Z"),
                    },
                ],
            },
        ]);
    });
});
