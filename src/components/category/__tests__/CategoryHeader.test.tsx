import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryHeader } from "../CategoryHeader.tsx";
import type { CategoryDetail } from "@/data/internal/category/CategoryDetail.ts";

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

    // TODO: Add back
    // it("renders the category description", () => {
    //     render(<CategoryHeader category={mockCategory} />);
    //     expect(
    //         screen.getByText("Ceramics and pottery from ancient civilisations."),
    //     ).toBeInTheDocument();
    // });

    it("renders a different name when given different props", () => {
        const otherCategory: CategoryDetail = {
            ...mockCategory,
            name: "Furniture",
            productCount: 100,
        };
        render(<CategoryHeader category={otherCategory} />);
        expect(screen.getByRole("heading", { name: "Furniture" })).toBeInTheDocument();
    });
});
