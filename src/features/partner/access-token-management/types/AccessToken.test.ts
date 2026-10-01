import { describe, expect, it } from "vitest";
import type { GetAccessTokenData } from "@/client";
import { mapToAccessToken } from "@/features/partner/access-token-management/types/AccessToken.ts";

const apiAccessToken: GetAccessTokenData = {
    accessTokenId: "token-123",
    name: "Product sync",
    scope: ["product-listings:write"],
    token: "aurahistoria_abcdefghijk_****",
    tokenType: "BEARER",
    expiresAt: "2026-08-01T12:00:00Z",
    expiresIn: 3600,
    createdBy: "user-1",
    updatedBy: "user-1",
    created: "2026-07-01T12:00:00Z",
    updated: "2026-07-02T12:00:00Z",
};

describe("mapToAccessToken", () => {
    it("maps generated API data to the dashboard domain type", () => {
        expect(mapToAccessToken(apiAccessToken)).toEqual({
            id: "token-123",
            name: "Product sync",
            scopes: ["product-listings:write"],
            unsupportedScopes: [],
            maskedToken: "aurahistoria_abcdefghijk_****",
            tokenType: "BEARER",
            expiresAt: new Date("2026-08-01T12:00:00Z"),
            created: new Date("2026-07-01T12:00:00Z"),
            updated: new Date("2026-07-02T12:00:00Z"),
        });
    });

    it("normalizes omitted scopes and expiration", () => {
        expect(
            mapToAccessToken({
                ...apiAccessToken,
                scope: undefined,
                expiresAt: null,
            }),
        ).toMatchObject({
            scopes: [],
            unsupportedScopes: [],
            expiresAt: null,
        });
    });

    it("does not translate legacy scopes into replacement capabilities", () => {
        const legacyData = {
            ...apiAccessToken,
            scope: ["shops:manage", "products:write", "future:write", "users:read"],
        };
        expect(mapToAccessToken(legacyData as unknown as GetAccessTokenData)).toMatchObject({
            scopes: ["users:read"],
            unsupportedScopes: ["shops:manage", "products:write", "future:write"],
        });
    });
});
