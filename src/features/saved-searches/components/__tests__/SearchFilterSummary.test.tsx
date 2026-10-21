import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchFilterSummary } from "../SearchFilterSummary.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" }, updatePreferences: vi.fn() }),
}));

type Availability = (typeof LISTING_AVAILABILITIES)[number];

function renderSummary(
    name: string,
    search: SearchFilterArguments,
    availability: Availability[] = [...LISTING_AVAILABILITIES],
    props: { showName?: boolean; onChangeStep?: (step: number) => void } = {},
) {
    return render(
        <SearchFilterSummary name={name} search={search} availability={availability} {...props} />,
    );
}

/** The value text of the row labelled `label`. */
function rowValue(label: string) {
    return screen.getByText(label, { selector: "dt" }).nextElementSibling;
}

describe("SearchFilterSummary", () => {
    it("shows the name by default", () => {
        renderSummary("Barock Möbel", { q: "" });
        expect(rowValue("Name des Suchauftrags")).toHaveTextContent("Barock Möbel");
    });

    it("hides the name when showName is false", () => {
        renderSummary("Barock Möbel", { q: "" }, undefined, { showName: false });
        expect(screen.queryByText("Name des Suchauftrags")).not.toBeInTheDocument();
        expect(screen.queryByText("Barock Möbel")).not.toBeInTheDocument();
    });

    it("lists one row per wizard step", () => {
        renderSummary("Filter", { q: "" });
        expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual([
            "Name des Suchauftrags",
            "Suchbegriffe",
            "Preis & Status",
            "Anbieter",
            "Zeitraum",
        ]);
    });

    it("shows a single query term with the singular label", () => {
        renderSummary("Filter", { q: "Tisch", queryTerms: ["Tisch"] });
        expect(rowValue("Suchbegriff")).toHaveTextContent("“Tisch”");
    });

    it("shows multiple query terms with the plural label", () => {
        renderSummary("Filter", { q: "Tisch", queryTerms: ["Tisch", "Stuhl"] });
        expect(rowValue("Suchbegriffe")).toHaveTextContent("“Tisch” · “Stuhl”");
    });

    it("shows 'any' for unset search terms, providers and dates", () => {
        renderSummary("Filter", { q: "" });
        expect(rowValue("Suchbegriffe")).toHaveTextContent("Beliebig");
        expect(rowValue("Anbieter")).toHaveTextContent("Beliebig");
        expect(rowValue("Zeitraum")).toHaveTextContent("Beliebig");
    });

    it("shows the price range and all states", () => {
        renderSummary("Filter", { q: "", priceFrom: 100, priceTo: 500 });
        expect(rowValue("Preis & Status")).toHaveTextContent(
            "Preisspanne: 100 €–500 € · Verfügbarkeit: Alle",
        );
    });

    it("shows the specific state, not 'all', when only one state is selected", () => {
        renderSummary("Filter", { q: "" }, ["AVAILABLE"]);
        expect(rowValue("Preis & Status")).toHaveTextContent("Verfügbarkeit: Verfügbar");
        expect(screen.queryByText(/Alle/)).not.toBeInTheDocument();
    });

    it("shows selected listing source count", () => {
        renderSummary("Filter", { q: "", listingSourceId: ["source-a", "source-b"] });
        expect(rowValue("Anbieter")).toHaveTextContent(
            "Anbieter einschließen: 2 Anbieter ausgewählt",
        );
    });

    it("shows date ranges", () => {
        renderSummary("Filter", { q: "", auctionDateFrom: new Date("2024-03-01") });
        expect(rowValue("Zeitraum")).toHaveTextContent("Auktionsdatum: Ab 1. März 2024");
    });

    it("hides the Change buttons without onChangeStep", () => {
        renderSummary("Filter", { q: "" });
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("jumps back to the step of a row with Change", () => {
        const onChangeStep = vi.fn();
        renderSummary("Filter", { q: "" }, undefined, { onChangeStep });

        fireEvent.click(screen.getByRole("button", { name: "Name des Suchauftrags ändern" }));
        fireEvent.click(screen.getByRole("button", { name: "Suchbegriffe ändern" }));
        fireEvent.click(screen.getByRole("button", { name: "Preis & Status ändern" }));
        fireEvent.click(screen.getByRole("button", { name: "Anbieter ändern" }));
        fireEvent.click(screen.getByRole("button", { name: "Zeitraum ändern" }));

        expect(onChangeStep.mock.calls).toEqual([[1], [1], [2], [3], [4]]);
    });
});
