import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CollectionsOverviewPage } from "../CollectionsOverviewPage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { COMBINATIONS } from "@/data/combinations/combinations.ts";
import { act } from "react";

describe("CollectionsOverviewPage", () => {
    it("renders the page title", async () => {
        await act(async () => {
            renderWithRouter(<CollectionsOverviewPage />);
        });
        expect(screen.getByRole("heading", { name: "Alle Sammlungen" })).toBeInTheDocument();
    });

    it("renders the page subtitle", async () => {
        await act(async () => {
            renderWithRouter(<CollectionsOverviewPage />);
        });
        expect(screen.getByText("Kuratierte Sammlungen")).toBeInTheDocument();
    });

    it("renders the page description", async () => {
        await act(async () => {
            renderWithRouter(<CollectionsOverviewPage />);
        });
        expect(screen.getByText(/Entdecken Sie unsere kuratierten Sammlungen/)).toBeInTheDocument();
    });

    it("renders a card for each combination", async () => {
        await act(async () => {
            renderWithRouter(<CollectionsOverviewPage />);
        });
        const cards = screen.getAllByTestId("collection-overview-card");
        expect(cards).toHaveLength(COMBINATIONS.length);
    });

    it("renders collection images", async () => {
        await act(async () => {
            renderWithRouter(<CollectionsOverviewPage />);
        });
        const cards = screen.getAllByTestId("collection-overview-card");
        for (const card of cards) {
            const img = within(card).getByRole("img");
            expect(img).toHaveAttribute("src");
        }
    });

    it("renders links to individual collection pages", async () => {
        await act(async () => {
            renderWithRouter(<CollectionsOverviewPage />);
        });
        const cards = screen.getAllByTestId("collection-overview-card");
        const firstCard = cards[0];
        const link = firstCard.closest("a");
        expect(link).toHaveAttribute("href", `/collections/${COMBINATIONS[0].slug}`);
    });
});
