import { describe, expect, it } from "vitest";
import type { GetCategorySummaryData } from "@/client";
import { mapToCategoryOverview } from "../CategoryOverview.ts";

const mockCategorySummaryData: GetCategorySummaryData = {
    categoryId: "ancient-pottery",
    categoryKey: "ANCIENT_POTTERY",
    name: { text: "Ancient Pottery", language: "en" },
    created: "2024-01-15T08:00:00Z",
    updated: "2024-06-20T12:30:00Z",
};

describe("mapToCategoryOverview", () => {
    it("extracts the text from the localized name field", () => {
        const result = mapToCategoryOverview(mockCategorySummaryData);
        expect(result.name).toBe("Ancient Pottery");
    });

    it("passes categoryId through unchanged", () => {
        const result = mapToCategoryOverview(mockCategorySummaryData);
        expect(result.categoryId).toBe("ancient-pottery");
    });

    it("passes categoryKey through unchanged", () => {
        const result = mapToCategoryOverview(mockCategorySummaryData);
        expect(result.categoryKey).toBe("ANCIENT_POTTERY");
    });

    it("does not include description, created, or updated fields", () => {
        const result = mapToCategoryOverview(mockCategorySummaryData);
        expect(result).not.toHaveProperty("description");
        expect(result).not.toHaveProperty("created");
        expect(result).not.toHaveProperty("updated");
    });
});
