import { describe, expect, it } from "vitest";

import {
    serializeSearchParams,
    validateSearchParams,
    type RawSearchParams,
} from "@/features/search/products/lib/searchValidation.ts";

describe("validateSearchParams", () => {
    it("parses supported listing search filters and normalizes repeated source IDs", () => {
        const result = validateSearchParams({
            q: "antique vase",
            enhancedSearchDescription: "blue porcelain",
            excludeProductId: ["pl_1", "pl_1"],
            listingSourceId: ["ls_1", "ls_2"],
            excludeListingSourceId: "ls_3",
            availability: ["IN_STOCK", "SOLD_OUT", "IN_STOCK", "NOT_A_VALUE"],
            priceFrom: "100" as unknown as number,
            creationDateFrom: "2026-01-01T00:00:00.000Z",
            auctionDateTo: "2026-03-01T00:00:00.000Z",
            sortField: "CREATION_DATE",
            sortOrder: "ASC",
        } as unknown as RawSearchParams);

        expect(result).toMatchObject({
            q: "antique vase",
            enhancedSearchDescription: "blue porcelain",
            excludeProductId: ["pl_1"],
            listingSourceId: ["ls_1", "ls_2"],
            excludeListingSourceId: ["ls_3"],
            availability: ["IN_STOCK", "SOLD_OUT"],
            priceFrom: 100,
            creationDateFrom: new Date("2026-01-01T00:00:00.000Z"),
            auctionDateTo: new Date("2026-03-01T00:00:00.000Z"),
            sortField: "CREATION_DATE",
            sortOrder: "ASC",
            legacyFiltersRemoved: false,
        });
    });

    it("removes old search filters and obsolete price sorting with a visible feedback flag", () => {
        const result = validateSearchParams({
            q: "vase",
            merchant: ["Old Dealer"],
            sellerName: "Old Seller",
            shopType: ["AUCTION_HOUSE"],
            category: "ceramics",
            sortField: "PRICE",
            sortOrder: "ASC",
        } as unknown as RawSearchParams);

        expect(result).toMatchObject({ q: "vase", sortField: "RELEVANCE", sortOrder: "ASC" });
        expect(result.legacyFiltersRemoved).toBe(true);
        expect(result).not.toHaveProperty("merchant");
        expect(result).not.toHaveProperty("sellerName");
        expect(result).not.toHaveProperty("shopType");
    });

    it("uses safe defaults for invalid dates, sort, and array parameters", () => {
        const result = validateSearchParams({
            priceFrom: "not-a-number" as unknown as number,
            availability: "IN_STOCK" as unknown as [],
            creationDateFrom: "not-a-date",
            sortField: "INVALID",
            sortOrder: "sideways",
        } as unknown as RawSearchParams);

        expect(result).toMatchObject({ q: "", sortField: "RELEVANCE", sortOrder: "DESC" });
        expect(result.priceFrom).toBeUndefined();
        expect(result.availability).toBeUndefined();
        expect(result.creationDateFrom).toBeUndefined();
    });
});

describe("serializeSearchParams", () => {
    it("preserves supported arrays and ranges for filter and sort navigation", () => {
        const validated = validateSearchParams({
            q: "chair",
            listingSourceId: ["ls_1", "ls_2"],
            excludeListingSourceId: ["ls_3"],
            availability: ["AVAILABLE", "IN_STOCK"],
            creationDateFrom: "2026-01-01T00:00:00.000Z",
            sortField: "UPDATE_DATE",
        } as RawSearchParams);

        const serialized = serializeSearchParams(validated);
        expect(serialized).toMatchObject({
            q: "chair",
            listingSourceId: ["ls_1", "ls_2"],
            excludeListingSourceId: ["ls_3"],
            availability: ["AVAILABLE", "IN_STOCK"],
            creationDateFrom: "2026-01-01T00:00:00.000Z",
            sortField: "UPDATE_DATE",
        });
        expect(serialized).not.toHaveProperty("legacyFiltersRemoved");
    });
});
