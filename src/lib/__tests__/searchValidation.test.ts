import { describe, expect, it } from "vitest";
import {
    validateSearchParams,
    serializeSearchParams,
    type RawSearchParams,
} from "@/lib/searchValidation.ts";

describe("validateSearchParams", () => {
    describe("query parameter (q)", () => {
        it("should return empty string when q is undefined", () => {
            const result = validateSearchParams({ q: undefined } as unknown as RawSearchParams);
            expect(result.q).toBe("");
        });

        it("should return the query string as-is", () => {
            const result = validateSearchParams({ q: "test query" } as RawSearchParams);
            expect(result.q).toBe("test query");
        });
    });

    describe("price parameters", () => {
        it("should parse valid priceFrom", () => {
            const result = validateSearchParams({ q: "test", priceFrom: 100 } as RawSearchParams);
            expect(result.priceFrom).toBe(100);
        });

        it("should parse valid priceTo", () => {
            const result = validateSearchParams({ q: "test", priceTo: 500 } as RawSearchParams);
            expect(result.priceTo).toBe(500);
        });

        it("should return undefined for NaN priceFrom", () => {
            const result = validateSearchParams({
                q: "test",
                priceFrom: Number.NaN,
            } as RawSearchParams);
            expect(result.priceFrom).toBeUndefined();
        });

        it("should return undefined for NaN priceTo", () => {
            const result = validateSearchParams({
                q: "test",
                priceTo: Number.NaN,
            } as RawSearchParams);
            expect(result.priceTo).toBeUndefined();
        });

        it("should handle undefined price parameters", () => {
            const result = validateSearchParams({ q: "test" } as RawSearchParams);
            expect(result.priceFrom).toBeUndefined();
            expect(result.priceTo).toBeUndefined();
        });
    });

    describe("date parameters", () => {
        it("should parse valid creationDateFrom", () => {
            const result = validateSearchParams({
                q: "test",
                creationDateFrom: "2024-01-15",
            } as RawSearchParams);
            expect(result.creationDateFrom).toEqual(new Date("2024-01-15"));
        });

        it("should parse valid creationDateTo", () => {
            const result = validateSearchParams({
                q: "test",
                creationDateTo: "2024-12-31",
            } as RawSearchParams);
            expect(result.creationDateTo).toEqual(new Date("2024-12-31"));
        });

        it("should parse valid updateDateFrom", () => {
            const result = validateSearchParams({
                q: "test",
                updateDateFrom: "2024-06-01",
            } as RawSearchParams);
            expect(result.updateDateFrom).toEqual(new Date("2024-06-01"));
        });

        it("should parse valid updateDateTo", () => {
            const result = validateSearchParams({
                q: "test",
                updateDateTo: "2024-06-30",
            } as RawSearchParams);
            expect(result.updateDateTo).toEqual(new Date("2024-06-30"));
        });

        it("should return undefined for invalid date strings", () => {
            const result = validateSearchParams({
                q: "test",
                creationDateFrom: "invalid-date",
            } as RawSearchParams);
            expect(result.creationDateFrom).toBeUndefined();
        });

        it("should return undefined for undefined date parameters", () => {
            const result = validateSearchParams({ q: "test" } as RawSearchParams);
            expect(result.creationDateFrom).toBeUndefined();
            expect(result.creationDateTo).toBeUndefined();
            expect(result.updateDateFrom).toBeUndefined();
            expect(result.updateDateTo).toBeUndefined();
        });
    });

    describe("allowedStates parameter", () => {
        it("should parse valid product states array", () => {
            const result = validateSearchParams({
                q: "test",
                allowedStates: ["LISTED", "SOLD"],
            } as RawSearchParams);
            expect(result.allowedStates).toEqual(["LISTED", "SOLD"]);
        });

        it("should deduplicate product states", () => {
            const result = validateSearchParams({
                q: "test",
                allowedStates: ["LISTED", "LISTED", "SOLD"],
            } as RawSearchParams);
            expect(result.allowedStates).toEqual(["LISTED", "SOLD"]);
        });

        it("should return undefined when allowedStates is not an array", () => {
            const result = validateSearchParams({
                q: "test",
                allowedStates: "LISTED" as unknown as [],
            } as unknown as RawSearchParams);
            expect(result.allowedStates).toBeUndefined();
        });

        it("should return undefined when allowedStates is undefined", () => {
            const result = validateSearchParams({ q: "test" } as RawSearchParams);
            expect(result.allowedStates).toBeUndefined();
        });
    });

    describe("merchant parameter", () => {
        it("should handle merchant as array", () => {
            const result = validateSearchParams({
                q: "test",
                merchant: ["Shop A", "Shop B"],
            } as RawSearchParams);
            expect(result.merchant).toEqual(["Shop A", "Shop B"]);
        });

        it("should convert single merchant string to array", () => {
            const result = validateSearchParams({
                q: "test",
                merchant: "Single Shop",
            } as RawSearchParams);
            expect(result.merchant).toEqual(["Single Shop"]);
        });

        it("should return undefined when merchant is undefined", () => {
            const result = validateSearchParams({ q: "test" } as RawSearchParams);
            expect(result.merchant).toBeUndefined();
        });
    });

    describe("excludeMerchant parameter", () => {
        it("should handle excludeMerchant as array", () => {
            const result = validateSearchParams({
                q: "test",
                excludeMerchant: ["Shop A", "Shop B"],
            } as RawSearchParams);
            expect(result.excludeMerchant).toEqual(["Shop A", "Shop B"]);
        });

        it("should convert single excludeMerchant string to array", () => {
            const result = validateSearchParams({
                q: "test",
                excludeMerchant: "Single Shop",
            } as RawSearchParams);
            expect(result.excludeMerchant).toEqual(["Single Shop"]);
        });

        it("should return undefined when excludeMerchant is undefined", () => {
            const result = validateSearchParams({ q: "test" } as RawSearchParams);
            expect(result.excludeMerchant).toBeUndefined();
        });
    });

    describe("shopType parameter", () => {
        it("should parse valid shop types array", () => {
            const result = validateSearchParams({
                q: "test",
                shopType: ["AUCTION_HOUSE", "COMMERCIAL_DEALER"],
            } as RawSearchParams);
            expect(result.shopType).toEqual(["AUCTION_HOUSE", "COMMERCIAL_DEALER"]);
        });

        it("should deduplicate shop types", () => {
            const result = validateSearchParams({
                q: "test",
                shopType: ["AUCTION_HOUSE", "AUCTION_HOUSE", "MARKETPLACE"],
            } as RawSearchParams);
            expect(result.shopType).toEqual(["AUCTION_HOUSE", "MARKETPLACE"]);
        });

        it("should parse shop types case-insensitively", () => {
            const result = validateSearchParams({
                q: "test",
                shopType: ["auction_house", "COMMERCIAL_DEALER"] as any,
            } as RawSearchParams);
            expect(result.shopType).toEqual(["AUCTION_HOUSE", "COMMERCIAL_DEALER"]);
        });

        it("should return undefined when shopType is not an array", () => {
            const result = validateSearchParams({
                q: "test",
                shopType: "AUCTION_HOUSE" as any,
            } as RawSearchParams);
            expect(result.shopType).toBeUndefined();
        });

        it("should return undefined when shopType is undefined", () => {
            const result = validateSearchParams({ q: "test" } as RawSearchParams);
            expect(result.shopType).toBeUndefined();
        });
    });

    describe("sort parameters", () => {
        it("should parse valid sortField", () => {
            const result = validateSearchParams({
                q: "test",
                sortField: "PRICE",
            } as RawSearchParams);
            expect(result.sortField).toBe("PRICE");
        });

        it("should default to RELEVANCE for invalid sortField", () => {
            const result = validateSearchParams({
                q: "test",
                sortField: "INVALID",
            } as RawSearchParams);
            expect(result.sortField).toBe("RELEVANCE");
        });

        it("should default to RELEVANCE when sortField is undefined", () => {
            const result = validateSearchParams({ q: "test" } as RawSearchParams);
            expect(result.sortField).toBe("RELEVANCE");
        });

        it("should parse ASC sortOrder", () => {
            const result = validateSearchParams({
                q: "test",
                sortOrder: "ASC",
            } as RawSearchParams);
            expect(result.sortOrder).toBe("ASC");
        });

        it("should parse DESC sortOrder", () => {
            const result = validateSearchParams({
                q: "test",
                sortOrder: "DESC",
            } as RawSearchParams);
            expect(result.sortOrder).toBe("DESC");
        });

        it("should default to DESC for invalid sortOrder", () => {
            const result = validateSearchParams({
                q: "test",
                sortOrder: "INVALID",
            } as RawSearchParams);
            expect(result.sortOrder).toBe("DESC");
        });

        it("should default to DESC when sortOrder is undefined", () => {
            const result = validateSearchParams({ q: "test" } as RawSearchParams);
            expect(result.sortOrder).toBe("DESC");
        });
    });

    describe("complete search params", () => {
        it("should correctly parse all parameters together", () => {
            const result = validateSearchParams({
                q: "antique vase",
                priceFrom: 100,
                priceTo: 1000,
                allowedStates: ["LISTED", "AVAILABLE"],
                creationDateFrom: "2024-01-01",
                creationDateTo: "2024-12-31",
                updateDateFrom: "2024-06-01",
                updateDateTo: "2024-06-30",
                merchant: ["Antique Shop", "Vintage Store"],
                excludeMerchant: ["Excluded Shop"],
                shopType: ["AUCTION_HOUSE", "COMMERCIAL_DEALER"],
                sortField: "PRICE",
                sortOrder: "ASC",
            } as RawSearchParams);

            expect(result).toEqual({
                q: "antique vase",
                priceFrom: 100,
                priceTo: 1000,
                allowedStates: ["LISTED", "AVAILABLE"],
                creationDateFrom: new Date("2024-01-01"),
                creationDateTo: new Date("2024-12-31"),
                updateDateFrom: new Date("2024-06-01"),
                updateDateTo: new Date("2024-06-30"),
                merchant: ["Antique Shop", "Vintage Store"],
                excludeMerchant: ["Excluded Shop"],
                shopType: ["AUCTION_HOUSE", "COMMERCIAL_DEALER"],
                sortField: "PRICE",
                sortOrder: "ASC",
            });
        });
    });
});

describe("serializeSearchParams", () => {
    describe("date serialization", () => {
        it("should convert Date objects to ISO strings", () => {
            const validated = validateSearchParams({
                q: "test",
                creationDateFrom: "2024-01-15T00:00:00.000Z",
                creationDateTo: "2024-12-31T00:00:00.000Z",
            } as RawSearchParams);

            const serialized = serializeSearchParams(validated);

            expect(typeof serialized.creationDateFrom).toBe("string");
            expect(typeof serialized.creationDateTo).toBe("string");
            expect(serialized.creationDateFrom).toContain("2024-01-15");
            expect(serialized.creationDateTo).toContain("2024-12-31");
        });

        it("should handle undefined date fields", () => {
            const validated = validateSearchParams({
                q: "test",
            } as RawSearchParams);

            const serialized = serializeSearchParams(validated);

            expect(serialized.creationDateFrom).toBeUndefined();
            expect(serialized.creationDateTo).toBeUndefined();
            expect(serialized.updateDateFrom).toBeUndefined();
            expect(serialized.updateDateTo).toBeUndefined();
            expect(serialized.auctionDateFrom).toBeUndefined();
            expect(serialized.auctionDateTo).toBeUndefined();
        });

        it("should serialize all date fields correctly", () => {
            const validated = validateSearchParams({
                q: "test",
                creationDateFrom: "2024-01-01T00:00:00.000Z",
                creationDateTo: "2024-01-31T00:00:00.000Z",
                updateDateFrom: "2024-02-01T00:00:00.000Z",
                updateDateTo: "2024-02-28T00:00:00.000Z",
                auctionDateFrom: "2024-03-01T00:00:00.000Z",
                auctionDateTo: "2024-03-31T00:00:00.000Z",
            } as RawSearchParams);

            const serialized = serializeSearchParams(validated);

            expect(serialized.creationDateFrom).toContain("2024-01-01");
            expect(serialized.creationDateTo).toContain("2024-01-31");
            expect(serialized.updateDateFrom).toContain("2024-02-01");
            expect(serialized.updateDateTo).toContain("2024-02-28");
            expect(serialized.auctionDateFrom).toContain("2024-03-01");
            expect(serialized.auctionDateTo).toContain("2024-03-31");
        });
    });

    describe("non-date field preservation", () => {
        it("should preserve query parameter", () => {
            const validated = validateSearchParams({
                q: "antique furniture",
            } as RawSearchParams);

            const serialized = serializeSearchParams(validated);

            expect(serialized.q).toBe("antique furniture");
        });

        it("should preserve price parameters", () => {
            const validated = validateSearchParams({
                q: "test",
                priceFrom: 100,
                priceTo: 5000,
            } as RawSearchParams);

            const serialized = serializeSearchParams(validated);

            expect(serialized.priceFrom).toBe(100);
            expect(serialized.priceTo).toBe(5000);
        });

        it("should preserve sort parameters", () => {
            const validated = validateSearchParams({
                q: "test",
                sortField: "PRICE",
                sortOrder: "ASC",
            } as RawSearchParams);

            const serialized = serializeSearchParams(validated);

            expect(serialized.sortField).toBe("PRICE");
            expect(serialized.sortOrder).toBe("ASC");
        });

        it("should preserve array parameters", () => {
            const validated = validateSearchParams({
                q: "test",
                allowedStates: ["LISTED", "SOLD"],
                merchant: ["Shop A", "Shop B"],
                excludeMerchant: ["Excluded Shop"],
                shopType: ["AUCTION_HOUSE"],
                authenticity: ["ORIGINAL"],
                condition: ["EXCELLENT"],
            } as RawSearchParams);

            const serialized = serializeSearchParams(validated);

            expect(serialized.allowedStates).toEqual(["LISTED", "SOLD"]);
            expect(serialized.merchant).toEqual(["Shop A", "Shop B"]);
            expect(serialized.excludeMerchant).toEqual(["Excluded Shop"]);
            expect(serialized.shopType).toEqual(["AUCTION_HOUSE"]);
            expect(serialized.authenticity).toEqual(["ORIGINAL"]);
            expect(serialized.condition).toEqual(["EXCELLENT"]);
        });
    });

    describe("round-trip validation (the original bug scenario)", () => {
        it("should preserve all filters when updating only sort mode", () => {
            // This test covers the bug where changing sort mode would lose filters
            const original = {
                q: "antique vase",
                priceFrom: 100,
                priceTo: 1000,
                allowedStates: ["LISTED", "AVAILABLE"],
                creationDateFrom: "2024-01-01T00:00:00.000Z",
                creationDateTo: "2024-12-31T00:00:00.000Z",
                merchant: ["Antique Shop"],
                shopType: ["AUCTION_HOUSE"],
                sortField: "RELEVANCE",
                sortOrder: "DESC",
            } as unknown as RawSearchParams;

            // Simulate what happens when validateSearch runs (like in TanStack Router)
            const validated = validateSearchParams(original);

            // Simulate updating sort mode (spread serialized prev + new sort)
            const updated = {
                ...serializeSearchParams(validated),
                sortField: "PRICE" as const,
                sortOrder: "ASC" as const,
            };

            // Verify all original filters are preserved
            expect(updated.q).toBe("antique vase");
            expect(updated.priceFrom).toBe(100);
            expect(updated.priceTo).toBe(1000);
            expect(updated.allowedStates).toEqual(["LISTED", "AVAILABLE"]);
            expect(updated.creationDateFrom).toContain("2024-01-01");
            expect(updated.creationDateTo).toContain("2024-12-31");
            expect(updated.merchant).toEqual(["Antique Shop"]);
            expect(updated.shopType).toEqual(["AUCTION_HOUSE"]);

            // Verify sort mode is updated
            expect(updated.sortField).toBe("PRICE");
            expect(updated.sortOrder).toBe("ASC");
        });

        it("should produce params that can be re-validated correctly", () => {
            // Ensure the serialized params can go through validation again
            const original = {
                q: "test",
                creationDateFrom: "2024-06-15T12:00:00.000Z",
                priceFrom: 500,
                sortField: "CREATION_DATE",
                sortOrder: "ASC",
            } as unknown as RawSearchParams;

            const validated = validateSearchParams(original);
            const serialized = serializeSearchParams(validated);
            const revalidated = validateSearchParams(serialized as RawSearchParams);

            expect(revalidated.q).toBe("test");
            expect(revalidated.priceFrom).toBe(500);
            expect(revalidated.sortField).toBe("CREATION_DATE");
            expect(revalidated.sortOrder).toBe("ASC");
            // Date should be parsed correctly again
            expect(revalidated.creationDateFrom).toBeInstanceOf(Date);
            expect(revalidated.creationDateFrom?.toISOString()).toContain("2024-06-15");
        });

        it("should handle empty/minimal params", () => {
            const validated = validateSearchParams({ q: "" } as RawSearchParams);
            const serialized = serializeSearchParams(validated);

            expect(serialized.q).toBe("");
            expect(serialized.sortField).toBe("RELEVANCE");
            expect(serialized.sortOrder).toBe("DESC");
        });
    });
});
