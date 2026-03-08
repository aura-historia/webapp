import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryHeader } from "../CategoryHeader.tsx";
import type { CategoryDetail } from "@/data/internal/category/CategoryDetail.ts";

const mockCategory: CategoryDetail = {
    categoryId: "ancient-pottery",
    categoryKey: "ANCIENT_POTTERY",
    name: "Ancient Pottery",
    description: "Ceramics and pottery from ancient civilisations.",
    created: new Date("2024-01-15T08:00:00Z"),
    updated: new Date("2024-06-20T12:30:00Z"),
};

describe("CategoryHeader", () => {
    it("renders the category name as a heading", () => {
        render(<CategoryHeader category={mockCategory} />);
        expect(screen.getByRole("heading", { name: "Ancient Pottery" })).toBeInTheDocument();
    });

    it("renders the category description", () => {
        render(<CategoryHeader category={mockCategory} />);
        expect(
            screen.getByText("Ceramics and pottery from ancient civilisations."),
        ).toBeInTheDocument();
    });

    it("renders a different name and description when given different props", () => {
        const otherCategory: CategoryDetail = {
            ...mockCategory,
            name: "Furniture",
            description: "Antique furniture from various periods.",
        };
        render(<CategoryHeader category={otherCategory} />);
        expect(screen.getByRole("heading", { name: "Furniture" })).toBeInTheDocument();
        expect(screen.getByText("Antique furniture from various periods.")).toBeInTheDocument();
    });
});
