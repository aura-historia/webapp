import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { SearchFilterWizardConfirmStep } from "../SearchFilterWizardConfirmStep.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";

type PreviewResult = {
    isPending: boolean;
    error: Error | null;
    data: ProductListing[] | undefined;
};

const mockPreview = vi.hoisted(() =>
    vi.fn((): PreviewResult => ({ isPending: false, error: null, data: [] })),
);

vi.mock("@/features/saved-searches/api/useSearchFilterPreviewProducts.ts", () => ({
    useSearchFilterPreviewProducts: mockPreview,
}));

vi.mock("@/features/search/products/components/results/SearchResultCard.tsx", () => ({
    SearchResultCard: ({ product }: { product: ProductListing }) => (
        <div data-testid="search-result-card">{product.title}</div>
    ),
}));

vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" }, updatePreferences: vi.fn() }),
}));

function FormWrapper({ children }: { children: ReactNode }) {
    const methods = useForm({
        defaultValues: { availability: ["AVAILABLE"] },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
}

function renderConfirmStep(
    name: string,
    filters: SearchFilterArguments,
    onChangeStep?: (step: number) => void,
) {
    return render(
        <FormWrapper>
            <SearchFilterWizardConfirmStep
                name={name}
                filters={filters}
                onChangeStep={onChangeStep}
            />
        </FormWrapper>,
    );
}

describe("SearchFilterWizardConfirmStep", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPreview.mockReturnValue({ isPending: false, error: null, data: [] });
    });

    it("includes the current enhanced description in the preview search", () => {
        render(
            <FormWrapper>
                <SearchFilterWizardConfirmStep
                    name="Filter"
                    filters={{ q: "Tisch", enhancedSearchDescription: "Alte Möbel" }}
                    enhancedSearchDescription="Aktuelle Beschreibung"
                />
            </FormWrapper>,
        );

        expect(mockPreview).toHaveBeenCalledWith(
            expect.objectContaining({ enhancedSearchDescription: "Aktuelle Beschreibung" }),
            true,
        );
    });

    describe("summary", () => {
        it("shows the filter name", () => {
            renderConfirmStep("Barock Möbel", { q: "" });
            expect(screen.getByText("Barock Möbel")).toBeInTheDocument();
        });

        it("shows multiple query terms with the plural label", () => {
            renderConfirmStep("Filter", { q: "Tisch", queryTerms: ["Tisch", "Stuhl"] });
            expect(screen.getByText("Suchbegriffe")).toBeInTheDocument();
            expect(screen.getByText("“Tisch” · “Stuhl”")).toBeInTheDocument();
        });

        it("uses the form's availability rather than the debounced filters", () => {
            renderConfirmStep("Filter", { q: "" });
            expect(screen.getByText("Verfügbarkeit: Verfügbar")).toBeInTheDocument();
        });

        it("shows the price range when priceFrom/priceTo are set", () => {
            renderConfirmStep("Filter", { q: "", priceFrom: 100, priceTo: 500 });
            expect(
                screen.getByText("Preisspanne: 100 €–500 € · Verfügbarkeit: Verfügbar"),
            ).toBeInTheDocument();
        });

        it("passes onChangeStep to the summary", () => {
            const onChangeStep = vi.fn();
            renderConfirmStep("Filter", { q: "" }, onChangeStep);
            fireEvent.click(screen.getByRole("button", { name: "Anbieter ändern" }));
            expect(onChangeStep).toHaveBeenCalledWith(3);
        });
    });

    describe("listing preview", () => {
        it("renders the preview heading", () => {
            renderConfirmStep("Filter", { q: "Tisch" });
            expect(
                screen.getByRole("heading", { name: "Vorschau der Angebote" }),
            ).toBeInTheDocument();
        });

        it("renders skeletons while the preview loads", () => {
            mockPreview.mockReturnValue({ isPending: true, error: null, data: undefined });
            renderConfirmStep("Filter", { q: "Tisch" });
            expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
            expect(screen.getAllByTestId("search-result-skeleton")).toHaveLength(2);
        });

        it("shows an error when the preview fails", () => {
            mockPreview.mockReturnValue({
                isPending: false,
                error: new Error("x"),
                data: undefined,
            });
            renderConfirmStep("Filter", { q: "Tisch" });
            expect(screen.getByRole("status")).toHaveTextContent(
                "Die Vorschau konnte nicht geladen werden.",
            );
        });

        it("shows an empty note when nothing matches", () => {
            renderConfirmStep("Filter", { q: "Tisch" });
            expect(
                screen.getByText("Derzeit entsprechen keine Angebote diesen Kriterien."),
            ).toBeInTheDocument();
        });

        it("renders a result card per preview listing", () => {
            mockPreview.mockReturnValue({
                isPending: false,
                error: null,
                data: [
                    { productListingId: "1", title: "Barocktisch" },
                    { productListingId: "2", title: "Barockstuhl" },
                ] as ProductListing[],
            });
            renderConfirmStep("Filter", { q: "Tisch" });
            expect(screen.getAllByTestId("search-result-card")).toHaveLength(2);
            expect(screen.getByText("Barocktisch")).toBeInTheDocument();
        });
    });
});
