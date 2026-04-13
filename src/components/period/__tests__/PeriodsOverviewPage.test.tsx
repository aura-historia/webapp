import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PeriodsOverviewPage } from "../PeriodsOverviewPage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act } from "react";

const mockPeriodsData = [
    {
        periodId: "baroque",
        periodKey: "BAROQUE",
        name: { text: "Barock", language: "de" },
        products: 200,
        created: "2024-01-01T00:00:00Z",
        updated: "2024-06-01T00:00:00Z",
    },
    {
        periodId: "art-nouveau",
        periodKey: "ART_NOUVEAU",
        name: { text: "Jugendstil", language: "de" },
        products: 120,
        created: "2024-01-01T00:00:00Z",
        updated: "2024-06-01T00:00:00Z",
    },
    {
        periodId: "renaissance",
        periodKey: "RENAISSANCE",
        name: { text: "Renaissance", language: "de" },
        products: 180,
        created: "2024-01-01T00:00:00Z",
        updated: "2024-06-01T00:00:00Z",
    },
];

vi.mock("@tanstack/react-query", async () => {
    const actual = await vi.importActual("@tanstack/react-query");
    return {
        ...actual,
        useQuery: vi.fn(() => ({ data: mockPeriodsData })),
    };
});

describe("PeriodsOverviewPage", () => {
    it("renders the page title", async () => {
        await act(async () => {
            renderWithRouter(<PeriodsOverviewPage />);
        });
        expect(screen.getByRole("heading", { name: "Alle Epochen & Stile" })).toBeInTheDocument();
    });

    it("renders the page subtitle", async () => {
        await act(async () => {
            renderWithRouter(<PeriodsOverviewPage />);
        });
        expect(screen.getByText("Nach Epoche durchsuchen")).toBeInTheDocument();
    });

    it("renders the page description", async () => {
        await act(async () => {
            renderWithRouter(<PeriodsOverviewPage />);
        });
        expect(screen.getByText(/Reisen Sie durch die Geschichte/)).toBeInTheDocument();
    });

    it("renders period cards for each period", async () => {
        await act(async () => {
            renderWithRouter(<PeriodsOverviewPage />);
        });
        const cards = screen.getAllByTestId("period-overview-card");
        expect(cards).toHaveLength(3);
    });

    it("renders period names", async () => {
        await act(async () => {
            renderWithRouter(<PeriodsOverviewPage />);
        });
        expect(screen.getByText("Barock")).toBeInTheDocument();
        expect(screen.getByText("Jugendstil")).toBeInTheDocument();
        expect(screen.getByText("Renaissance")).toBeInTheDocument();
    });

    it("renders period images", async () => {
        await act(async () => {
            renderWithRouter(<PeriodsOverviewPage />);
        });
        const cards = screen.getAllByTestId("period-overview-card");
        for (const card of cards) {
            const img = within(card).getByRole("img");
            expect(img).toHaveAttribute("src");
        }
    });

    it("renders date ranges for periods", async () => {
        await act(async () => {
            renderWithRouter(<PeriodsOverviewPage />);
        });
        expect(screen.getByText("1600 - 1750")).toBeInTheDocument();
        expect(screen.getByText("1890 - 1910")).toBeInTheDocument();
        expect(screen.getByText("1400 - 1600")).toBeInTheDocument();
    });

    it("renders links to individual period pages", async () => {
        await act(async () => {
            renderWithRouter(<PeriodsOverviewPage />);
        });
        const baroqueLink = screen.getByText("Barock").closest("a");
        expect(baroqueLink).toHaveAttribute("href", "/periods/baroque");

        const artNouveauLink = screen.getByText("Jugendstil").closest("a");
        expect(artNouveauLink).toHaveAttribute("href", "/periods/art-nouveau");
    });

    it("renders periods in chronological order", async () => {
        await act(async () => {
            renderWithRouter(<PeriodsOverviewPage />);
        });
        const cards = screen.getAllByTestId("period-overview-card");
        // Renaissance (1400) < Baroque (1600) < Art Nouveau (1890)
        const names = cards.map((card) => within(card).getByRole("heading").textContent);
        expect(names).toEqual(["Renaissance", "Barock", "Jugendstil"]);
    });
});
