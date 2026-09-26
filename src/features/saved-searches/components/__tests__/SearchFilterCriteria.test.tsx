import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import {
    SearchFilterCriteriaBadges,
    SearchFilterCriteriaDetails,
} from "../SearchFilterCriteria.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

function renderBadges(search: SearchFilterArguments) {
    return renderWithQueryClient(<SearchFilterCriteriaBadges search={search} />);
}

function renderDetails(search: SearchFilterArguments) {
    return renderWithQueryClient(<SearchFilterCriteriaDetails search={search} />);
}

describe("SearchFilterCriteriaBadges", () => {
    it("shows the price range badge", () => {
        renderBadges({ q: "", priceFrom: 100, priceTo: 500 });
        expect(screen.getByText("100 – 500 €")).toBeInTheDocument();
    });

    it("shows no price badge when no price is set", () => {
        renderBadges({ q: "" });
        expect(screen.queryByText(/€/)).not.toBeInTheDocument();
    });

    it("shows specific availability badges when only some values are selected", () => {
        renderBadges({ q: "", availability: ["AVAILABLE"] });
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
        expect(screen.queryByText("Alle")).not.toBeInTheDocument();
    });

    it("shows the 'Alle' badge when all availability values are selected", () => {
        renderBadges({ q: "", availability: [...LISTING_AVAILABILITIES] });
        expect(screen.getByText("Alle")).toBeInTheDocument();
    });
});

describe("SearchFilterCriteriaDetails", () => {
    it("renders no rows when nothing is set", () => {
        renderDetails({ q: "" });
        expect(screen.queryByText("Angebotsquelle")).not.toBeInTheDocument();
    });

    it("shows listing-source include and exclude rows", () => {
        renderDetails({
            q: "",
            listingSourceId: ["source-1"],
            excludeListingSourceId: ["source-2"],
        });
        expect(screen.getByText("Angebotsquelle einschließen")).toBeInTheDocument();
        expect(screen.getAllByText("1 Angebotsquelle ausgewählt")).toHaveLength(2);
        expect(screen.getByText("Angebotsquelle ausschließen")).toBeInTheDocument();
    });

    it("shows the creation-date row when set", () => {
        renderDetails({
            q: "",
            creationDateFrom: new Date("2024-01-01"),
            creationDateTo: new Date("2024-02-01"),
        });
        expect(screen.getByText("Hinzufügedatum")).toBeInTheDocument();
        expect(screen.getByText("1.1.2024 – 1.2.2024")).toBeInTheDocument();
    });

    it("shows the update-date row when set", () => {
        renderDetails({ q: "", updateDateFrom: new Date("2024-03-01") });
        expect(screen.getByText("Aktualisierungsdatum")).toBeInTheDocument();
        expect(screen.getByText(/1.3.2024 – \?/)).toBeInTheDocument();
    });

    it("shows the auction-date row when set", () => {
        renderDetails({
            q: "",
            auctionDateFrom: new Date("2024-04-01"),
            auctionDateTo: new Date("2024-04-15"),
        });
        expect(screen.getByText("Auktionsdatum")).toBeInTheDocument();
        expect(screen.getByText("1.4.2024 – 15.4.2024")).toBeInTheDocument();
    });
});
