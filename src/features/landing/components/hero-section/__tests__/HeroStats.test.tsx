import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";
import { HeroStats } from "../HeroStats.tsx";

const mockUsePublicOverview = vi.hoisted(() => vi.fn());

vi.mock("@/features/landing/hooks/usePublicOverview.ts", () => ({
    usePublicOverview: mockUsePublicOverview,
}));

const overview = {
    asOf: new Date("2026-10-21T15:00:00Z"),
    sourcesIndexed: 1240,
    sourcesIndexedByType: {
        dealers: 1180,
        auctionHouses: 42,
        marketplaces: 12,
        auctionPlatforms: 6,
    },
    liveObjects: 182450,
    countries: 18,
    languages: 9,
    newObjectsLast7Days: 3120,
};

async function renderStats() {
    let container: HTMLElement | undefined;
    await act(async () => {
        container = renderWithRouter(<HeroStats />, { initialEntries: ["/"] }).container;
    });
    return container as HTMLElement;
}

function figureFor(label: string) {
    return screen.getByText(label).closest("dt")?.nextElementSibling;
}

describe("HeroStats", () => {
    beforeEach(() => {
        mockUsePublicOverview.mockReset();
    });

    it("lists sources by type, live objects and countries, exactly and in the page language", async () => {
        mockUsePublicOverview.mockReturnValue({ data: overview, isPending: false });
        const container = await renderStats();

        expect(figureFor("Händler")).toHaveTextContent("1.180");
        expect(figureFor("Auktions\u00adhäuser")).toHaveTextContent("42");
        expect(figureFor("Auktions\u00adplattformen")).toHaveTextContent("6");
        expect(figureFor("Marktplätze")).toHaveTextContent("12");
        expect(figureFor("Aktive Objekte")).toHaveTextContent("182.450");
        expect(figureFor("Länder")).toHaveTextContent("18");
        expect(Array.from(container.querySelectorAll("dt"), (term) => term.textContent)).toEqual([
            "Händler",
            "Auktions\u00adhäuser",
            "Auktions\u00adplattformen",
            "Marktplätze",
            "Aktive Objekte",
            "Länder",
        ]);
    });

    it("no longer shows the total of sources or the languages", async () => {
        mockUsePublicOverview.mockReturnValue({ data: overview, isPending: false });
        await renderStats();

        expect(screen.queryByText("1.240")).toBeNull();
        expect(screen.queryByText(/Sprache/)).toBeNull();
        expect(screen.queryByText(/Quelle/)).toBeNull();
    });

    it("uses the singular label for a figure of one", async () => {
        mockUsePublicOverview.mockReturnValue({
            data: {
                ...overview,
                sourcesIndexedByType: {
                    dealers: 1,
                    auctionHouses: 1,
                    marketplaces: 1,
                    auctionPlatforms: 1,
                },
                liveObjects: 1,
                countries: 1,
            },
            isPending: false,
        });
        await renderStats();

        expect(figureFor("Händler")).toHaveTextContent("1");
        expect(figureFor("Auktionshaus")).toHaveTextContent("1");
        expect(figureFor("Auktions\u00adplattform")).toHaveTextContent("1");
        expect(figureFor("Marktplatz")).toHaveTextContent("1");
        expect(figureFor("Aktives Objekt")).toHaveTextContent("1");
        expect(figureFor("Land")).toHaveTextContent("1");
    });

    it("shortens live objects from a million", async () => {
        mockUsePublicOverview.mockReturnValue({
            data: { ...overview, liveObjects: 1_840_000 },
            isPending: false,
        });
        await renderStats();

        expect(figureFor("Aktive Objekte")).toHaveTextContent("1,8 Mio.");
    });

    it("reserves the strip without figures while loading", async () => {
        mockUsePublicOverview.mockReturnValue({ data: undefined, isPending: true });
        const container = await renderStats();

        expect(container.querySelector("dl")).toBeNull();
        expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
    });

    it("leaves the strip out when the figures cannot be read", async () => {
        mockUsePublicOverview.mockReturnValue({ data: undefined, isPending: false });
        const container = await renderStats();

        expect(container).toBeEmptyDOMElement();
    });
});
