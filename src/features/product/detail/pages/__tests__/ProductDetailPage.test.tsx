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

vi.mock("@/features/product/detail/components/ProductPriceChart.tsx", () => ({
    ProductPriceChart: () => <div data-testid="product-price-chart">ProductPriceChart</div>,
}));

vi.mock("@/features/product/detail/components/ProductHistory.tsx", () => ({
    ProductHistory: () => <div data-testid="product-history">ProductHistory</div>,
}));

vi.mock("@/features/product/detail/components/similar/ProductSimilar.tsx", () => ({
    ProductSimilar: () => <div data-testid="product-similar">ProductSimilar</div>,
}));

vi.mock("@/features/product/detail/components/dealer/ProductDealerItems.tsx", () => ({
    ProductDealerItems: () => <div data-testid="product-dealer-items">ProductDealerItems</div>,
}));

describe("ProductDetailPage", () => {
    const mockProduct = makeProductListingDetail({ title: "Test Product" });

    it("should render ProductInfo component", () => {
        renderWithQueryClient(<ProductDetailPage product={mockProduct} />);
        expect(screen.getByTestId("product-info")).toBeInTheDocument();
        expect(screen.getByText("ProductInfo: Test Product")).toBeInTheDocument();
    });

    it("should render ProductPriceChart component", () => {
        renderWithQueryClient(<ProductDetailPage product={mockProduct} />);
        expect(screen.getByTestId("product-price-chart")).toBeInTheDocument();
    });

    it("should render ProductHistory component", () => {
        renderWithQueryClient(<ProductDetailPage product={mockProduct} />);
        expect(screen.getByTestId("product-history")).toBeInTheDocument();
    });

    it("should render ProductDealerItems component", () => {
        renderWithQueryClient(<ProductDetailPage product={mockProduct} />);
        expect(screen.getByTestId("product-dealer-items")).toBeInTheDocument();
    });

    it("should render all components together", () => {
        renderWithQueryClient(<ProductDetailPage product={mockProduct} />);
        expect(screen.getByTestId("product-info")).toBeInTheDocument();
        expect(screen.getByTestId("product-price-chart")).toBeInTheDocument();
        expect(screen.getByTestId("product-history")).toBeInTheDocument();
        expect(screen.getByTestId("product-similar")).toBeInTheDocument();
        expect(screen.getByTestId("product-dealer-items")).toBeInTheDocument();
    });
});
