import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import {
    SearchFilterCriteriaBadges,
    SearchFilterCriteriaDetails,
} from "../SearchFilterCriteria.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

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

    it("shows nothing when no price/states/shopType are set", () => {
        renderBadges({ q: "" });
        expect(screen.queryByText(/€/)).not.toBeInTheDocument();
        expect(screen.queryByText("Alle")).not.toBeInTheDocument();
    });

    it("shows specific state badges when only some states are selected", () => {
        renderBadges({ q: "", allowedStates: ["AVAILABLE"] });
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
        expect(screen.queryByText("Gelistet")).not.toBeInTheDocument();
    });

    it("shows the 'Alle' badge when all states are selected", () => {
        renderBadges({
            q: "",
            allowedStates: ["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"],
        });
        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("shows specific shop-type badges when only some shop types are selected", () => {
        renderBadges({ q: "", shopType: ["AUCTION_HOUSE"] });
        expect(screen.getByText("Auktionshaus")).toBeInTheDocument();
    });

    it("shows the 'Alle' badge when all shop types are selected", () => {
        renderBadges({
            q: "",
            shopType: ["AUCTION_HOUSE", "AUCTION_PLATFORM", "COMMERCIAL_DEALER", "MARKETPLACE"],
        });
        expect(screen.getByText("Alle")).toBeInTheDocument();
    });
});

describe("SearchFilterCriteriaDetails", () => {
    it("renders no rows when nothing is set", () => {
        renderDetails({ q: "" });
        expect(screen.queryByText("Händler")).not.toBeInTheDocument();
        expect(screen.queryByText("Verkäufer")).not.toBeInTheDocument();
    });

    it("shows merchant and exclude-merchant rows", () => {
        renderDetails({ q: "", merchant: ["Sotheby's"], excludeMerchant: ["eBay"] });
        expect(screen.getByText("Händler")).toBeInTheDocument();
        expect(screen.getByText("Sotheby's")).toBeInTheDocument();
        expect(screen.getByText("Händler ausschließen")).toBeInTheDocument();
        expect(screen.getByText("eBay")).toBeInTheDocument();
    });

    it("shows seller and exclude-seller rows", () => {
        renderDetails({
            q: "",
            seller: ["Kunsthaus Lempertz"],
            excludeSeller: ["privater Anbieter"],
        });
        expect(screen.getByText("Verkäufer")).toBeInTheDocument();
        expect(screen.getByText("Kunsthaus Lempertz")).toBeInTheDocument();
        expect(screen.getByText("Verkäufer ausschließen")).toBeInTheDocument();
        expect(screen.getByText("privater Anbieter")).toBeInTheDocument();
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
