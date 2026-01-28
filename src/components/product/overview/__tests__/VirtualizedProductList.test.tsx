import { describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { VirtualizedProductList } from "@/components/product/overview/VirtualizedProductList.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { screen, waitFor } from "@testing-library/react";

// Mock the virtualizer to render all items in tests
vi.mock("@tanstack/react-virtual", () => ({
    useVirtualizer: ({ count }: { count: number }) => ({
        getVirtualItems: () =>
            Array.from({ length: count }, (_, index) => ({
                index,
                start: index * 250,
                size: 250,
                end: (index + 1) * 250,
                key: index,
            })),
        getTotalSize: () => count * 250,
        measureElement: () => {},
    }),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({ children, ...props }: { children: React.ReactNode }) => (
            <a {...props}>{children}</a>
        ),
    };
});

const createMockProduct = (overrides: Partial<OverviewProduct> = {}): OverviewProduct => ({
    productId: "product-1",
    eventId: "event-1",
    shopId: "shop-1",
    shopsProductId: "shops-product-1",
    shopName: "Test Shop",
    shopType: "AUCTION_HOUSE",
    title: "Test Product",
    description: "Test Description",
    price: "100 €",
    state: "AVAILABLE",
    url: null,
    images: [],
    created: new Date("2023-01-01"),
    updated: new Date("2023-01-02"),
    originYear: undefined,
    originYearMin: undefined,
    originYearMax: undefined,
    authenticity: "UNKNOWN",
    condition: "UNKNOWN",
    provenance: "UNKNOWN",
    restoration: "UNKNOWN",
    ...overrides,
});

describe("VirtualizedProductList", () => {
    it("should render product cards", () => {
        const products = [
            createMockProduct({ productId: "1", title: "Product 1" }),
            createMockProduct({ productId: "2", title: "Product 2" }),
        ];

        renderWithQueryClient(<VirtualizedProductList products={products} />);

        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("should render empty container when no products", () => {
        const { container } = renderWithQueryClient(<VirtualizedProductList products={[]} />);

        const virtualContainer = container.querySelector('div[style*="height: 0px"]');
        expect(virtualContainer).toBeInTheDocument();
    });

    it("should add test ids to product cards", () => {
        const products = [createMockProduct({ productId: "test-1" })];

        renderWithQueryClient(<VirtualizedProductList products={products} />);

        expect(screen.getByTestId("product-card-test-1")).toBeInTheDocument();
    });

    it("should render multiple products with correct positioning", () => {
        const products = [
            createMockProduct({ productId: "1", title: "Product 1" }),
            createMockProduct({ productId: "2", title: "Product 2" }),
            createMockProduct({ productId: "3", title: "Product 3" }),
        ];

        const { container } = renderWithQueryClient(<VirtualizedProductList products={products} />);

        // Check that container height is calculated correctly (3 products * 250px)
        const virtualContainer = container.querySelector('div[style*="height: 750px"]');
        expect(virtualContainer).toBeInTheDocument();

        // Verify all products are rendered
        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();
        expect(screen.getByText("Product 3")).toBeInTheDocument();
    });

    it("should trigger fetchNextPage when scrolling near the end", async () => {
        const fetchNextPage = vi.fn();
        const products = Array.from({ length: 10 }, (_, i) =>
            createMockProduct({ productId: `${i}`, title: `Product ${i}` }),
        );

        renderWithQueryClient(
            <VirtualizedProductList
                products={products}
                hasNextPage={true}
                isFetchingNextPage={false}
                fetchNextPage={fetchNextPage}
            />,
        );

        // With our mock, all items are rendered, so the effect should trigger
        // since the last virtual item (index 9) is >= products.length - 3 (7)
        await waitFor(() => {
            expect(fetchNextPage).toHaveBeenCalled();
        });
    });

    it("should not trigger fetchNextPage when already fetching", () => {
        const fetchNextPage = vi.fn();
        const products = Array.from({ length: 10 }, (_, i) =>
            createMockProduct({ productId: `${i}`, title: `Product ${i}` }),
        );

        renderWithQueryClient(
            <VirtualizedProductList
                products={products}
                hasNextPage={true}
                isFetchingNextPage={true}
                fetchNextPage={fetchNextPage}
            />,
        );

        expect(fetchNextPage).not.toHaveBeenCalled();
    });

    it("should not trigger fetchNextPage when no more pages", () => {
        const fetchNextPage = vi.fn();
        const products = Array.from({ length: 10 }, (_, i) =>
            createMockProduct({ productId: `${i}`, title: `Product ${i}` }),
        );

        renderWithQueryClient(
            <VirtualizedProductList
                products={products}
                hasNextPage={false}
                isFetchingNextPage={false}
                fetchNextPage={fetchNextPage}
            />,
        );

        expect(fetchNextPage).not.toHaveBeenCalled();
    });

    it("should apply padding to all items except the last one", () => {
        const products = [
            createMockProduct({ productId: "1", title: "Product 1" }),
            createMockProduct({ productId: "2", title: "Product 2" }),
            createMockProduct({ productId: "3", title: "Product 3" }),
        ];

        renderWithQueryClient(<VirtualizedProductList products={products} />);

        const firstCard = screen.getByTestId("product-card-1");
        const secondCard = screen.getByTestId("product-card-2");
        const lastCard = screen.getByTestId("product-card-3");

        expect(firstCard).toHaveClass("pb-4");
        expect(secondCard).toHaveClass("pb-4");
        expect(lastCard).not.toHaveClass("pb-4");
    });
});
