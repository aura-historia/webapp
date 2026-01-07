import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductQualityIndicators } from "@/components/product/detail/ProductQualityIndicator/ProductQualityIndicators";
import type { ProductDetail } from "@/data/internal/ProductDetails";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: vi.fn((key: string) => {
            const translations: Record<string, string> = {
                "product.qualityIndicators.title": "Quality Indicators",
                "product.qualityIndicators.originYear.label": "Origin Year",
                "product.qualityIndicators.authenticity.label": "Authenticity",
                "product.qualityIndicators.condition.label": "Condition",
                "product.qualityIndicators.provenance.label": "Provenance",
                "product.qualityIndicators.restoration.label": "Restoration",
                "product.qualityIndicators.authenticity.original": "Original",
                "product.qualityIndicators.condition.excellent": "Excellent",
                "product.qualityIndicators.provenance.complete": "Complete",
                "product.qualityIndicators.restoration.none": "None",
            };
            return translations[key] || key;
        }),
    }),
}));

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
        originYearMin: null,
        originYearMax: null,
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

            expect(screen.getByText("Quality Indicators")).toBeInTheDocument();
        });

        it("should render all 5 indicator labels", () => {
            const product = createProduct();
            render(<ProductQualityIndicators product={product} />);

            expect(screen.getByText("Origin Year")).toBeInTheDocument();
            expect(screen.getByText("Authenticity")).toBeInTheDocument();
            expect(screen.getByText("Condition")).toBeInTheDocument();
            expect(screen.getByText("Provenance")).toBeInTheDocument();
            expect(screen.getByText("Restoration")).toBeInTheDocument();
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

            expect(screen.getByText("Excellent")).toBeInTheDocument();
        });

        it("should display provenance value", () => {
            const product = createProduct({ provenance: "COMPLETE" });
            render(<ProductQualityIndicators product={product} />);

            expect(screen.getByText("Complete")).toBeInTheDocument();
        });

        it("should display restoration value", () => {
            const product = createProduct({ restoration: "NONE" });
            render(<ProductQualityIndicators product={product} />);

            expect(screen.getByText("None")).toBeInTheDocument();
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
