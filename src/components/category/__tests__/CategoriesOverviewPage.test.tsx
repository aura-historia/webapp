import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoriesOverviewPage } from "../CategoriesOverviewPage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act } from "react";

const mockCategoriesData = [
    {
        categoryId: "jewelry-personal-adornment",
        categoryKey: "JEWELRY_PERSONAL_ADORNMENT",
        name: { text: "Schmuck", language: "de" },
        products: 150,
        created: "2024-01-01T00:00:00Z",
        updated: "2024-06-01T00:00:00Z",
    },
    {
        categoryId: "furniture",
        categoryKey: "FURNITURE",
        name: { text: "Möbel", language: "de" },
        products: 320,
        created: "2024-01-01T00:00:00Z",
        updated: "2024-06-01T00:00:00Z",
    },
    {
        categoryId: "visual-art",
        categoryKey: "VISUAL_ART",
        name: { text: "Bildende Kunst", language: "de" },
        products: 85,
        created: "2024-01-01T00:00:00Z",
        updated: "2024-06-01T00:00:00Z",
    },
];

vi.mock("@tanstack/react-query", async () => {
    const actual = await vi.importActual("@tanstack/react-query");
    return {
        ...actual,
        useQuery: vi.fn(() => ({ data: mockCategoriesData })),
    };
});

describe("CategoriesOverviewPage", () => {
    it("renders the page title", async () => {
        await act(async () => {
            renderWithRouter(<CategoriesOverviewPage />);
        });
        expect(screen.getByRole("heading", { name: "Alle Kategorien" })).toBeInTheDocument();
    });

    it("renders the page subtitle", async () => {
        await act(async () => {
            renderWithRouter(<CategoriesOverviewPage />);
        });
        expect(screen.getByText("Nach Kategorie durchsuchen")).toBeInTheDocument();
    });

    it("renders the page description", async () => {
        await act(async () => {
            renderWithRouter(<CategoriesOverviewPage />);
        });
        expect(screen.getByText(/Entdecken Sie unser gesamtes Spektrum/)).toBeInTheDocument();
    });

    it("renders category cards for each category", async () => {
        await act(async () => {
            renderWithRouter(<CategoriesOverviewPage />);
        });
        const cards = screen.getAllByTestId("category-overview-card");
        expect(cards).toHaveLength(3);
    });

    it("renders category names", async () => {
        await act(async () => {
            renderWithRouter(<CategoriesOverviewPage />);
        });
        expect(screen.getByText("Schmuck")).toBeInTheDocument();
        expect(screen.getByText("Möbel")).toBeInTheDocument();
        expect(screen.getByText("Bildende Kunst")).toBeInTheDocument();
    });

    it("renders category images with correct alt text", async () => {
        await act(async () => {
            renderWithRouter(<CategoriesOverviewPage />);
        });
        const cards = screen.getAllByTestId("category-overview-card");
        for (const card of cards) {
            const img = within(card).getByRole("img");
            expect(img).toHaveAttribute("src");
        }
    });

    it("renders links to individual category pages", async () => {
        await act(async () => {
            renderWithRouter(<CategoriesOverviewPage />);
        });
        const jewelryLink = screen.getByText("Schmuck").closest("a");
        expect(jewelryLink).toHaveAttribute("href", "/categories/jewelry-personal-adornment");

        const furnitureLink = screen.getByText("Möbel").closest("a");
        expect(furnitureLink).toHaveAttribute("href", "/categories/furniture");
    });

    it("renders item counts", async () => {
        await act(async () => {
            renderWithRouter(<CategoriesOverviewPage />);
        });
        expect(screen.getByText("150 Objekte")).toBeInTheDocument();
        expect(screen.getByText("320 Objekte")).toBeInTheDocument();
        expect(screen.getByText("85 Objekte")).toBeInTheDocument();
    });
});
