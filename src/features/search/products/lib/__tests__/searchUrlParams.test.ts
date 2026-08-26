import { describe, expect, it } from "vitest";

import { FILTER_DEFAULTS } from "@/features/search/products/lib/filterDefaults.ts";
import { mapFiltersToUrlParams } from "@/features/search/products/lib/searchUrlParams.ts";

describe("mapFiltersToUrlParams", () => {
    it("maps filter values and date ranges to search URL parameters", () => {
        expect(
            mapFiltersToUrlParams({
                query: "antique vase",
                priceSpan: { min: 100, max: 500 },
                productState: ["AVAILABLE"],
                creationDate: {
                    from: new Date("2024-01-15T18:30:00.000Z"),
                    to: new Date("2024-12-31T18:30:00.000Z"),
                },
                merchant: ["Trusted dealer"],
                shopType: ["AUCTION_HOUSE"],
            }),
        ).toEqual({
            q: "antique vase",
            priceFrom: 100,
            priceTo: 500,
            allowedStates: ["AVAILABLE"],
            creationDateFrom: "2024-01-15",
            creationDateTo: "2024-12-31",
            updateDateFrom: undefined,
            updateDateTo: undefined,
            auctionDateFrom: undefined,
            auctionDateTo: undefined,
            merchant: ["Trusted dealer"],
            excludeMerchant: undefined,
            seller: undefined,
            excludeSeller: undefined,
            shopType: ["AUCTION_HOUSE"],
        });
    });

    it("uses default product states when no state filter is provided", () => {
        expect(mapFiltersToUrlParams({ query: "chair" }).allowedStates).toEqual(
            FILTER_DEFAULTS.productState,
        );
    });

    it("omits empty list filters", () => {
        const params = mapFiltersToUrlParams({
            query: "chair",
            merchant: [],
            excludeMerchant: [],
            seller: [],
            excludeSeller: [],
            shopType: [],
        });

        expect(params.merchant).toBeUndefined();
        expect(params.excludeMerchant).toBeUndefined();
        expect(params.seller).toBeUndefined();
        expect(params.excludeSeller).toBeUndefined();
        expect(params.shopType).toBeUndefined();
    });
});
