import { makeProductListingDetail } from "@/test/fixtures.ts";
import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import { screen } from "@testing-library/react";
import { ProductDetailPage } from "../ProductDetailPage.tsx";
import { vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";

vi.mock("@/features/product/detail/components/ProductInfo.tsx", () => ({
    ProductInfo: ({ product }: { product: ProductListingDetail }) => (
        <div data-testid="product-info">ProductInfo: {product.title}</div>
    ),
}));

const mocks = vi.hoisted(() => ({
    currency: "EUR",
    useOptionalProductListingHistory: vi.fn((_id?: string, _currency?: string) => ({
        data: undefined,
    })),
}));

vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({
        preferences: { currency: mocks.currency, unitSystem: "METRIC" },
        updatePreferences: vi.fn(),
    }),
}));

vi.mock("@/features/product/detail/api/productListingHistoryQuery.ts", () => ({
    useOptionalProductListingHistory: mocks.useOptionalProductListingHistory,
}));

vi.mock("@/features/product/detail/components/ProductPriceChart.tsx", () => ({
    ProductPriceChart: ({ displayCurrency }: { displayCurrency?: string }) => (
        <div data-testid="product-price-chart">ProductPriceChart {displayCurrency}</div>
    ),
}));

vi.mock("@/features/product/detail/components/ProductHistory.tsx", () => ({
    ProductHistory: ({ displayCurrency }: { displayCurrency?: string }) => (
        <div data-testid="product-history">ProductHistory {displayCurrency}</div>
    ),
}));

vi.mock("@/features/product/detail/components/similar/ProductSimilar.tsx", () => ({
    ProductSimilar: () => <div data-testid="product-similar">ProductSimilar</div>,
}));

vi.mock("@/features/product/detail/components/dealer/ProductDealerItems.tsx", () => ({
    ProductDealerItems: () => <div data-testid="product-dealer-items">ProductDealerItems</div>,
}));

describe("ProductDetailPage", () => {
    const mockProduct = makeProductListingDetail({ title: "Test Product" });

    beforeEach(() => {
        mocks.currency = "EUR";
        mocks.useOptionalProductListingHistory.mockClear();
    });

    it("requests and displays history in the preferred currency", () => {
        mocks.currency = "RON";
        renderWithQueryClient(
            <ProductDetailPage product={mockProduct} productListingId="pl_123" />,
        );

        expect(mocks.useOptionalProductListingHistory).toHaveBeenCalledWith("pl_123", "RON");
        expect(screen.getByTestId("product-price-chart")).toHaveTextContent("RON");
        expect(screen.getByTestId("product-history")).toHaveTextContent("RON");
    });

    it("should render ProductInfo component", () => {
        renderWithQueryClient(<ProductDetailPage product={mockProduct} />);
        expect(screen.getByTestId("product-info")).toBeInTheDocument();
        expect(screen.getByText("ProductInfo: Test Product")).toBeInTheDocument();
    });

    it.each(["product-price-chart", "product-history", "product-dealer-items"])(
        "should render %s component",
        (testId) => {
            renderWithQueryClient(<ProductDetailPage product={mockProduct} />);
            expect(screen.getByTestId(testId)).toBeInTheDocument();
        },
    );

    it("should render all components together", () => {
        renderWithQueryClient(<ProductDetailPage product={mockProduct} />);
        expect(screen.getByTestId("product-info")).toBeInTheDocument();
        expect(screen.getByTestId("product-price-chart")).toBeInTheDocument();
        expect(screen.getByTestId("product-history")).toBeInTheDocument();
        expect(screen.getByTestId("product-similar")).toBeInTheDocument();
        expect(screen.getByTestId("product-dealer-items")).toBeInTheDocument();
    });
});
