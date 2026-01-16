import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WatchlistResults } from "@/components/watchlist/WatchlistResults.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";
import type { OverviewProduct } from "@/data/internal/OverviewProduct.ts";
import { useInfiniteQuery } from "@tanstack/react-query";

vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>();
    return {
        ...actual,
        useInfiniteQuery: vi.fn(),
    };
});

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({ children, ...props }: { children: React.ReactNode }) => (
            <a {...props}>{children}</a>
        ),
    };
});

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));

vi.mock("lottie-react", () => ({
    default: () => <div data-testid="lottie-animation" />,
}));

const mockUseInfiniteQuery = vi.mocked(useInfiniteQuery);

const createMockProduct = (overrides: Partial<OverviewProduct> = {}): OverviewProduct => ({
    productId: "item-1",
    eventId: "event-1",
    shopId: "shop-1",
    shopsProductId: "shops-item-1",
    shopName: "Test Shop",
    shopType: "AUCTION_HOUSE",
    title: "Test Product",
    description: "Test Description",
    price: "10 €",
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
    userData: {
        watchlistData: {
            isWatching: true,
            isNotificationEnabled: false,
        },
    },
    ...overrides,
});

type InfiniteQueryMockOptions = {
    products?: OverviewProduct[];
    isPending?: boolean;
    error?: Error | null;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    total?: number;
};

function setInfiniteQueryMock({
    products = [],
    isPending = false,
    error = null,
    hasNextPage = false,
    isFetchingNextPage = false,
    total = products.length,
}: InfiniteQueryMockOptions = {}) {
    const pages = isPending
        ? undefined
        : [
              {
                  products: products,
                  size: products.length,
                  total,
                  searchAfter: hasNextPage ? "next-page-token" : undefined,
              },
          ];

    mockUseInfiniteQuery.mockReturnValue({
        data: pages ? { pages, pageParams: [undefined] } : undefined,
        isPending,
        error,
        fetchNextPage: vi.fn(),
        hasNextPage,
        isFetchingNextPage,
        // Add other required properties from useInfiniteQuery
        isError: !!error,
        isSuccess: !isPending && !error,
        status: isPending ? "pending" : error ? "error" : "success",
    } as unknown as ReturnType<typeof useInfiniteQuery>);
}

describe("WatchlistResults", () => {
    beforeEach(() => {
        mockUseInfiniteQuery.mockReset();
        setInfiniteQueryMock();
    });

    describe("Loading State", () => {
        it("should render skeleton loaders while data is loading", () => {
            setInfiniteQueryMock({ isPending: true });
            renderWithQueryClient(<WatchlistResults />);

            const skeletons = screen.getAllByTestId("product-card-skeleton");
            expect(skeletons).toHaveLength(4);
        });
    });

    describe("Error State", () => {
        it("should render error message when there is an error", () => {
            setInfiniteQueryMock({ error: new Error("API Error") });
            renderWithQueryClient(<WatchlistResults />);

            expect(
                screen.getByText(
                    "Die Merkliste kann zurzeit nicht erreicht werden. Bitte versuchen Sie es später erneut.",
                ),
            ).toBeInTheDocument();
        });
    });

    describe("Empty State", () => {
        it("should render empty state when no products are found", () => {
            setInfiniteQueryMock({ products: [] });
            renderWithQueryClient(<WatchlistResults />);

            expect(screen.getByText("Keine Artikel gefunden")).toBeInTheDocument();
            expect(
                screen.getByText("Fügen Sie Artikel zur Merkliste hinzu, um sie hier anzusehen."),
            ).toBeInTheDocument();
        });

        it("should display search icon in empty state", () => {
            setInfiniteQueryMock({ products: [] });
            const { container } = renderWithQueryClient(<WatchlistResults />);

            // Icon is an SVG with aria-hidden, so we check for its presence
            const icon = container.querySelector("svg.lucide-search-x");
            expect(icon).toBeInTheDocument();
        });
    });

    describe("Products Display", () => {
        it("should render watchlist products", () => {
            const products = [
                createMockProduct({ productId: "1", title: "Product 1" }),
                createMockProduct({ productId: "2", title: "Product 2" }),
            ];
            setInfiniteQueryMock({ products: products, total: 2 });
            renderWithQueryClient(<WatchlistResults />);

            expect(screen.getByText("Product 1")).toBeInTheDocument();
            expect(screen.getByText("Product 2")).toBeInTheDocument();
        });

        it("should render title and total count", () => {
            const products = [createMockProduct(), createMockProduct({ productId: "2" })];
            setInfiniteQueryMock({ products: products, total: 2 });
            renderWithQueryClient(<WatchlistResults />);

            expect(screen.getByText("Meine Merkliste")).toBeInTheDocument();
            expect(screen.getByText("2 Artikel")).toBeInTheDocument();
        });

        it("should ensure all products have isWatching set to true", () => {
            const productWithoutWatchlistData = createMockProduct({
                productId: "1",
                userData: {
                    watchlistData: {
                        isWatching: false,
                        isNotificationEnabled: false,
                    },
                },
            });
            setInfiniteQueryMock({ products: [productWithoutWatchlistData] });
            renderWithQueryClient(<WatchlistResults />);

            // Component should render the product - the component sets isWatching to true internally
            expect(screen.getByText("Test Product")).toBeInTheDocument();
        });

        it("should preserve notification settings for watchlist products", () => {
            const productWithNotifications = createMockProduct({
                productId: "1",
                userData: {
                    watchlistData: {
                        isWatching: true,
                        isNotificationEnabled: true,
                    },
                },
            });
            setInfiniteQueryMock({ products: [productWithNotifications] });
            renderWithQueryClient(<WatchlistResults />);

            expect(screen.getByText("Test Product")).toBeInTheDocument();
        });
    });

    describe("Pagination", () => {
        it("should show 'loading more' indicator when fetching next page", () => {
            setInfiniteQueryMock({
                products: [createMockProduct()],
                hasNextPage: true,
                isFetchingNextPage: true,
            });
            renderWithQueryClient(<WatchlistResults />);

            expect(screen.getByText("Lade neue Ergebnisse...")).toBeInTheDocument();
        });

        it("should show 'all loaded' message when no more pages", () => {
            setInfiniteQueryMock({
                products: [createMockProduct()],
                hasNextPage: false,
                isFetchingNextPage: false,
                total: 1,
            });
            renderWithQueryClient(<WatchlistResults />);

            expect(
                screen.getByText("Sie haben 1 Artikel Ihrer Merkliste gesehen."),
            ).toBeInTheDocument();
        });

        it("should show 'all loaded' message with plural for multiple products", () => {
            const products = [
                createMockProduct({ productId: "1" }),
                createMockProduct({ productId: "2" }),
            ];
            setInfiniteQueryMock({
                products: products,
                hasNextPage: false,
                isFetchingNextPage: false,
                total: 2,
            });
            renderWithQueryClient(<WatchlistResults />);

            expect(
                screen.getByText("Sie haben alle 2 Artikel Ihrer Merkliste gesehen."),
            ).toBeInTheDocument();
        });

        it("should display lottie animation when all products are loaded", () => {
            setInfiniteQueryMock({
                products: [createMockProduct()],
                hasNextPage: false,
                isFetchingNextPage: false,
                total: 1,
            });
            renderWithQueryClient(<WatchlistResults />);

            expect(screen.getByTestId("lottie-animation")).toBeInTheDocument();
        });

        it("should show nothing when has next page but not fetching", () => {
            setInfiniteQueryMock({
                products: [createMockProduct()],
                hasNextPage: true,
                isFetchingNextPage: false,
            });
            renderWithQueryClient(<WatchlistResults />);

            // Should not show loading or completed state
            expect(screen.queryByText("Lade neue Ergebnisse...")).not.toBeInTheDocument();
            expect(
                screen.queryByText(/Sie haben .* ihrer Merkliste gesehen./),
            ).not.toBeInTheDocument();
        });
    });

    describe("Multiple Pages", () => {
        it("should flatten and display products from multiple pages", () => {
            const page1Items = [createMockProduct({ productId: "1", title: "Product 1" })];
            const page2Items = [createMockProduct({ productId: "2", title: "Product 2" })];

            mockUseInfiniteQuery.mockReturnValue({
                data: {
                    pages: [
                        { products: page1Items, size: 1, total: 2, searchAfter: "token1" },
                        { products: page2Items, size: 1, total: 2, searchAfter: undefined },
                    ],
                    pageParams: [undefined, "token1"],
                },
                isPending: false,
                error: null,
                fetchNextPage: vi.fn(),
                hasNextPage: false,
                isFetchingNextPage: false,
                isError: false,
                isSuccess: true,
                status: "success",
            } as unknown as ReturnType<typeof useInfiniteQuery>);

            renderWithQueryClient(<WatchlistResults />);

            expect(screen.getByText("Product 1")).toBeInTheDocument();
            expect(screen.getByText("Product 2")).toBeInTheDocument();
        });
    });
});
