import { describe, expect, it } from "vitest";
import { validateShopSearchParams, serializeShopSearchParams } from "@/lib/shopSearchValidation.ts";

describe("shopSearchValidation", () => {
    describe("validateShopSearchParams", () => {
        it("returns an empty query when q is missing", () => {
            const result = validateShopSearchParams({} as never);
            expect(result.q).toBe("");
        });

        it("parses provided query text", () => {
            const result = validateShopSearchParams({ q: "auction" } as never);
            expect(result.q).toBe("auction");
        });

        it("parses shop types with deduplication", () => {
            const result = validateShopSearchParams({
                q: "x",
                shopType: ["AUCTION_HOUSE", "COMMERCIAL_DEALER", "AUCTION_HOUSE"],
            } as never);
            expect(result.shopType).toEqual(["AUCTION_HOUSE", "COMMERCIAL_DEALER"]);
        });

        it("filters out unsupported shop types", () => {
            const result = validateShopSearchParams({
                q: "x",
                shopType: ["UNKNOWN", "MARKETPLACE", "bogus"],
            } as never);
            expect(result.shopType).toEqual(["MARKETPLACE"]);
        });

        it("returns undefined shop types when not an array", () => {
            const result = validateShopSearchParams({
                q: "x",
                shopType: "AUCTION_HOUSE" as unknown as string[],
            } as never);
            expect(result.shopType).toBeUndefined();
        });

        it("parses partner statuses with deduplication", () => {
            const result = validateShopSearchParams({
                q: "x",
                partnerStatus: ["PARTNERED", "SCRAPED", "PARTNERED"],
            } as never);
            expect(result.partnerStatus).toEqual(["PARTNERED", "SCRAPED"]);
        });

        it("returns undefined partner statuses when not an array", () => {
            const result = validateShopSearchParams({
                q: "x",
                partnerStatus: "PARTNERED" as unknown as string[],
            } as never);
            expect(result.partnerStatus).toBeUndefined();
        });

        it("falls back to SCRAPED for unknown partner statuses", () => {
            const result = validateShopSearchParams({
                q: "x",
                partnerStatus: ["unknown-status"],
            } as never);
            expect(result.partnerStatus).toEqual(["SCRAPED"]);
        });

        it("ignores non-string partner status entries", () => {
            const result = validateShopSearchParams({
                q: "x",
                partnerStatus: [123 as unknown as string, "PARTNERED"],
            } as never);
            expect(result.partnerStatus).toEqual(["PARTNERED"]);
        });

        it("defaults sort field to RELEVANCE and order to DESC", () => {
            const result = validateShopSearchParams({ q: "x" } as never);
            expect(result.sortField).toBe("RELEVANCE");
            expect(result.sortOrder).toBe("DESC");
        });

        it("accepts valid sort fields", () => {
            const result = validateShopSearchParams({
                q: "x",
                sortField: "NAME",
                sortOrder: "ASC",
            } as never);
            expect(result.sortField).toBe("NAME");
            expect(result.sortOrder).toBe("ASC");
        });

        it("falls back to RELEVANCE for unknown sort fields", () => {
            const result = validateShopSearchParams({
                q: "x",
                sortField: "bogus",
            } as never);
            expect(result.sortField).toBe("RELEVANCE");
        });
    });

    describe("serializeShopSearchParams", () => {
        it("round-trips basic parameters", () => {
            const input = {
                q: "auction",
                shopType: ["AUCTION_HOUSE" as const],
                partnerStatus: ["PARTNERED" as const],
                sortField: "NAME" as const,
                sortOrder: "ASC" as const,
            };
            const serialized = serializeShopSearchParams(input);
            expect(serialized).toEqual({
                q: "auction",
                shopType: ["AUCTION_HOUSE"],
                partnerStatus: ["PARTNERED"],
                sortField: "NAME",
                sortOrder: "ASC",
            });
        });

        it("preserves undefined optional fields", () => {
            const serialized = serializeShopSearchParams({ q: "x" });
            expect(serialized.shopType).toBeUndefined();
            expect(serialized.partnerStatus).toBeUndefined();
            expect(serialized.sortField).toBeUndefined();
            expect(serialized.sortOrder).toBeUndefined();
        });
    });
});
