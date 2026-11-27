import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PressCatalogueFigures } from "@/features/press/components/PressCatalogueFigures.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

const mockUsePublicOverview = vi.hoisted(() => vi.fn());

vi.mock("@/features/landing/hooks/usePublicOverview.ts", () => ({
    usePublicOverview: mockUsePublicOverview,
}));

const overview = {
    asOf: new Date("2026-11-27T10:00:01Z"),
    sourcesIndexed: 833,
    sourcesIndexedByType: { dealers: 833, auctionHouses: 0, marketplaces: 0, auctionPlatforms: 0 },
    liveObjects: 1817019,
    countries: 12,
    languages: 15,
    newObjectsLast7Days: 978516,
};

async function renderFigures() {
    let container: HTMLElement | undefined;
    await act(async () => {
        container = renderWithRouter(<PressCatalogueFigures />).container;
    });
    return container as HTMLElement;
}

function figureFor(label: string) {
    return screen.getByText(label).closest("dt")?.nextElementSibling;
}

describe("PressCatalogueFigures", () => {
    beforeEach(() => {
        mockUsePublicOverview.mockReset();
    });

    it("shows the four figures exactly, in the page language, with their date", async () => {
        mockUsePublicOverview.mockReturnValue({ data: overview, isPending: false });
        const container = await renderFigures();

        expect(figureFor("Aktive Objekte")).toHaveTextContent("1.817.019");
        expect(figureFor("Erfasste Anbieter")).toHaveTextContent("833");
        expect(figureFor("Länder")).toHaveTextContent("12");
        expect(figureFor("Angebotssprachen")).toHaveTextContent("15");
        expect(container.querySelectorAll("dt")).toHaveLength(4);
        expect(
            screen.getByText(
                "Stand 27. November 2026 · dieselbe Quelle wie die Zahlen auf unserer Startseite",
            ),
        ).toBeInTheDocument();
    });

    it("leaves out a figure at zero and agrees the label with its count", async () => {
        mockUsePublicOverview.mockReturnValue({
            data: { ...overview, countries: 0, languages: 1 },
            isPending: false,
        });
        const container = await renderFigures();

        expect(screen.queryByText("Länder")).toBeNull();
        expect(figureFor("Angebotssprache")).toHaveTextContent("1");
        expect(container.querySelectorAll("dt")).toHaveLength(3);
    });

    it("holds the strip's height with a hidden skeleton while loading", async () => {
        mockUsePublicOverview.mockReturnValue({ data: undefined, isPending: true });
        const container = await renderFigures();

        expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
        expect(container.querySelector("dl")).toBeNull();
        expect(container).not.toHaveTextContent(/\d/);
    });

    it("points to the home page instead of showing figures when the overview fails", async () => {
        mockUsePublicOverview.mockReturnValue({ data: undefined, isPending: false });
        const container = await renderFigures();

        expect(container.querySelector("dl")).toBeNull();
        expect(
            screen.getByText("Die aktuellen Katalogzahlen finden Sie auf unserer Startseite."),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Zahlen auf der Startseite ansehen" }),
        ).toHaveAttribute("href", "/de");
    });
});
