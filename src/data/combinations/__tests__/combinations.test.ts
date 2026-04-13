import { describe, expect, it } from "vitest";
import { COMBINATIONS, COMBINATION_MAP, getCombinationBySlug } from "../combinations.ts";

describe("combinations", () => {
    it("has at least 20 combinations", () => {
        expect(COMBINATIONS.length).toBeGreaterThanOrEqual(20);
    });

    it("all slugs are unique", () => {
        const slugs = COMBINATIONS.map((c) => c.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
    });

    it("all slugs are kebab-case", () => {
        for (const combination of COMBINATIONS) {
            expect(combination.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        }
    });

    it("all combinations have non-empty required fields", () => {
        for (const combination of COMBINATIONS) {
            expect(combination.slug).toBeTruthy();
            expect(combination.periodKey).toBeTruthy();
            expect(combination.categoryKey).toBeTruthy();
            expect(combination.periodId).toBeTruthy();
            expect(combination.categoryId).toBeTruthy();
            expect(combination.placeholderImageCategoryKey).toBeTruthy();
        }
    });

    it("COMBINATION_MAP contains all combinations by slug", () => {
        expect(COMBINATION_MAP.size).toBe(COMBINATIONS.length);
        for (const combination of COMBINATIONS) {
            expect(COMBINATION_MAP.get(combination.slug)).toBe(combination);
        }
    });

    it("getCombinationBySlug returns the correct combination", () => {
        expect(getCombinationBySlug("biedermeier-moebel")).toEqual(
            expect.objectContaining({
                slug: "biedermeier-moebel",
                periodKey: "BIEDERMEIER",
                categoryKey: "FURNITURE",
            }),
        );
    });

    it("getCombinationBySlug returns undefined for unknown slugs", () => {
        expect(getCombinationBySlug("non-existent")).toBeUndefined();
    });
});
