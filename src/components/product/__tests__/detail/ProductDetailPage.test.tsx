import type { ProductDetail } from "@/data/internal/ProductDetails.ts";
import { screen } from "@testing-library/react";
import { ProductDetailPage } from "../../detail/ProductDetailPage.tsx";
import { vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";

vi.mock("@/components/product/detail/ProductInfo.tsx", () => ({
    ProductInfo: ({ item }: { item: ProductDetail }) => (
        <div data-testid="item-info">ProductInfo: {item.title}</div>
    ),
}));

vi.mock("@/components/product/detail/ProductPriceChart.tsx", () => ({
    ProductPriceChart: () => <div data-testid="item-price-chart">ProductPriceChart</div>,
}));

vi.mock("@/components/product/detail/ProductHistory.tsx", () => ({
    ProductHistory: () => <div data-testid="item-history">ProductHistory</div>,
}));

vi.mock("@/components/product/ProductSimilar", () => ({
    ProductSimilar: () => <div data-testid="item-similar">ProductSimilar</div>,
}));

describe("ProductDetailPage", () => {
    const mockItem: ProductDetail = {
        productId: "1",
        eventId: "",
        shopId: "",
        shopsProductId: "",
        shopName: "Test Shop",
        title: "Test Item",
        description: "Test description",
        price: "99€",
        state: "AVAILABLE",
        url: new URL("https://example.com"),
        images: [new URL("https://example.com/image.jpg")],
        created: new Date(),
        updated: new Date(),
        history: [],
    };

    it("should render ProductInfo component", () => {
        renderWithQueryClient(<ProductDetailPage item={mockItem} />);
        expect(screen.getByTestId("item-info")).toBeInTheDocument();
        expect(screen.getByText("ProductInfo: Test Item")).toBeInTheDocument();
    });

    it("should render ProductPriceChart component", () => {
        renderWithQueryClient(<ProductDetailPage item={mockItem} />);
        expect(screen.getByTestId("item-price-chart")).toBeInTheDocument();
    });

    it("should render ProductHistory component", () => {
        renderWithQueryClient(<ProductDetailPage item={mockItem} />);
        expect(screen.getByTestId("item-history")).toBeInTheDocument();
    });

    it("should render all three components together", () => {
        renderWithQueryClient(<ProductDetailPage item={mockItem} />);
        expect(screen.getByTestId("item-info")).toBeInTheDocument();
        expect(screen.getByTestId("item-price-chart")).toBeInTheDocument();
        expect(screen.getByTestId("item-history")).toBeInTheDocument();
    });
});
