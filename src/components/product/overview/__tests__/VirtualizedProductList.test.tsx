import { describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { VirtualizedProductList } from "@/components/product/overview/VirtualizedProductList.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import { screen } from "@testing-library/react";

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

    it("should pass fetchNextPage function", () => {
        const fetchNextPage = vi.fn();
        const products = [createMockProduct()];

        renderWithQueryClient(
            <VirtualizedProductList
                products={products}
                hasNextPage={true}
                isFetchingNextPage={false}
                fetchNextPage={fetchNextPage}
            />,
        );

        expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
});
