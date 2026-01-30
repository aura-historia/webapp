import { describe, expect, it } from "vitest";
import { validateSearchParams, type RawSearchParams } from "@/lib/searchValidation.ts";

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
                sortField: "PRICE",
                sortOrder: "ASC",
            });
        });
    });
});
