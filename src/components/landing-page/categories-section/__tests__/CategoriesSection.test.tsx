import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CategoriesSection from "../CategoriesSection.tsx";
import type { CategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { renderWithRouter } from "@/test/utils.tsx";

// Mock the entire embla carousel to avoid plugin comparison errors in jsdom
vi.mock("embla-carousel-react", () => ({
    default: () => [
        vi.fn(),
        {
            on: vi.fn(),
            off: vi.fn(),
            scrollTo: vi.fn(),
            canScrollNext: vi.fn(() => false),
            canScrollPrev: vi.fn(() => false),
            selectedScrollSnap: vi.fn(() => 0),
            scrollSnapList: vi.fn(() => []),
        },
    ],
}));

vi.mock("embla-carousel-autoplay", () => ({
    default: vi.fn(() => ({
        name: "autoplay",
        options: {},
        init: vi.fn(),
        destroy: vi.fn(),
        play: vi.fn(),
        stop: vi.fn(),
    })),
}));

const mockCategories: CategoryOverview[] = [
    { categoryId: "furniture-1", categoryKey: "FURNITURE", name: "Möbel" },
    { categoryId: "jewelry-2", categoryKey: "JEWELRY_PERSONAL_ADORNMENT", name: "Schmuck" },
    { categoryId: "unknown-3", categoryKey: "UNKNOWN_KEY", name: "Sonstiges" },
];

describe("CategoriesSection", () => {
    it("renders the section with the categories title", async () => {
        await act(async () => renderWithRouter(<CategoriesSection categories={mockCategories} />));
        expect(screen.getByText("Kategorien durchstöbern")).toBeInTheDocument();
    });

    it("renders a carousel item for each category", async () => {
        await act(async () => renderWithRouter(<CategoriesSection categories={mockCategories} />));
        expect(screen.getByText("Möbel")).toBeInTheDocument();
        expect(screen.getByText("Schmuck")).toBeInTheDocument();
        expect(screen.getByText("Sonstiges")).toBeInTheDocument();
    });

    it("renders links to the correct category routes", async () => {
        await act(async () => renderWithRouter(<CategoriesSection categories={mockCategories} />));
        const links = screen.getAllByRole("link");
        const hrefs = links.map((l) => l.getAttribute("href"));
        expect(hrefs).toContain("/categories/furniture-1");
        expect(hrefs).toContain("/categories/jewelry-2");
        expect(hrefs).toContain("/categories/unknown-3");
    });

    it("renders the section element with the correct aria-label", async () => {
        await act(async () => renderWithRouter(<CategoriesSection categories={mockCategories} />));
        const section = screen.getByRole("region", { name: "Kategorien durchstöbern" });
        expect(section).toBeInTheDocument();
    });

    it("renders an empty carousel when categories list is empty", async () => {
        await act(async () => renderWithRouter(<CategoriesSection categories={[]} />));
        expect(screen.getByText("Kategorien durchstöbern")).toBeInTheDocument();
        expect(screen.queryAllByRole("link")).toHaveLength(0);
    });

    it("uses the fallback icon for unknown category keys without crashing", async () => {
        await act(async () =>
            renderWithRouter(<CategoriesSection categories={[mockCategories[2]]} />),
        );
        expect(screen.getByText("Sonstiges")).toBeInTheDocument();
    });
});
