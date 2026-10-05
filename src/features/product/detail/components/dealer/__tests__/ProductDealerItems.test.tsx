import { makeProductListing } from "@/test/fixtures.ts";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductDealerItems } from "../ProductDealerItems.tsx";
import { useDealerProducts } from "@/features/product/detail/api/useDealerProducts.ts";
import type React from "react";

vi.mock("@/features/product/detail/api/useDealerProducts.ts", () => ({
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

vi.mock("@/features/notification-center/api/useMarkNotificationsSeen.ts", () => ({
    useMarkNotificationsSeen: () => ({ mutate: vi.fn() }),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({
            children,
            to,
            params,
            from: _from,
            ...props
        }: {
            children: React.ReactNode;
            to: string;
            params?:
                | Record<string, string>
                | ((current: Record<string, string>) => Record<string, string>);
            from?: string;
        }) => {
            const resolvedParams =
                typeof params === "function" ? params({ lng: "de" }) : (params ?? { lng: "de" });
            let href = to;
            for (const [key, value] of Object.entries(resolvedParams)) {
                href = href.replace(`$${key}`, value);
            }
            return (
                <a href={href} {...props}>
                    {children}
                </a>
            );
        },
    };
});

const mockUseDealerProducts = vi.mocked(useDealerProducts);

const baseProduct = makeProductListing({ title: "Ancient Vase" });
const defaultProps = {
    source: { listingSourceId: "ls_01TESTSOURCE", slugId: "shop-1", name: "Test Shop" },
    excludeProductListingId: "current-product",
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
                { ...baseProduct, productListingId: "p1", title: "Ancient Vase" },
                { ...baseProduct, productListingId: "p2", title: "Roman Coin" },
            ],
            isLoading: false,
            isError: false,
            error: null,
        } as never);

        renderWithQueryClient(<ProductDealerItems {...defaultProps} />);

        expect(screen.getByText("Ancient Vase")).toBeInTheDocument();
        expect(screen.getByText("Roman Coin")).toBeInTheDocument();
        const shopLink = screen.getByText("Anbieterprofil ansehen").closest("a");
        expect(shopLink).toHaveAttribute("href", "/de/shops/shop-1");
    });

    it("renders product cards in a carousel", () => {
        mockUseDealerProducts.mockReturnValue({
            data: [{ ...baseProduct, productListingId: "p1", title: "Ancient Vase" }],
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

        expect(mockUseDealerProducts).toHaveBeenCalledWith("ls_01TESTSOURCE", "current-product");
    });
});
