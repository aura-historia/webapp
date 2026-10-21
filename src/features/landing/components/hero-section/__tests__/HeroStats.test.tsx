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

    it("lists the four catalogue figures, exactly and in the page language", async () => {
        mockUsePublicOverview.mockReturnValue({ data: overview, isPending: false });
        await renderStats();

        expect(figureFor("Erfasste Quellen")).toHaveTextContent("1.240");
        expect(figureFor("Aktive Objekte")).toHaveTextContent("182.450");
        expect(figureFor("Länder")).toHaveTextContent("18");
        expect(figureFor("Erkannte Sprachen")).toHaveTextContent("9");
        expect(screen.getByText("Sprachen")).toBeInTheDocument();
    });

    it("uses the singular label for a figure of one", async () => {
        mockUsePublicOverview.mockReturnValue({
            data: { ...overview, sourcesIndexed: 1, liveObjects: 1, countries: 1, languages: 1 },
            isPending: false,
        });
        await renderStats();

        expect(figureFor("Erfasste Quelle")).toHaveTextContent("1");
        expect(figureFor("Aktives Objekt")).toHaveTextContent("1");
        expect(figureFor("Land")).toHaveTextContent("1");
        expect(figureFor("Erkannte Sprache")).toHaveTextContent("1");
        expect(screen.getByText("Sprache")).toBeInTheDocument();
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
