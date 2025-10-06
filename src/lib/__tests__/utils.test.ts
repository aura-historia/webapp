import { describe, expect, it } from "vitest";
import { cn, formatPrice, isSimpleSearch } from "../utils.ts";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";

describe("utils", () => {
    describe("cn", () => {
        it("should merge class names correctly", () => {
            expect(cn("foo", "bar")).toBe("foo bar");
        });

        it("should handle conditional classes", () => {
            expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
        });

        it("should merge tailwind classes correctly", () => {
            expect(cn("px-2 py-1", "px-3")).toBe("py-1 px-3");
        });

        it("should handle empty input", () => {
            expect(cn()).toBe("");
        });

        it("should handle undefined and null values", () => {
            expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
        });
    });

    describe("formatPrice", () => {
        const locale = "de-DE";

        it("formats AUD currency correctly", () => {
            expect(formatPrice({ amount: 123456, currency: "AUD" }, locale)).toBe("1.234,56 AU$");
        });

        it("formats USD currency correctly", () => {
            expect(formatPrice({ amount: 123456, currency: "USD" }, locale)).toBe("1.234,56 $");
        });

        it("formats EUR currency correctly", () => {
            expect(formatPrice({ amount: 123456, currency: "EUR" }, locale)).toBe("1.234,56 €");
        });

        it("formats GBP currency correctly", () => {
            expect(formatPrice({ amount: 123456, currency: "GBP" }, locale)).toBe("1.234,56 £");
        });

        it("formats CAD currency correctly", () => {
            expect(formatPrice({ amount: 123456, currency: "CAD" }, locale)).toBe("1.234,56 CA$");
        });

        it("formats NZD currency correctly", () => {
            expect(formatPrice({ amount: 123456, currency: "NZD" }, locale)).toBe("1.234,56 NZ$");
        });

        it("handles zero amount correctly", () => {
            expect(formatPrice({ amount: 0, currency: "USD" }, locale)).toBe("0,00 $");
        });

        it("handles negative amounts correctly", () => {
            expect(formatPrice({ amount: -123456, currency: "EUR" }, locale)).toBe("-1.234,56 €");
        });
    });

    describe("isSimpleSearch", () => {
        it("returns true when all filter fields are undefined", () => {
            const searchArgs: SearchFilterArguments = {
                q: "",
                priceFrom: undefined,
                priceTo: undefined,
                allowedStates: undefined,
                creationDateFrom: undefined,
                creationDateTo: undefined,
                updateDateFrom: undefined,
                updateDateTo: undefined,
                merchant: undefined,
            };
            expect(isSimpleSearch(searchArgs)).toBe(true);
        });

        it("returns false when priceFrom is set", () => {
            const searchArgs: SearchFilterArguments = {
                allowedStates: undefined,
                creationDateFrom: undefined,
                creationDateTo: undefined,
                merchant: undefined,
                priceTo: undefined,
                q: "",
                updateDateFrom: undefined,
                updateDateTo: undefined,
                priceFrom: 100,
            };
            expect(isSimpleSearch(searchArgs)).toBe(false);
        });

        it("returns false when priceTo is set", () => {
            const searchArgs: SearchFilterArguments = {
                allowedStates: undefined,
                creationDateFrom: undefined,
                creationDateTo: undefined,
                merchant: undefined,
                priceFrom: undefined,
                q: "",
                updateDateFrom: undefined,
                updateDateTo: undefined,
                priceTo: 500,
            };
            expect(isSimpleSearch(searchArgs)).toBe(false);
        });

        it("returns false when allowedStates is set", () => {
            const searchArgs: SearchFilterArguments = {
                creationDateFrom: undefined,
                creationDateTo: undefined,
                merchant: undefined,
                priceFrom: undefined,
                priceTo: undefined,
                q: "",
                updateDateFrom: undefined,
                updateDateTo: undefined,
                allowedStates: ["AVAILABLE", "SOLD"],
            };
            expect(isSimpleSearch(searchArgs)).toBe(false);
        });

        it("returns false when creationDateFrom is set", () => {
            const searchArgs: SearchFilterArguments = {
                allowedStates: undefined,
                creationDateTo: undefined,
                merchant: undefined,
                priceFrom: undefined,
                priceTo: undefined,
                q: "",
                updateDateFrom: undefined,
                updateDateTo: undefined,
                creationDateFrom: new Date("2024-01-01"),
            };
            expect(isSimpleSearch(searchArgs)).toBe(false);
        });

        it("returns false when creationDateTo is set", () => {
            const searchArgs: SearchFilterArguments = {
                allowedStates: undefined,
                creationDateFrom: undefined,
                merchant: undefined,
                priceFrom: undefined,
                priceTo: undefined,
                q: "",
                updateDateFrom: undefined,
                updateDateTo: undefined,
                creationDateTo: new Date("2024-12-31"),
            };
            expect(isSimpleSearch(searchArgs)).toBe(false);
        });

        it("returns false when updateDateFrom is set", () => {
            const searchArgs: SearchFilterArguments = {
                allowedStates: undefined,
                creationDateFrom: undefined,
                creationDateTo: undefined,
                merchant: undefined,
                priceFrom: undefined,
                priceTo: undefined,
                q: "",
                updateDateTo: undefined,
                updateDateFrom: new Date("2024-01-01"),
            };
            expect(isSimpleSearch(searchArgs)).toBe(false);
        });

        it("returns false when updateDateTo is set", () => {
            const searchArgs: SearchFilterArguments = {
                allowedStates: undefined,
                creationDateFrom: undefined,
                creationDateTo: undefined,
                merchant: undefined,
                priceFrom: undefined,
                priceTo: undefined,
                q: "",
                updateDateFrom: undefined,
                updateDateTo: new Date("2024-12-31"),
            };
            expect(isSimpleSearch(searchArgs)).toBe(false);
        });

        it("returns false when merchant is set", () => {
            const searchArgs: SearchFilterArguments = {
                allowedStates: undefined,
                creationDateFrom: undefined,
                creationDateTo: undefined,
                priceFrom: undefined,
                priceTo: undefined,
                q: "",
                updateDateFrom: undefined,
                updateDateTo: undefined,
                merchant: "ebay",
            };
            expect(isSimpleSearch(searchArgs)).toBe(false);
        });

        it("returns false when multiple filters are set", () => {
            const searchArgs: SearchFilterArguments = {
                creationDateFrom: undefined,
                creationDateTo: undefined,
                q: "",
                updateDateFrom: undefined,
                updateDateTo: undefined,
                priceFrom: 100,
                priceTo: 500,
                allowedStates: ["AVAILABLE"],
                merchant: "kleinanzeigen",
            };
            expect(isSimpleSearch(searchArgs)).toBe(false);
        });

        it("returns true when object is empty", () => {
            const searchArgs: SearchFilterArguments = {
                allowedStates: undefined,
                creationDateFrom: undefined,
                creationDateTo: undefined,
                merchant: undefined,
                priceFrom: undefined,
                priceTo: undefined,
                q: "",
                updateDateFrom: undefined,
                updateDateTo: undefined,
            };
            expect(isSimpleSearch(searchArgs)).toBe(true);
        });
    });
});
