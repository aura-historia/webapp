import type { GetCategoryData } from "@/client";
import { render, screen } from "@testing-library/react";
import { CategoryPage } from "../CategoryPage.tsx";
import { vi } from "vitest";
import type React from "react";

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({ children, ...props }: { children: React.ReactNode }) => (
            <a {...props}>{children}</a>
        ),
    };
});

vi.mock("@/components/category/CategoryProductSection.tsx", () => ({
    CategoryProductSection: ({ title, categoryId }: { title: string; categoryId: string }) => (
        <div data-testid={`product-section-${categoryId}`}>{title}</div>
    ),
}));

describe("CategoryPage", () => {
    const mockCategory: GetCategoryData = {
        categoryId: "musical-instruments",
        categoryKey: "musical_instruments",
        name: { text: "Musikinstrumente", language: "de" },
        description: {
            text: "Entdecken Sie antike Musikinstrumente aus verschiedenen Epochen.",
            language: "de",
        },
        created: "2024-01-01T00:00:00Z",
        updated: "2024-06-01T00:00:00Z",
    };

    it("should render the category name in the banner", () => {
        render(<CategoryPage category={mockCategory} />);
        expect(screen.getByText("Musikinstrumente")).toBeInTheDocument();
    });

    it("should render the category description", () => {
        render(<CategoryPage category={mockCategory} />);
        expect(
            screen.getByText("Entdecken Sie antike Musikinstrumente aus verschiedenen Epochen."),
        ).toBeInTheDocument();
    });

    it("should render the banner image", () => {
        const { container } = render(<CategoryPage category={mockCategory} />);
        const bannerImg = container.querySelector("img");
        expect(bannerImg).toBeInTheDocument();
        expect(bannerImg).toHaveAttribute("alt", "Musikinstrumente");
    });

    it("should render product sections", () => {
        render(<CategoryPage category={mockCategory} />);
        expect(screen.getByText("Neueste Produkte")).toBeInTheDocument();
        expect(screen.getByText("Wertvollste")).toBeInTheDocument();
    });

    it("should not render description when empty", () => {
        const categoryWithoutDescription: GetCategoryData = {
            ...mockCategory,
            description: { text: "", language: "de" },
        };
        render(<CategoryPage category={categoryWithoutDescription} />);

        expect(
            screen.queryByText("Entdecken Sie antike Musikinstrumente aus verschiedenen Epochen."),
        ).not.toBeInTheDocument();
    });
});
