import { describe, expect, it, vi } from "vitest";
import { mapToInternalSearchFilterMatchProductCollection } from "../SearchFilterMatchProductCollection.ts";
import type { SearchFilterMatchProductCollectionData } from "@/client";

vi.mock("@/data/internal/product/OverviewProduct.ts", () => ({
    mapPersonalizedGetProductDataToOverviewProduct: vi.fn((item: { shopId: string }) => ({
        shopId: item.shopId,
    })),
}));

const minimalItem = { shopId: "shop-1" };

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
        expect(result.items[0].shopId).toBe("shop-1");
    });

    it("maps searchAfter when present", () => {
        const data = { ...baseCollection, searchAfter: "cursor-abc" };
        const result = mapToInternalSearchFilterMatchProductCollection(data, "de");
        expect(result.searchAfter).toBe("cursor-abc");
    });

    it("maps searchAfter to undefined when null", () => {
        const data = { ...baseCollection, searchAfter: null };
        const result = mapToInternalSearchFilterMatchProductCollection(data, "de");
        expect(result.searchAfter).toBeUndefined();
    });

    it("maps total when present", () => {
        const data = { ...baseCollection, total: 42 };
        const result = mapToInternalSearchFilterMatchProductCollection(data, "de");
        expect(result.total).toBe(42);
    });

    it("maps total to undefined when null", () => {
        const data = { ...baseCollection, total: null };
        const result = mapToInternalSearchFilterMatchProductCollection(data, "de");
        expect(result.total).toBeUndefined();
    });

    it("maps empty items array", () => {
        const data = { ...baseCollection, items: [], size: 0 };
        const result = mapToInternalSearchFilterMatchProductCollection(data, "de");
        expect(result.items).toHaveLength(0);
    });
});
