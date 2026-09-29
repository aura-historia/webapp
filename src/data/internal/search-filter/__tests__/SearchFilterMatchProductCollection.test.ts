import { describe, expect, it, vi } from "vitest";
import { mapToInternalSearchFilterMatchProductCollection } from "../SearchFilterMatchProductCollection.ts";
import type { SearchFilterMatchProductCollectionData } from "@/client";

vi.mock("@/data/internal/product/ProductListing.ts", () => ({
    mapPersonalizedProductListingDetails: vi.fn((item: { productListingId: string }) => ({
        productListingId: item.productListingId,
    })),
}));

const minimalItem = { productListingId: "listing-1" };

const baseCollection: SearchFilterMatchProductCollectionData = {
    items: [minimalItem as never],
    size: 1,
};

describe("mapToInternalSearchFilterMatchProductCollection", () => {
    it("maps size correctly", () => {
        const result = mapToInternalSearchFilterMatchProductCollection(baseCollection, "de");
        expect(result.size).toBe(1);
    });

    it("maps items array", () => {
        const result = mapToInternalSearchFilterMatchProductCollection(baseCollection, "de");
        expect(result.items).toHaveLength(1);
        expect(result.items[0].productListingId).toBe("listing-1");
    });

    it("serializes the returned timestamp/listing cursor as a query value", () => {
        const cursor: [string, string] = ["2026-09-20T12:00:00Z", "listing-1"];
        const data = { ...baseCollection, searchAfter: cursor };
        const result = mapToInternalSearchFilterMatchProductCollection(data, "de");
        expect(result.searchAfter).toBe(JSON.stringify(cursor));
    });

    it("maps an omitted terminal cursor to undefined", () => {
        const data = { ...baseCollection, searchAfter: undefined };
        const result = mapToInternalSearchFilterMatchProductCollection(data, "de");
        expect(result.searchAfter).toBeUndefined();
    });

    it("maps total when present", () => {
        const data = { ...baseCollection, total: 42 };
        const result = mapToInternalSearchFilterMatchProductCollection(data, "de");
        expect(result.total).toBe(42);
    });

    it("maps total to undefined when null", () => {
        const data = {
            ...baseCollection,
            total: null,
        } as unknown as SearchFilterMatchProductCollectionData;
        const result = mapToInternalSearchFilterMatchProductCollection(data, "de");
        expect(result.total).toBeUndefined();
    });

    it("maps empty items array", () => {
        const data = { ...baseCollection, items: [], size: 0 };
        const result = mapToInternalSearchFilterMatchProductCollection(data, "de");
        expect(result.items).toHaveLength(0);
    });
});
