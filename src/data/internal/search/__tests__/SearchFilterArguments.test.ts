import { describe, expect, it } from "vitest";
import { hasActiveFilters, hasAdvancedFilterDetails } from "../SearchFilterArguments.ts";
import type { SearchFilterArguments } from "../SearchFilterArguments.ts";

const empty: SearchFilterArguments = { q: "" };

describe("hasActiveFilters", () => {
    it("returns false for empty filters", () => {
        expect(hasActiveFilters(empty)).toBe(false);
    });

    it("returns true when priceFrom is set", () => {
        expect(hasActiveFilters({ q: "", priceFrom: 100 })).toBe(true);
    });

    it("returns true when priceTo is set", () => {
        expect(hasActiveFilters({ q: "", priceTo: 500 })).toBe(true);
    });

    it("returns true when allowedStates is set", () => {
        expect(hasActiveFilters({ q: "", allowedStates: ["LISTED"] })).toBe(true);
    });

    it("returns true when shopType is set", () => {
        expect(hasActiveFilters({ q: "", shopType: ["AUCTION_HOUSE"] })).toBe(true);
    });

    it("returns true for advanced filter (merchant)", () => {
        expect(hasActiveFilters({ q: "", merchant: ["Shop A"] })).toBe(true);
    });
});

describe("hasAdvancedFilterDetails", () => {
    it("returns false for empty filters", () => {
        expect(hasAdvancedFilterDetails(empty)).toBe(false);
    });

    it("returns true when merchant is set", () => {
        expect(hasAdvancedFilterDetails({ q: "", merchant: ["Shop A"] })).toBe(true);
    });

    it("returns true when excludeMerchant is set", () => {
        expect(hasAdvancedFilterDetails({ q: "", excludeMerchant: ["Shop B"] })).toBe(true);
    });

    it("returns true when creationDateFrom is set", () => {
        expect(hasAdvancedFilterDetails({ q: "", creationDateFrom: new Date("2024-01-01") })).toBe(
            true,
        );
    });

    it("returns true when auctionDateFrom is set", () => {
        expect(hasAdvancedFilterDetails({ q: "", auctionDateFrom: new Date("2024-06-01") })).toBe(
            true,
        );
    });

    it("returns false when merchant is empty array", () => {
        expect(hasAdvancedFilterDetails({ q: "", merchant: [] })).toBe(false);
    });
});
