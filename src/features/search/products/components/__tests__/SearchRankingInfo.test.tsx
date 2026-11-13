import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchRankingInfo } from "../SearchRankingInfo.tsx";

describe("SearchRankingInfo", () => {
    beforeEach(() => {
        // vaul reads matchMedia; jsdom has none.
        vi.stubGlobal("matchMedia", (query: string) => ({
            matches: false,
            media: query,
            addEventListener: () => {},
            removeEventListener: () => {},
        }));
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("opens the ranking parameters from the toolbar link and closes again", async () => {
        render(<SearchRankingInfo sortField="RELEVANCE" hasQuery layout="toolbar" />);

        const trigger = screen.getByRole("button", { name: "Wie wir sortieren" });
        expect(trigger).toHaveAttribute("aria-expanded", "false");
        await userEvent.click(trigger);

        const dialog = screen.getByRole("dialog", { name: "Wie wir sortieren." });
        expect(trigger).toHaveAttribute("aria-expanded", "true");
        // Every sort mode the page offers is described.
        expect(
            within(dialog)
                .getAllByRole("term")
                .map((term) => term.textContent),
        ).toEqual(["RelevanzAusgewählt", "Hinzugefügt am", "Zuletzt aktualisiert"]);
        expect(within(dialog).getByText("Wortübereinstimmung")).toBeInTheDocument();
        expect(within(dialog).getByText("Ähnliche Bedeutung")).toBeInTheDocument();
        expect(within(dialog).getByText("Zwei Rangfolgen zählen gleich viel:")).toBeInTheDocument();
        expect(
            within(dialog).getByText(
                "Partnerstatus, Provisionen und Zahlungen beeinflussen die Reihenfolge nicht.",
            ),
        ).toBeInTheDocument();

        await userEvent.click(within(dialog).getByRole("button", { name: "Schließen" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });

    it("tags the selected sort mode", async () => {
        render(<SearchRankingInfo sortField="UPDATE_DATE" hasQuery layout="toolbar" />);

        await userEvent.click(screen.getByRole("button", { name: "Wie wir sortieren" }));
        const terms = screen.getAllByRole("term").map((term) => term.textContent);
        expect(terms).toEqual(["Relevanz", "Hinzugefügt am", "Zuletzt aktualisiertAusgewählt"]);
    });

    it("emphasises the no-search-term line only for relevance without a term", async () => {
        const { unmount } = render(
            <SearchRankingInfo sortField="RELEVANCE" hasQuery={false} layout="toolbar" />,
        );
        await userEvent.click(screen.getByRole("button", { name: "Wie wir sortieren" }));
        expect(screen.getByTestId("search-ranking-no-query")).toHaveClass("text-ink");
        unmount();

        render(<SearchRankingInfo sortField="RELEVANCE" hasQuery layout="toolbar" />);
        await userEvent.click(screen.getByRole("button", { name: "Wie wir sortieren" }));
        expect(screen.getByTestId("search-ranking-no-query")).toHaveClass("text-ink-muted");
    });

    it("opens a bottom sheet from the phone link", async () => {
        render(<SearchRankingInfo sortField="CREATION_DATE" hasQuery layout="compact" />);

        await userEvent.click(screen.getByRole("button", { name: "Wie wir sortieren" }));
        const sheet = await screen.findByRole("dialog", { name: "Wie wir sortieren." });
        expect(within(sheet).getAllByRole("term")[1]).toHaveTextContent("Hinzugefügt amAusgewählt");
        expect(
            within(sheet).getByText(
                "Ist das KI-Modell nicht verfügbar, zählt nur die Wortübereinstimmung.",
            ),
        ).toBeInTheDocument();

        await userEvent.click(within(sheet).getByRole("button", { name: "Schließen" }));
        // The sheet is driven by its Radix trigger, which returns focus to the link once the
        // sheet unmounts. vaul's exit animation never finishes in jsdom, so focus return itself
        // is checked in the browser.
        const trigger = screen.getByRole("button", { name: "Wie wir sortieren", hidden: true });
        await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    });
});
