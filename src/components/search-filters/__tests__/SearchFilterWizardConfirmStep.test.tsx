import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { SearchFilterWizardConfirmStep } from "../SearchFilterWizardConfirmStep.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

function FormWrapper({ children }: { children: ReactNode }) {
    const methods = useForm({
        defaultValues: { shopType: [], productState: [] },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
}

function renderConfirmStep(name: string, filters: SearchFilterArguments) {
    return render(
        <FormWrapper>
            <SearchFilterWizardConfirmStep name={name} filters={filters} />
        </FormWrapper>,
    );
}

describe("SearchFilterWizardConfirmStep", () => {
    it("shows the filter name", () => {
        renderConfirmStep("Barock Möbel", { q: "" });
        expect(screen.getByText("Barock Möbel")).toBeInTheDocument();
    });

    it("shows a single query term with the singular label", () => {
        renderConfirmStep("Filter", { q: "Tisch", queryTerms: ["Tisch"] });
        expect(screen.getByText("Suchbegriff")).toBeInTheDocument();
        expect(screen.getByText("Tisch")).toBeInTheDocument();
    });

    it("shows multiple query terms with the plural label", () => {
        renderConfirmStep("Filter", { q: "Tisch", queryTerms: ["Tisch", "Stuhl"] });
        expect(screen.getByText("Suchbegriffe")).toBeInTheDocument();
        expect(screen.getByText("Tisch")).toBeInTheDocument();
        expect(screen.getByText("Stuhl")).toBeInTheDocument();
    });

    it("does not show the query section when no query terms are set", () => {
        renderConfirmStep("Filter", { q: "" });
        expect(screen.queryByText("Suchbegriff")).not.toBeInTheDocument();
        expect(screen.queryByText("Suchbegriffe")).not.toBeInTheDocument();
    });

    it("shows the no-filters-configured message when nothing is set", () => {
        renderConfirmStep("Filter", { q: "" });
        expect(screen.getByText("Keine zusätzlichen Filter konfiguriert.")).toBeInTheDocument();
    });

    it("shows the price range when priceFrom/priceTo are set", () => {
        renderConfirmStep("Filter", { q: "", priceFrom: 100, priceTo: 500 });
        expect(screen.getByText("100 – 500 €")).toBeInTheDocument();
    });

    it("shows merchant badges when merchant is set", () => {
        renderConfirmStep("Filter", { q: "", merchant: ["Shop A", "Shop B"] });
        expect(screen.getByText("Shop A")).toBeInTheDocument();
        expect(screen.getByText("Shop B")).toBeInTheDocument();
    });
});
