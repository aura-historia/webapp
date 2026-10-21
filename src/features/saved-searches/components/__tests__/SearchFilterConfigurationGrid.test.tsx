import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchFilterConfigurationGrid } from "../SearchFilterConfigurationGrid.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" }, updatePreferences: vi.fn() }),
}));

function renderGrid(search: SearchFilterArguments, enhancedSearchDescription?: string) {
    return render(
        <SearchFilterConfigurationGrid
            search={search}
            enhancedSearchDescription={enhancedSearchDescription}
        />,
    );
}

/** The value text of the row labelled `label`. */
function rowValue(label: string) {
    return screen.getByText(label, { selector: "dt" }).nextElementSibling;
}

describe("SearchFilterConfigurationGrid", () => {
    it("always lists availability, even without other criteria", () => {
        renderGrid({ q: "" });
        expect(screen.getAllByRole("term")).toHaveLength(1);
        expect(rowValue("Verfügbarkeit")).toHaveTextContent("Alle");
    });

    it("shows quoted query terms with the plural label", () => {
        renderGrid({ q: "vase", queryTerms: ["vase", "Jugendstil"] });
        expect(rowValue("Suchbegriffe")).toHaveTextContent("“vase”“Jugendstil”");
    });

    it("falls back to the legacy q as a single query term", () => {
        renderGrid({ q: "vase" });
        expect(rowValue("Suchbegriff")).toHaveTextContent("“vase”");
    });

    it("shows the AI description when given", () => {
        renderGrid({ q: "vase" }, "Jugendstil-Vasen aus Glas");
        expect(rowValue("KI-Beschreibung")).toHaveTextContent("Jugendstil-Vasen aus Glas");
    });

    it("omits the AI description row when none is given", () => {
        renderGrid({ q: "vase" });
        expect(screen.queryByText("KI-Beschreibung")).not.toBeInTheDocument();
    });

    it("shows a price range", () => {
        renderGrid({ q: "", priceFrom: 100, priceTo: 500 });
        expect(rowValue("Preisspanne")).toHaveTextContent("100 €–500 €");
    });

    it("shows a one-sided price range", () => {
        renderGrid({ q: "", priceFrom: 100 });
        expect(rowValue("Preisspanne")).toHaveTextContent("ab 100 €");
    });

    it("shows selected listing availability values", () => {
        renderGrid({ q: "", availability: ["AVAILABLE"] });
        expect(rowValue("Verfügbarkeit")).toHaveTextContent("Verfügbar");
        expect(screen.queryByText("Alle")).not.toBeInTheDocument();
    });

    it("shows all when every API availability is selected", () => {
        renderGrid({ q: "", availability: [...LISTING_AVAILABILITIES] });
        expect(rowValue("Verfügbarkeit")).toHaveTextContent("Alle");
    });

    it("shows source filter counts without exposing opaque IDs", () => {
        renderGrid({ q: "", listingSourceId: ["ls_1"], excludeListingSourceId: ["ls_2", "ls_3"] });
        expect(rowValue("Anbieter einschließen")).toHaveTextContent("1 Anbieter ausgewählt");
        expect(rowValue("Anbieter ausschließen")).toHaveTextContent("2 Anbieter ausgewählt");
        expect(screen.queryByText("ls_1")).not.toBeInTheDocument();
    });

    it("shows source labels when every selected source has one", () => {
        renderGrid({
            q: "",
            listingSourceId: ["ls_1", "ls_2"],
            listingSourceLabels: ["Dorotheum", "Lempertz"],
        });
        expect(screen.getByText("Dorotheum")).toBeInTheDocument();
        expect(screen.getByText("Lempertz")).toBeInTheDocument();
    });

    it("shows a one-sided date range with the from label", () => {
        renderGrid({ q: "", creationDateFrom: new Date("2024-01-01") });
        expect(rowValue("Hinzufügedatum")).toHaveTextContent("Ab 1. Jan. 2024");
    });

    it("shows a full date range", () => {
        renderGrid({
            q: "",
            auctionDateFrom: new Date("2024-03-01"),
            auctionDateTo: new Date("2024-03-15"),
        });
        expect(rowValue("Auktionsdatum")).toHaveTextContent("1. März 2024 – 15. März 2024");
    });

    it("shows a one-sided update date range with the to label", () => {
        renderGrid({ q: "", updateDateTo: new Date("2024-03-15") });
        expect(rowValue("Aktualisierungsdatum")).toHaveTextContent("Bis 15. März 2024");
    });
});
