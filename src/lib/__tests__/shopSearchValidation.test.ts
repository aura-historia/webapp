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
                shopType: ["AUCTION_HOUSE", "AUCTION_HOUSE", "MARKETPLACE"],
            } as never);
            expect(result.shopType).toEqual(["AUCTION_HOUSE", "MARKETPLACE"]);
        });

        it("treats unknown shop types as UNKNOWN", () => {
            const result = validateShopSearchParams({
                q: "x",
                shopType: ["bogus"],
            } as never);
            expect(result.shopType).toEqual(["UNKNOWN"]);
        });

        it("returns undefined shop types when not an array", () => {
            const result = validateShopSearchParams({
                q: "x",
                shopType: "MARKETPLACE" as unknown as string[],
            } as never);
            expect(result.shopType).toBeUndefined();
        });

        it("parses partner statuses", () => {
            const result = validateShopSearchParams({
                q: "x",
                partnerStatus: ["PARTNERED", "SCRAPED", "PARTNERED"],
            } as never);
            expect(result.partnerStatus).toEqual(["PARTNERED", "SCRAPED"]);
        });

        it("falls back to SCRAPED for unknown partner statuses", () => {
            const result = validateShopSearchParams({
                q: "x",
                partnerStatus: ["unknown-status"],
            } as never);
            expect(result.partnerStatus).toEqual(["SCRAPED"]);
        });

        it("parses optional dates", () => {
            const result = validateShopSearchParams({
                q: "x",
                creationDateFrom: "2024-01-01T00:00:00.000Z",
                updateDateTo: "2024-06-15T00:00:00.000Z",
            } as never);
            expect(result.creationDateFrom).toBeInstanceOf(Date);
            expect(result.creationDateFrom?.toISOString()).toBe("2024-01-01T00:00:00.000Z");
            expect(result.updateDateTo?.toISOString()).toBe("2024-06-15T00:00:00.000Z");
            expect(result.creationDateTo).toBeUndefined();
        });

        it("returns undefined for invalid date strings", () => {
            const result = validateShopSearchParams({
                q: "x",
                creationDateFrom: "not-a-date",
            } as never);
            expect(result.creationDateFrom).toBeUndefined();
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
                creationDateFrom: new Date("2024-01-01T00:00:00.000Z"),
                updateDateTo: new Date("2024-06-15T00:00:00.000Z"),
                sortField: "NAME" as const,
                sortOrder: "ASC" as const,
            };
            const serialized = serializeShopSearchParams(input);
            expect(serialized).toEqual({
                q: "auction",
                shopType: ["AUCTION_HOUSE"],
                partnerStatus: ["PARTNERED"],
                creationDateFrom: "2024-01-01T00:00:00.000Z",
                creationDateTo: undefined,
                updateDateFrom: undefined,
                updateDateTo: "2024-06-15T00:00:00.000Z",
                sortField: "NAME",
                sortOrder: "ASC",
            });
        });

        it("serializes undefined dates to undefined", () => {
            const serialized = serializeShopSearchParams({ q: "x" });
            expect(serialized.creationDateFrom).toBeUndefined();
            expect(serialized.updateDateFrom).toBeUndefined();
        });
    });
});
