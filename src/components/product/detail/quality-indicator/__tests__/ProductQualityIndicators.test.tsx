import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ProductDetail } from "@/data/internal/product/ProductDetails.ts";
import { ProductQualityIndicators } from "@/components/product/detail/quality-indicator/ProductQualityIndicators.tsx";

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
    it("should render all indicator labels", () => {
        render(<ProductQualityIndicators product={createProduct()} />);

        expect(screen.getByText("Entstehungsjahr")).toBeInTheDocument();
        expect(screen.getByText("Authentizität")).toBeInTheDocument();
        expect(screen.getByText("Zustand")).toBeInTheDocument();
        expect(screen.getByText("Herkunftsnachweis")).toBeInTheDocument();
        expect(screen.getByText("Restaurierung")).toBeInTheDocument();
    });

    it("should render expected values", () => {
        render(<ProductQualityIndicators product={createProduct()} />);

        expect(screen.getByText("1850")).toBeInTheDocument();
        expect(screen.getByText("Original")).toBeInTheDocument();
        expect(screen.getByText("Exzellent")).toBeInTheDocument();
        expect(screen.getByText("Vollständig")).toBeInTheDocument();
        expect(screen.getByText("Keine")).toBeInTheDocument();
    });

    it("should include quality title for accessibility", () => {
        render(<ProductQualityIndicators product={createProduct()} />);
        expect(screen.getByText("Qualitätsmerkmale")).toBeInTheDocument();
    });

    it("should render color dots", () => {
        const { container } = render(<ProductQualityIndicators product={createProduct()} />);
        expect(container.querySelectorAll(".size-2.rounded-full").length).toBe(5);
    });
});
