import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchFilterSummary } from "../SearchFilterSummary.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

function renderSummary(
    name: string,
    search: SearchFilterArguments,
    shopType: string[] = [],
    productState: string[] = [],
) {
    return renderWithQueryClient(
        <SearchFilterSummary
            name={name}
            search={search}
            // biome-ignore lint/suspicious/noExplicitAny: test helper, real callers pass typed enums
            shopType={shopType as any}
            // biome-ignore lint/suspicious/noExplicitAny: test helper, real callers pass typed enums
            productState={productState as any}
        />,
    );
}

describe("SearchFilterSummary", () => {
    it("shows the name by default", () => {
        renderSummary("Barock Möbel", { q: "" });
        expect(screen.getByText("Barock Möbel")).toBeInTheDocument();
    });

    it("hides the name when showName is false", () => {
        renderWithQueryClient(
            <SearchFilterSummary
                name="Barock Möbel"
                search={{ q: "" }}
                shopType={[]}
                productState={[]}
                showName={false}
            />,
        );
        expect(screen.queryByText("Barock Möbel")).not.toBeInTheDocument();
    });

    it("shows a single query term with the singular label", () => {
        renderSummary("Filter", { q: "Tisch", queryTerms: ["Tisch"] });
        expect(screen.getByText("Suchbegriff")).toBeInTheDocument();
        expect(screen.getByText("Tisch")).toBeInTheDocument();
    });

    it("shows multiple query terms with the plural label", () => {
        renderSummary("Filter", { q: "Tisch", queryTerms: ["Tisch", "Stuhl"] });
        expect(screen.getByText("Suchbegriffe")).toBeInTheDocument();
        expect(screen.getByText("Tisch")).toBeInTheDocument();
        expect(screen.getByText("Stuhl")).toBeInTheDocument();
    });

    it("shows the no-filters-configured message when nothing is set", () => {
        renderSummary("Filter", { q: "" });
        expect(screen.getByText("Keine zusätzlichen Filter konfiguriert.")).toBeInTheDocument();
    });

    it("shows the price range when priceFrom/priceTo are set", () => {
        renderSummary("Filter", { q: "", priceFrom: 100, priceTo: 500 });
        expect(screen.getByText("100 – 500 €")).toBeInTheDocument();
    });

    it("shows merchant badges when merchant is set", () => {
        renderSummary("Filter", { q: "", merchant: ["Shop A", "Shop B"] });
        expect(screen.getByText("Shop A")).toBeInTheDocument();
        expect(screen.getByText("Shop B")).toBeInTheDocument();
    });

    it("shows the specific state, not the 'all' badge, when only one state is selected", () => {
        renderSummary("Filter", { q: "" }, [], ["AVAILABLE"]);
        expect(screen.queryByText("Alle")).not.toBeInTheDocument();
    });
});
