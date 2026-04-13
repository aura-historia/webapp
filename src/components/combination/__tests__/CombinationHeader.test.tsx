import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CombinationHeader } from "../CombinationHeader.tsx";
import type { Combination } from "@/data/combinations/combinations.ts";
import {
    FALLBACK_CATEGORY_ASSET_URL,
    FALLBACK_CATEGORY_HEADER_ASSET_URL,
} from "@/components/landing-page/categories-section/CategoriesSection.data.ts";

const mockCombination: Combination = {
    slug: "gotische-kunst",
    periodKey: "GOTHIC",
    categoryKey: "VISUAL_ART",
    periodId: "gothic",
    categoryId: "visual-art",
    placeholderImageCategoryKey: "UNKNOWN_CATEGORY",
};

describe("CombinationHeader", () => {
    it("renders the combination name as a heading", () => {
        render(<CombinationHeader combination={mockCombination} />);
        expect(screen.getByRole("heading", { name: "Gotische Kunst" })).toBeInTheDocument();
    });

    it("renders the translated combination description", () => {
        render(<CombinationHeader combination={mockCombination} />);
        expect(screen.getByText(/gotischer Kunst/i)).toBeInTheDocument();
    });

    it("renders a different name when given different props", () => {
        const otherCombination: Combination = {
            slug: "biedermeier-moebel",
            periodKey: "BIEDERMEIER",
            categoryKey: "FURNITURE",
            periodId: "biedermeier",
            categoryId: "furniture",
            placeholderImageCategoryKey: "FURNITURE",
        };
        render(<CombinationHeader combination={otherCombination} />);
        expect(screen.getByRole("heading", { name: "Biedermeier Möbel" })).toBeInTheDocument();
    });

    it("uses category header asset for the hero image and category asset for the card image", () => {
        const { container } = render(<CombinationHeader combination={mockCombination} />);

        const heroImage = container.querySelector('img[aria-hidden="true"]');
        const cardImage = container.querySelector('img[loading="lazy"]');

        expect(heroImage).toHaveAttribute("src", FALLBACK_CATEGORY_HEADER_ASSET_URL);
        expect(cardImage).toHaveAttribute("src", FALLBACK_CATEGORY_ASSET_URL);
    });
});
