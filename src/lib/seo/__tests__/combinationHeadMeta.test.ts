import { describe, expect, it, vi } from "vitest";
import { generateCombinationHeadMeta } from "../combinationHeadMeta.ts";
import type { Combination } from "@/data/combinations/combinations.ts";

vi.mock("@/i18n/i18n.ts", () => ({
    default: {
        exists: (key: string) => key === "combination.descriptions.biedermeier-moebel",
        t: (key: string) => {
            if (key === "meta.combination.defaultName") return "Sammlung";
            if (key === "meta.siteName") return "Aura Historia";
            if (key === "combination.names.biedermeier-moebel") return "Biedermeier Möbel";
            if (key === "combination.descriptions.biedermeier-moebel") {
                return "Sammler, die nach authentischen Biedermeier-Möbeln suchen, finden hier schlichte Eleganz aus der Zeit von 1815 bis 1848.";
            }
            if (key === "combination.descriptions.default") {
                return "Entdecken Sie sorgfältig kuratierte Objekte dieser Sammlung.";
            }
            return key;
        },
    },
}));

vi.mock("@/env", () => ({
    env: {
        VITE_APP_URL: "https://aura-historia.com",
    },
}));

const mockCombination: Combination = {
    slug: "biedermeier-moebel",
    periodKey: "BIEDERMEIER",
    categoryKey: "FURNITURE",
    periodId: "biedermeier",
    categoryId: "furniture",
    placeholderImageCategoryKey: "FURNITURE",
};

describe("generateCombinationHeadMeta", () => {
    it("generates correct title and description", () => {
        const result = generateCombinationHeadMeta(mockCombination);

        expect(result.meta).toContainEqual({
            title: "Biedermeier Möbel | Aura Historia",
        });

        expect(result.meta).toContainEqual({
            name: "description",
            content:
                "Sammler, die nach authentischen Biedermeier-Möbeln suchen, finden hier schlichte Eleganz aus der Zeit von 1815 bis 1848.",
        });
    });

    it("includes Open Graph tags", () => {
        const result = generateCombinationHeadMeta(mockCombination);

        expect(result.meta).toContainEqual({
            property: "og:title",
            content: "Biedermeier Möbel",
        });

        expect(result.meta).toContainEqual({
            property: "og:description",
            content:
                "Sammler, die nach authentischen Biedermeier-Möbeln suchen, finden hier schlichte Eleganz aus der Zeit von 1815 bis 1848.",
        });
        expect(result.meta).toContainEqual({
            property: "og:url",
            content: "https://aura-historia.com/collections/biedermeier-moebel",
        });

        expect(result.meta).toContainEqual({
            name: "twitter:description",
            content:
                "Sammler, die nach authentischen Biedermeier-Möbeln suchen, finden hier schlichte Eleganz aus der Zeit von 1815 bis 1848.",
        });
    });

    it("includes canonical link", () => {
        const result = generateCombinationHeadMeta(mockCombination);

        expect(result.links).toContainEqual({
            rel: "canonical",
            href: "https://aura-historia.com/collections/biedermeier-moebel",
        });
    });

    it("uses default name if combination is undefined", () => {
        const result = generateCombinationHeadMeta(undefined);

        expect(result.meta).toContainEqual({
            title: "Sammlung | Aura Historia",
        });
    });

    it("includes JSON-LD script when combination is defined", () => {
        const result = generateCombinationHeadMeta(mockCombination);

        expect(result.scripts).toHaveLength(1);
        expect(result.scripts[0]).toEqual(
            expect.objectContaining({
                type: "application/ld+json",
            }),
        );

        const jsonLd = JSON.parse(result.scripts[0].children);
        expect(jsonLd["@type"]).toBe("CollectionPage");
        expect(jsonLd.name).toBe("Biedermeier Möbel");
    });

    it("includes no JSON-LD script when combination is undefined", () => {
        const result = generateCombinationHeadMeta(undefined);
        expect(result.scripts).toHaveLength(0);
    });
});
