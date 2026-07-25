import { renderWithQueryClient } from "@/test/utils.tsx";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductDealerItems } from "../ProductDealerItems.tsx";
import { useDealerProducts } from "@/hooks/shop/useDealerProducts.ts";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import type React from "react";

vi.mock("@/hooks/shop/useDealerProducts.ts", () => ({
    useDealerProducts: vi.fn(),
}));

// Mock the entire embla carousel to avoid plugin comparison errors in jsdom
vi.mock("embla-carousel-react", () => ({
    default: () => [
        vi.fn(),
        {
            on: vi.fn(),
            off: vi.fn(),
            scrollPrev: vi.fn(),
            scrollNext: vi.fn(),
            canScrollNext: vi.fn(() => false),
            canScrollPrev: vi.fn(() => false),
        },
    ],
}));

vi.mock("@/hooks/notification/useMarkNotificationSeen.ts", () => ({
    useMarkNotificationSeen: () => ({ mutate: vi.fn() }),
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

const mockUseDealerProducts = vi.mocked(useDealerProducts);

const baseProduct: OverviewProduct = {
    productId: "p1",
    productSlugId: "product-1",
    eventId: "e1",
    shopId: "s1",
    shopSlugId: "shop-1",
    shopsProductId: "si1",
    shopName: "Test Shop",
    sellerName: "Test Shop",
    shopType: "AUCTION_HOUSE",
    title: "Ancient Vase",
    price: "100 €",
    state: "AVAILABLE",
    url: new URL("https://example.com"),
    images: [],
    created: new Date("2024-01-01"),
    updated: new Date("2024-06-01"),
};

const defaultProps = {
    shopName: "Test Shop",
    shopSlugId: "shop-1",
    excludeProductId: "current-product",
};

describe("ProductDealerItems", () => {
    it("renders skeleton loaders while loading", () => {
        mockUseDealerProducts.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
        } as never);

        renderWithQueryClient(<ProductDealerItems {...defaultProps} />);

        expect(screen.getAllByTestId("product-grid-item-skeleton")).toHaveLength(4);
    });

    it("renders an error state when the hook returns an error", () => {
        mockUseDealerProducts.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: { message: "Failed to load" },
        } as never);

        renderWithQueryClient(<ProductDealerItems {...defaultProps} />);

        expect(screen.getByText("Failed to load")).toBeInTheDocument();
    });

    it("renders nothing when there are no other items from the dealer", () => {
        mockUseDealerProducts.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        const { container } = renderWithQueryClient(<ProductDealerItems {...defaultProps} />);

        expect(container).toBeEmptyDOMElement();
    });

    it("renders product cards and a link to the shop", () => {
        mockUseDealerProducts.mockReturnValue({
            data: [
                { ...baseProduct, productId: "p1", title: "Ancient Vase" },
                { ...baseProduct, productId: "p2", title: "Roman Coin" },
            ],
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        renderWithQueryClient(<ProductDealerItems {...defaultProps} />);

        expect(screen.getByText("Ancient Vase")).toBeInTheDocument();
        expect(screen.getByText("Roman Coin")).toBeInTheDocument();
        const shopLink = screen.getByText("Shop ansehen").closest("a");
        expect(shopLink).toHaveAttribute("to", "/shops/$shopSlugId");
    });

    it("renders product cards in a carousel", () => {
        mockUseDealerProducts.mockReturnValue({
            data: [{ ...baseProduct, productId: "p1", title: "Ancient Vase" }],
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        const { container } = renderWithQueryClient(<ProductDealerItems {...defaultProps} />);

        expect(container.querySelector('[data-slot="carousel"]')).toBeInTheDocument();
    });

    it("calls useDealerProducts with the provided shopName and excludeProductId", () => {
        mockUseDealerProducts.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        renderWithQueryClient(<ProductDealerItems {...defaultProps} />);

        expect(mockUseDealerProducts).toHaveBeenCalledWith("Test Shop", "current-product");
    });
});
