import { describe, expect, it } from "vitest";
import { hasActiveFilters, hasAdvancedFilterDetails } from "../SearchFilterArguments.ts";
import type { SearchFilterArguments } from "../SearchFilterArguments.ts";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

const empty: SearchFilterArguments = { q: "" };
const activeCases: SearchFilterArguments[] = [
    { q: "", priceFrom: 100 },
    { q: "", availability: ["IN_STOCK"] },
    { q: "", orderability: ["ORDERABLE_NOW"] },
    { q: "", includeUnspecifiedAvailability: false },
    { q: "", excludeProductId: ["pl_1"] },
    { q: "", listingSourceId: ["ls_1"] },
    { q: "", excludeListingSourceId: ["ls_2"] },
    { q: "", auctionDateFrom: new Date("2026-01-01") },
];

describe("canonical listing search filters", () => {
    it("reports an empty query as having no active filters", () => {
        expect(hasActiveFilters(empty)).toBe(false);
    });

    it.each(activeCases)("counts supported criteria as active filters", (filters) => {
        expect(hasActiveFilters(filters)).toBe(true);
    });

    it("treats all availability values as an unfiltered default", () => {
        expect(hasActiveFilters({ q: "", availability: [...LISTING_AVAILABILITIES] })).toBe(false);
    });

    it("recognizes date and source criteria as advanced details", () => {
        expect(hasAdvancedFilterDetails({ q: "", listingSourceId: ["ls_1"] })).toBe(true);
        expect(hasAdvancedFilterDetails({ q: "", updateDateTo: new Date("2026-01-01") })).toBe(
            true,
        );
        expect(hasAdvancedFilterDetails(empty)).toBe(false);
    });
});
