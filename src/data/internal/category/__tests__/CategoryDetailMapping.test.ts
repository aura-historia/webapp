import { describe, expect, it } from "vitest";
import type { GetCategoryData } from "@/client";
import { mapToCategoryDetail } from "../CategoryDetail.ts";

const mockCategoryData: GetCategoryData = {
    categoryId: "ancient-pottery",
    categoryKey: "ANCIENT_POTTERY",
    name: { text: "Ancient Pottery", language: "en" },
    products: 42,
    created: "2024-01-15T08:00:00Z",
    updated: "2024-06-20T12:30:00Z",
};

describe("mapToCategoryDetail", () => {
    it("extracts the text from the localized name field", () => {
        const result = mapToCategoryDetail(mockCategoryData);
        expect(result.name).toBe("Ancient Pottery");
    });

    it("passes categoryId and categoryKey through unchanged", () => {
        const result = mapToCategoryDetail(mockCategoryData);
        expect(result.categoryId).toBe("ancient-pottery");
        expect(result.categoryKey).toBe("ANCIENT_POTTERY");
    });

    it("parses the created date string into a Date object", () => {
        const result = mapToCategoryDetail(mockCategoryData);
        expect(result.created).toBeInstanceOf(Date);
        expect(result.created.toISOString()).toBe("2024-01-15T08:00:00.000Z");
    });

    it("parses the updated date string into a Date object", () => {
        const result = mapToCategoryDetail(mockCategoryData);
        expect(result.updated).toBeInstanceOf(Date);
        expect(result.updated.toISOString()).toBe("2024-06-20T12:30:00.000Z");
    });
});
