import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { SearchFilterConfigurationGrid } from "../SearchFilterConfigurationGrid.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

function renderGrid(search: SearchFilterArguments) {
    return renderWithQueryClient(<SearchFilterConfigurationGrid search={search} />);
}

describe("SearchFilterConfigurationGrid", () => {
    it("shows the empty-state message when no criteria are configured", () => {
        renderGrid({ q: "" });
        expect(screen.getByText("Keine weiteren Kriterien konfiguriert.")).toBeInTheDocument();
    });

    it("shows the query terms", () => {
        renderGrid({ q: "vase", queryTerms: ["vase", "Jugendstil"], priceFrom: 10 });
        expect(screen.getByText("vase")).toBeInTheDocument();
        expect(screen.getByText("Jugendstil")).toBeInTheDocument();
    });

    it("shows the price range", () => {
        renderGrid({ q: "", priceFrom: 100, priceTo: 500 });
        expect(screen.getByText("100 – 500 €")).toBeInTheDocument();
    });

    it("shows the wizard's default states when allowedStates is unset", () => {
        renderGrid({ q: "", priceFrom: 100 });
        expect(screen.getByText("Anzeigenstatus")).toBeInTheDocument();
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
        expect(screen.getByText("Gelistet")).toBeInTheDocument();
        expect(screen.getByText("Unbekannt")).toBeInTheDocument();
        expect(screen.queryByText("Alle")).not.toBeInTheDocument();
    });

    it("shows the specific state badges when only some states are explicitly selected", () => {
        renderGrid({ q: "", priceFrom: 100, allowedStates: ["AVAILABLE"] });
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
        expect(screen.queryByText("Gelistet")).not.toBeInTheDocument();
    });

    it("shows the 'Alle' badge when all states are explicitly selected", () => {
        renderGrid({
            q: "",
            priceFrom: 100,
            allowedStates: ["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"],
        });
        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("does not show the shop-type tile when shopType is unset", () => {
        renderGrid({ q: "", priceFrom: 100 });
        expect(screen.queryByText("Shop-Typ")).not.toBeInTheDocument();
    });

    it("shows the shop-type tile when shopType is explicitly set", () => {
        renderGrid({ q: "", priceFrom: 100, shopType: ["AUCTION_HOUSE"] });
        expect(screen.getByText("Shop-Typ")).toBeInTheDocument();
    });

    it("shows merchant and exclude-merchant badges", () => {
        renderGrid({ q: "", merchant: ["Sotheby's"], excludeMerchant: ["eBay"] });
        expect(screen.getByText("Sotheby's")).toBeInTheDocument();
        expect(screen.getByText("eBay")).toBeInTheDocument();
    });

    it("shows seller and exclude-seller badges", () => {
        renderGrid({ q: "", seller: ["Kunsthaus Lempertz"], excludeSeller: ["privater Anbieter"] });
        expect(screen.getByText("Kunsthaus Lempertz")).toBeInTheDocument();
        expect(screen.getByText("privater Anbieter")).toBeInTheDocument();
    });

    it("does not show merchant tiles when merchant/excludeMerchant are unset", () => {
        renderGrid({ q: "", priceFrom: 100 });
        expect(screen.queryByText("Händler")).not.toBeInTheDocument();
    });

    it("shows a one-sided date range with the 'from' label", () => {
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
