import { describe, expect, it } from "vitest";
import type { AdminAccessTokenData } from "@/client";
import { mapToAdminAccessToken } from "../AdminAccessToken.ts";

describe("mapToAdminAccessToken", () => {
    it("maps only the supported secret-free metadata and does not invent a creation time", () => {
        const dto = {
            userId: "usr_target",
            accessTokenId: "at_opaque",
            name: "Catalog integration",
            scopes: ["product-listings:write"],
            origin: "User",
            expires: null,
            token: "raw-token-must-not-escape",
            tokenHash: "hash-must-not-escape",
            maskedToken: "masked-token-must-not-escape",
            created: "2026-01-01T00:00:00Z",
        } as unknown as AdminAccessTokenData;

        const mapped = mapToAdminAccessToken(dto, "usr_target");

        expect(mapped).toEqual({
            accessTokenId: "at_opaque",
            name: "Catalog integration",
            scopes: ["product-listings:write"],
            origin: "User",
            expires: null,
        });
        expect(mapped).not.toHaveProperty("token");
        expect(mapped).not.toHaveProperty("tokenHash");
        expect(mapped).not.toHaveProperty("maskedToken");
        expect(mapped).not.toHaveProperty("created");
        expect(JSON.stringify(mapped)).not.toContain("must-not-escape");
    });

    it("rejects metadata returned for a different target user", () => {
        expect(() =>
            mapToAdminAccessToken(
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
