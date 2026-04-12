import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryHeader } from "../CategoryHeader.tsx";
import type { CategoryDetail } from "@/data/internal/category/CategoryDetail.ts";
import {
    FALLBACK_CATEGORY_ASSET_URL,
    FALLBACK_CATEGORY_HEADER_ASSET_URL,
} from "@/components/landing-page/categories-section/CategoriesSection.data.ts";

const mockCategory: CategoryDetail = {
    categoryId: "ancient-pottery",
    categoryKey: "ANCIENT_POTTERY",
    name: "Ancient Pottery",
    productCount: 20,
    created: new Date("2024-01-15T08:00:00Z"),
    updated: new Date("2024-06-20T12:30:00Z"),
};

describe("CategoryHeader", () => {
    it("renders the category name as a heading", () => {
        render(<CategoryHeader category={mockCategory} />);
        expect(screen.getByRole("heading", { name: "Ancient Pottery" })).toBeInTheDocument();
    });

    it("renders the translated category description", () => {
        render(<CategoryHeader category={mockCategory} />);
        expect(screen.getByText(/Tonobjekte aus antiken Kulturen/i)).toBeInTheDocument();
    });

    it("renders a different name when given different props", () => {
        const otherCategory: CategoryDetail = {
            ...mockCategory,
            name: "Furniture",
            productCount: 100,
        };
        render(<CategoryHeader category={otherCategory} />);
        expect(screen.getByRole("heading", { name: "Furniture" })).toBeInTheDocument();
    });

    it("uses the header asset for the hero image and the regular asset for the card image", () => {
        const { container } = render(<CategoryHeader category={mockCategory} />);

        const heroImage = container.querySelector('img[aria-hidden="true"]');
        const cardImage = container.querySelector('img[loading="lazy"]');

        expect(heroImage).toHaveAttribute("src", FALLBACK_CATEGORY_HEADER_ASSET_URL);
        expect(cardImage).toHaveAttribute("src", FALLBACK_CATEGORY_ASSET_URL);
    });
});
