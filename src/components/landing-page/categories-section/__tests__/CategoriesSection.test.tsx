import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CategoriesSection from "../CategoriesSection.tsx";
import type { CategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { renderWithRouter } from "@/test/utils.tsx";

let mockSelectedScrollSnap = 0;
let mockScrollSnapList = [0, 1, 2];

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
            selectedScrollSnap: vi.fn(() => mockSelectedScrollSnap),
            scrollSnapList: vi.fn(() => mockScrollSnapList),
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
    { categoryId: "furniture-1", categoryKey: "FURNITURE", name: "Möbel", productCount: 18000 },
    {
        categoryId: "jewelry-2",
        categoryKey: "JEWELRY_PERSONAL_ADORNMENT",
        name: "Schmuck",
        productCount: 1250,
    },
    { categoryId: "unknown-3", categoryKey: "UNKNOWN_KEY", name: "Sonstiges", productCount: 1 },
];

describe("CategoriesSection", () => {
    beforeEach(() => {
        mockSelectedScrollSnap = 0;
        mockScrollSnapList = [0, 1, 2];
    });

    it("renders the section with the categories title", async () => {
        renderWithRouter(<CategoriesSection categories={mockCategories} />);
        expect(await screen.findByText("Kategorien durchstöbern")).toBeInTheDocument();
    });

    it("renders a carousel item for each category", async () => {
        renderWithRouter(<CategoriesSection categories={mockCategories} />);
        expect(await screen.findByText("Möbel")).toBeInTheDocument();
        expect(await screen.findByText("Schmuck")).toBeInTheDocument();
        expect(await screen.findByText("Sonstiges")).toBeInTheDocument();
        expect(await screen.findByText("18.000 Objekte")).toBeInTheDocument();
        expect(await screen.findByText("1.250 Objekte")).toBeInTheDocument();
        expect(await screen.findByText("1 Objekt")).toBeInTheDocument();
    });

    it("renders links to the correct category routes", async () => {
        renderWithRouter(<CategoriesSection categories={mockCategories} />);
        const links = await screen.findAllByRole("link");
        const hrefs = links.map((l) => l.getAttribute("href"));
        expect(hrefs).toContain("/categories/furniture-1");
        expect(hrefs).toContain("/categories/jewelry-2");
        expect(hrefs).toContain("/categories/unknown-3");
    });

    it("renders the section element with the correct aria-label", async () => {
        renderWithRouter(<CategoriesSection categories={mockCategories} />);
        const section = await screen.findByRole("region", { name: "Kategorien durchstöbern" });
        expect(section).toBeInTheDocument();
    });

    it("renders carousel page bars with the first page active by default", async () => {
        renderWithRouter(<CategoriesSection categories={mockCategories} />);

        await waitFor(() => {
            const indicators = screen.getAllByTestId("carousel-page-indicator");
            expect(indicators).toHaveLength(3);
            expect(indicators[0]).toHaveAttribute("aria-current", "true");
            expect(indicators[1]).toHaveAttribute("aria-current", "false");
            expect(indicators[2]).toHaveAttribute("aria-current", "false");
        });
    });

    it("renders the selected carousel page bar from embla pagination", async () => {
        mockSelectedScrollSnap = 1;
        renderWithRouter(<CategoriesSection categories={mockCategories} />);

        await waitFor(() => {
            const indicators = screen.getAllByTestId("carousel-page-indicator");
            expect(indicators).toHaveLength(3);
            expect(indicators[0]).toHaveAttribute("aria-current", "false");
            expect(indicators[1]).toHaveAttribute("aria-current", "true");
            expect(indicators[2]).toHaveAttribute("aria-current", "false");
        });
    });

    it("renders the mobile numeric page indicator fallback", async () => {
        renderWithRouter(<CategoriesSection categories={mockCategories} />);

        await waitFor(() => {
            expect(screen.getByTestId("carousel-page-indicator-mobile")).toHaveTextContent("1 / 3");
        });
    });

    it("updates the mobile numeric fallback from embla pagination", async () => {
        mockSelectedScrollSnap = 1;
        renderWithRouter(<CategoriesSection categories={mockCategories} />);

        await waitFor(() => {
            expect(screen.getByTestId("carousel-page-indicator-mobile")).toHaveTextContent("2 / 3");
        });
    });

    it("renders one page bar for an empty categories list", async () => {
        mockScrollSnapList = [];
        renderWithRouter(<CategoriesSection categories={[]} />);

        expect(await screen.findByText("Kategorien durchstöbern")).toBeInTheDocument();
        const indicators = await screen.findAllByTestId("carousel-page-indicator");
        expect(indicators).toHaveLength(1);
        expect(indicators[0]).toHaveAttribute("aria-current", "true");
        expect(await screen.findByTestId("carousel-page-indicator-mobile")).toHaveTextContent(
            "1 / 1",
        );
        expect(screen.queryAllByRole("link")).toHaveLength(0);
    });

    it("uses the fallback icon for unknown category keys without crashing", async () => {
        renderWithRouter(<CategoriesSection categories={[mockCategories[2]]} />);
        expect(await screen.findByText("Sonstiges")).toBeInTheDocument();
    });
});
