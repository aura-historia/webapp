import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { SearchFilterConfigurationGrid } from "../SearchFilterConfigurationGrid.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

function renderGrid(search: SearchFilterArguments) {
    return renderWithQueryClient(<SearchFilterConfigurationGrid search={search} />);
}

describe("SearchFilterConfigurationGrid", () => {
    it("shows the empty-state message when no criteria are configured", () => {
        renderGrid({ q: "" });
        expect(screen.getByText("Keine weiteren Kriterien konfiguriert.")).toBeInTheDocument();
    });

    it("shows query terms and a price range", () => {
        renderGrid({ q: "vase", queryTerms: ["vase", "Jugendstil"], priceFrom: 100, priceTo: 500 });
        expect(screen.getByText("vase")).toBeInTheDocument();
        expect(screen.getByText("Jugendstil")).toBeInTheDocument();
        expect(screen.getByText("100 – 500 €")).toBeInTheDocument();
    });

    it("shows the default availability as unrestricted", () => {
        renderGrid({ q: "", priceFrom: 100 });
        expect(screen.getByText("Verfügbarkeit")).toBeInTheDocument();
        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("shows selected listing availability values", () => {
        renderGrid({ q: "", availability: ["AVAILABLE"] });
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
        expect(screen.queryByText("Alle")).not.toBeInTheDocument();
    });

    it("shows all when every API availability is selected", () => {
        renderGrid({ q: "", availability: [...LISTING_AVAILABILITIES] });
        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("shows source filter counts without exposing opaque IDs", () => {
        renderGrid({ q: "", listingSourceId: ["ls_1"], excludeListingSourceId: ["ls_2", "ls_3"] });
        expect(screen.getByText("Angebotsquelle einschließen")).toBeInTheDocument();
        expect(screen.getByText("1 Angebotsquelle ausgewählt")).toBeInTheDocument();
        expect(screen.getByText("2 Angebotsquellen ausgewählt")).toBeInTheDocument();
        expect(screen.queryByText("ls_1")).not.toBeInTheDocument();
    });

    it("shows a one-sided date range with the from label", () => {
        renderGrid({ q: "", creationDateFrom: new Date("2024-01-01") });
        expect(screen.getByText(/Von:/)).toBeInTheDocument();
    });

    it("shows a full date range", () => {
        renderGrid({
            q: "",
            auctionDateFrom: new Date("2024-03-01"),
            auctionDateTo: new Date("2024-03-15"),
        });
        expect(screen.getByText("1.3.2024 – 15.3.2024")).toBeInTheDocument();
    });
});
