import type { ProductDetail } from "@/data/internal/ProductDetails.ts";
import { screen } from "@testing-library/react";
import { ProductDetailPage } from "../../detail/ProductDetailPage.tsx";
import { vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";

vi.mock("@/components/product/detail/ProductInfo.tsx", () => ({
    ProductInfo: ({ product }: { product: ProductDetail }) => (
        <div data-testid="product-info">ProductInfo: {product.title}</div>
    ),
}));

vi.mock("@/components/product/detail/ProductPriceChart.tsx", () => ({
    ProductPriceChart: () => <div data-testid="product-price-chart">ProductPriceChart</div>,
}));

vi.mock("@/components/product/detail/ProductHistory.tsx", () => ({
    ProductHistory: () => <div data-testid="product-history">ProductHistory</div>,
}));

vi.mock("@/components/product/ProductSimilar", () => ({
    ProductSimilar: () => <div data-testid="product-similar">ProductSimilar</div>,
}));

describe("ProductDetailPage", () => {
    const mockProduct: ProductDetail = {
        productId: "1",
        eventId: "",
        shopId: "",
        shopsProductId: "",
        shopName: "Test Shop",
        title: "Test Product",
        description: "Test description",
        price: "99€",
        state: "AVAILABLE",
        url: new URL("https://example.com"),
        images: [new URL("https://example.com/image.jpg")],
        created: new Date(),
        updated: new Date(),
        history: [],

        originYear: null,
        originYearMin: null,
        originYearMax: null,
        authenticity: "UNKNOWN",
        condition: "UNKNOWN",
        provenance: "UNKNOWN",
        restoration: "UNKNOWN",
    };

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

    it("should render all three components together", () => {
        renderWithQueryClient(<ProductDetailPage product={mockProduct} />);
        expect(screen.getByTestId("product-info")).toBeInTheDocument();
        expect(screen.getByTestId("product-price-chart")).toBeInTheDocument();
        expect(screen.getByTestId("product-history")).toBeInTheDocument();
    });
});
