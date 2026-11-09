import { describe, expect, it } from "vitest";
import type { CreatedAccessTokenData, OwnAccessTokenData } from "@/client";
import {
    mapToAccessToken,
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
