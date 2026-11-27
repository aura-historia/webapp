import type { CountryCode } from "@/data/internal/geography/GeographicCodes.ts";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchFilterConfigurationGrid } from "../SearchFilterConfigurationGrid.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type {
    GeographicSearch,
    UnsupportedGeography,
} from "@/data/internal/geography/GeographicSearch.ts";
import { SEARCHABLE_LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

vi.mock("@/features/geography/hooks/useSubdivisionNames.ts", () => ({
    useSubdivisionNames: () => ({
        names: undefined,
        formatSubdivisionName: (code: string) => code,
    }),
}));

vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" }, updatePreferences: vi.fn() }),
}));

function renderGrid(
    search: SearchFilterArguments,
    enhancedSearchDescription?: string,
    geography?: GeographicSearch | UnsupportedGeography,
) {
    return render(
        <SearchFilterConfigurationGrid
            search={search}
            enhancedSearchDescription={enhancedSearchDescription}
            geography={geography}
        />,
    );
}

const SAVED_DISTANCE: GeographicSearch = {
    countries: [],
    subdivisions: [],
    origin: { latitude: 51.34, longitude: 12.37 },
    radius: { amount: 50, unit: "KILOMETERS" },
    mode: "APPROXIMATE",
};

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
        renderGrid({ q: "", availability: [...SEARCHABLE_LISTING_AVAILABILITIES] });
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

    describe("location", () => {
        it("has no location row when none is saved", () => {
            renderGrid({ q: "" });
            expect(screen.queryByText("Standort", { selector: "dt" })).not.toBeInTheDocument();
        });

        it("names a saved distance by the saved starting point, never its coordinates", () => {
            renderGrid({ q: "" }, undefined, SAVED_DISTANCE);
            expect(rowValue("Standort")).toHaveTextContent(
                "Im Umkreis von 50 km um den gespeicherten Ausgangspunkt",
            );
            expect(document.body).not.toHaveTextContent("51.34");
            expect(
                screen.getByText(/Mit dieser Suche speichern wir eine private Kopie/),
            ).toBeInTheDocument();
        });

        it("shows a strict predicate saved elsewhere and a unit the wizard does not offer", () => {
            renderGrid({ q: "" }, undefined, {
                ...SAVED_DISTANCE,
                radius: { amount: 8000, unit: "METERS" },
                mode: "STRICT",
            });
            const row = rowValue("Standort");
            expect(row).toHaveTextContent("8.000 m");
            expect(row).toHaveTextContent("Nur genaue Adressen");
        });

        it("lists saved countries without the private-copy note", () => {
            renderGrid({ q: "" }, undefined, {
                countries: ["DE", "AT"] as CountryCode[],
                subdivisions: [],
            });
            const row = rowValue("Standort");
            expect(row).toHaveTextContent("Deutschland");
            expect(row).toHaveTextContent("Österreich");
            expect(screen.queryByText(/private Kopie/)).not.toBeInTheDocument();
        });

        it("only says that a location is set when the app cannot read it", () => {
            renderGrid({ q: "" }, undefined, "UNSUPPORTED");
            expect(rowValue("Standort")).toHaveTextContent(
                "Standort festgelegt – hier nicht darstellbar",
            );
        });
    });
});
