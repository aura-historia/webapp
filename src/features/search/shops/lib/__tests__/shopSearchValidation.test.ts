import { describe, expect, it } from "vitest";
import { validateShopSearchParams, serializeShopSearchParams } from "../shopSearchValidation.ts";

describe("public provider search URL parameters", () => {
    it("allows browsing without a query", () => {
        expect(validateShopSearchParams({} as never)).toEqual({ q: "" });
    });
    it("round-trips the public query text", () => {
        const parameters = validateShopSearchParams({ q: "gallery" } as never);
        expect(serializeShopSearchParams(parameters)).toEqual({ q: "gallery" });
    });
    it("drops unsupported legacy classifications and sorting", () => {
        expect(
            validateShopSearchParams({
                q: "gallery",
                shopType: ["AUCTION_HOUSE"],
                partnerStatus: ["PARTNERED"],
                sortField: "NAME",
                sortOrder: "ASC",
            } as never),
        ).toEqual({ q: "gallery" });
        expect(
            serializeShopSearchParams({ q: "gallery", shopType: ["AUCTION_HOUSE"] } as never),
        ).toEqual({ q: "gallery" });
    });
});
