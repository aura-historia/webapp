import { describe, expect, it } from "vitest";
import type { GetAccessTokenData } from "@/client";
import { mapToAccessToken } from "@/features/partner/access-token-management/types/AccessToken.ts";

const apiAccessToken: GetAccessTokenData = {
    accessTokenId: "token-123",
    name: "Product sync",
    scope: ["products:write"],
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
            scopes: ["products:write"],
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
            expiresAt: null,
        });
    });
});
