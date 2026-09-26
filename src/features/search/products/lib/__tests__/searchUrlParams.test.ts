import { describe, expect, it } from "vitest";

import { mapFiltersToUrlParams } from "@/features/search/products/lib/searchUrlParams.ts";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

describe("mapFiltersToUrlParams", () => {
    it("maps price, availability, source IDs, and date ranges to canonical URL fields", () => {
        expect(
            mapFiltersToUrlParams({
                query: "antique vase",
                priceSpan: { min: 100, max: 500 },
                availability: ["IN_STOCK", "SOLD_OUT"],
                listingSourceId: ["ls_1"],
                excludeListingSourceId: ["ls_2"],
                listingSourceLabels: ["Source One"],
                excludeListingSourceLabels: ["Source Two"],
                creationDate: {
                    from: new Date("2024-01-15T18:30:00.000Z"),
                    to: new Date("2024-12-31T18:30:00.000Z"),
                },
            }),
        ).toMatchObject({
            q: "antique vase",
            priceFrom: 100,
            priceTo: 500,
            availability: ["IN_STOCK", "SOLD_OUT"],
            listingSourceId: ["ls_1"],
            excludeListingSourceId: ["ls_2"],
            listingSourceLabels: ["Source One"],
            excludeListingSourceLabels: ["Source Two"],
            creationDateFrom: "2024-01-15",
            creationDateTo: "2024-12-31",
        });
    });

    it("does not filter out listings with nullable availability by default", () => {
        expect(
            mapFiltersToUrlParams({ query: "chair", availability: [...LISTING_AVAILABILITIES] })
                .availability,
        ).toBeUndefined();
    });

    it("omits empty source selections", () => {
        const params = mapFiltersToUrlParams({
            query: "chair",
            listingSourceId: [],
            excludeListingSourceId: [],
        });
        expect(params.listingSourceId).toBeUndefined();
        expect(params.excludeListingSourceId).toBeUndefined();
    });
});
