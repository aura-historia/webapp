import { act, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";
import { PlatformSection } from "../PlatformSection.tsx";

function stubViewport({ desktop }: { desktop: boolean }) {
    vi.stubGlobal("matchMedia", (query: string) => ({
        matches: desktop && query.includes("min-width: 920px"),
        addEventListener: () => {},
        removeEventListener: () => {},
    }));
}

async function renderSection() {
    await act(async () => {
        renderWithRouter(<PlatformSection />, { initialEntries: ["/"] });
    });
}

describe("PlatformSection", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("makes the swipeable tool row a keyboard-reachable region on phones", async () => {
        stubViewport({ desktop: false });
        await renderSection();

        const row = screen.getByRole("region", { name: "Weitere Werkzeuge der Plattform" });
        expect(row).toHaveAttribute("tabindex", "0");
    });

    it("drops the region and its tab stop once the cards join the bento grid", async () => {
        stubViewport({ desktop: true });
        await renderSection();

        expect(
            screen.queryByRole("region", { name: "Weitere Werkzeuge der Plattform" }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText("Jede Sprache").closest("article")?.parentElement,
        ).not.toHaveAttribute("tabindex");
    });
});
