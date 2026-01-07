import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductQualityBadges } from "@/components/product/detail/ProductQualityIndicator/ProductQualityBadges.tsx";
import type { ProductDetail } from "@/data/internal/ProductDetails";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: vi.fn((key: string) => {
            const translations: Record<string, string> = {
                "product.qualityIndicators.authenticity.original": "Original",
                "product.qualityIndicators.authenticity.reproduction": "Reproduction",
                "product.qualityIndicators.condition.excellent": "Excellent",
                "product.qualityIndicators.condition.fair": "Fair",
            };
            return translations[key] || key;
        }),
    }),
}));

vi.mock("lucide-react", () => ({
    Calendar: () => <div data-testid="calendar-icon" />,
    ShieldCheck: () => <div data-testid="shield-icon" />,
    Star: () => <div data-testid="star-icon" />,
}));

const createProduct = (overrides?: Partial<ProductDetail>): ProductDetail =>
    ({
        id: "1",
        title: "Test Product",
        originYear: null,
        originYearMin: null,
        originYearMax: null,
        authenticity: null,
        condition: null,
        ...overrides,
    }) as ProductDetail;

describe("ProductQualityBadges", () => {
    describe("OriginYear Badge", () => {
        it("should render badge with exact year", () => {
            const product = createProduct({ originYear: 1850 });
            render(<ProductQualityBadges product={product} />);

            expect(screen.getByText("1850")).toBeInTheDocument();
            expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
        });

        it("should render badge with year range", () => {
            const product = createProduct({ originYearMin: 1800, originYearMax: 1900 });
            render(<ProductQualityBadges product={product} />);

            expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
        });

        it("should not render when no year data", () => {
            const product = createProduct();
            render(<ProductQualityBadges product={product} />);

            expect(screen.queryByTestId("calendar-icon")).not.toBeInTheDocument();
        });

        it("should apply correct color for exact year", () => {
            const product = createProduct({ originYear: 1850 });
            const { container } = render(<ProductQualityBadges product={product} />);

            expect(container.querySelector(".bg-green-700")).toBeInTheDocument();
        });
    });

    describe("Authenticity Badge", () => {
        it("should render badge for ORIGINAL", () => {
            const product = createProduct({ authenticity: "ORIGINAL" });
            render(<ProductQualityBadges product={product} />);

            expect(screen.getByText("Original")).toBeInTheDocument();
            expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
        });

        it("should render badge for REPRODUCTION", () => {
            const product = createProduct({ authenticity: "REPRODUCTION" });
            render(<ProductQualityBadges product={product} />);

            expect(screen.getByText("Reproduction")).toBeInTheDocument();
        });

        it("should not render for UNKNOWN", () => {
            const product = createProduct({ authenticity: "UNKNOWN" });
            render(<ProductQualityBadges product={product} />);

            expect(screen.queryByTestId("shield-icon")).not.toBeInTheDocument();
        });

        it("should not render when authenticity is null", () => {
            const product = createProduct({ authenticity: null });
            render(<ProductQualityBadges product={product} />);

            expect(screen.queryByTestId("shield-icon")).not.toBeInTheDocument();
        });
    });

    describe("Condition Badge", () => {
        it("should render badge for EXCELLENT", () => {
            const product = createProduct({ condition: "EXCELLENT" });
            render(<ProductQualityBadges product={product} />);

            expect(screen.getByText("Excellent")).toBeInTheDocument();
            expect(screen.getByTestId("star-icon")).toBeInTheDocument();
        });

        it("should render badge for FAIR", () => {
            const product = createProduct({ condition: "FAIR" });
            render(<ProductQualityBadges product={product} />);

            expect(screen.getByText("Fair")).toBeInTheDocument();
        });

        it("should not render for UNKNOWN", () => {
            const product = createProduct({ condition: "UNKNOWN" });
            render(<ProductQualityBadges product={product} />);

            expect(screen.queryByTestId("star-icon")).not.toBeInTheDocument();
        });

        it("should not render when condition is null", () => {
            const product = createProduct({ condition: null });
            render(<ProductQualityBadges product={product} />);

            expect(screen.queryByTestId("star-icon")).not.toBeInTheDocument();
        });
    });

    describe("Multiple Badges", () => {
        it("should render all badges when all data present", () => {
            const product = createProduct({
                originYear: 1850,
                authenticity: "ORIGINAL",
                condition: "EXCELLENT",
            });
            render(<ProductQualityBadges product={product} />);

            expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
            expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
            expect(screen.getByTestId("star-icon")).toBeInTheDocument();
        });

        it("should render nothing when no data", () => {
            const product = createProduct();
            render(<ProductQualityBadges product={product} />);

            expect(screen.queryByTestId("calendar-icon")).not.toBeInTheDocument();
            expect(screen.queryByTestId("shield-icon")).not.toBeInTheDocument();
            expect(screen.queryByTestId("star-icon")).not.toBeInTheDocument();
        });

        it("should render only relevant badges", () => {
            const product = createProduct({
                originYear: 1850,
                condition: "EXCELLENT",
            });
            render(<ProductQualityBadges product={product} />);

            expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
            expect(screen.queryByTestId("shield-icon")).not.toBeInTheDocument();
            expect(screen.getByTestId("star-icon")).toBeInTheDocument();
        });
    });

    describe("Styling", () => {
        it("should apply white text to all badges", () => {
            const product = createProduct({
                originYear: 1850,
                authenticity: "ORIGINAL",
                condition: "EXCELLENT",
            });
            const { container } = render(<ProductQualityBadges product={product} />);

            const badges = container.querySelectorAll('[class*="text-white"]');
            expect(badges.length).toBe(3);
        });

        it("should apply correct color classes", () => {
            const product = createProduct({
                originYear: 1850,
                authenticity: "ORIGINAL",
                condition: "EXCELLENT",
            });
            const { container } = render(<ProductQualityBadges product={product} />);

            expect(container.querySelectorAll(".bg-green-700").length).toBe(3);
        });
    });
});
