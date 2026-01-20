import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductQualityIndicators } from "@/components/product/detail/ProductQualityIndicator/ProductQualityIndicators.tsx";
import type { ProductDetail } from "@/data/internal/ProductDetails.ts";

vi.mock("lucide-react", () => ({
    Calendar: () => <div data-testid="calendar-icon" />,
    ShieldCheck: () => <div data-testid="shield-icon" />,
    Star: () => <div data-testid="star-icon" />,
    FileText: () => <div data-testid="filetext-icon" />,
    Paintbrush: () => <div data-testid="paintbrush-icon" />,
    Info: () => <div data-testid="info-icon" />,
}));

const createProduct = (overrides?: Partial<ProductDetail>): ProductDetail =>
    ({
        id: "1",
        title: "Test Product",
        originYear: 1850,
        originYearMin: undefined,
        originYearMax: undefined,
        authenticity: "ORIGINAL",
        condition: "EXCELLENT",
        provenance: "COMPLETE",
        restoration: "NONE",
        ...overrides,
    }) as ProductDetail;

describe("ProductQualityIndicators", () => {
    describe("Basic Rendering", () => {
        it("should render title", () => {
            const product = createProduct();
            render(<ProductQualityIndicators product={product} />);

            expect(screen.getByText("Qualitätsmerkmale")).toBeInTheDocument();
        });

        it("should render all 5 indicator labels", () => {
            const product = createProduct();
            render(<ProductQualityIndicators product={product} />);

            expect(screen.getByText("Entstehungsjahr")).toBeInTheDocument();
            expect(screen.getByText("Authentizität")).toBeInTheDocument();
            expect(screen.getByText("Zustand")).toBeInTheDocument();
            expect(screen.getByText("Herkunftsnachweis")).toBeInTheDocument();
            expect(screen.getByText("Restaurierung")).toBeInTheDocument();
        });

        it("should render all 5 icons", () => {
            const product = createProduct();
            render(<ProductQualityIndicators product={product} />);

            expect(screen.getAllByTestId("calendar-icon")).toHaveLength(1);
            expect(screen.getAllByTestId("shield-icon")).toHaveLength(1);
            expect(screen.getAllByTestId("star-icon")).toHaveLength(1);
            expect(screen.getAllByTestId("filetext-icon")).toHaveLength(1);
            expect(screen.getAllByTestId("paintbrush-icon")).toHaveLength(1);
        });
    });

    describe("Product Data Display", () => {
        it("should display origin year value", () => {
            const product = createProduct({ originYear: 1850 });
            render(<ProductQualityIndicators product={product} />);

            expect(screen.getByText("1850")).toBeInTheDocument();
        });

        it("should display authenticity value", () => {
            const product = createProduct({ authenticity: "ORIGINAL" });
            render(<ProductQualityIndicators product={product} />);

            expect(screen.getByText("Original")).toBeInTheDocument();
        });

        it("should display condition value", () => {
            const product = createProduct({ condition: "EXCELLENT" });
            render(<ProductQualityIndicators product={product} />);

            expect(screen.getByText("Exzellent")).toBeInTheDocument();
        });

        it("should display provenance value", () => {
            const product = createProduct({ provenance: "COMPLETE" });
            render(<ProductQualityIndicators product={product} />);

            expect(screen.getByText("Vollständig")).toBeInTheDocument();
        });

        it("should display restoration value", () => {
            const product = createProduct({ restoration: "NONE" });
            render(<ProductQualityIndicators product={product} />);

            expect(screen.getByText("Keine")).toBeInTheDocument();
        });
    });

    describe("Color Classes", () => {
        it("should apply correct colors for high quality", () => {
            const product = createProduct({
                originYear: 1850,
                authenticity: "ORIGINAL",
                condition: "EXCELLENT",
            });
            const { container } = render(<ProductQualityIndicators product={product} />);

            const greenElements = container.querySelectorAll(".bg-green-700");
            expect(greenElements.length).toBeGreaterThan(0);
        });
    });
});
