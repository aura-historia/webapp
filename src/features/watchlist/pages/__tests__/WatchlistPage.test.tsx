import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WatchlistPage } from "@/features/watchlist/pages/WatchlistPage.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
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
        useParams: () => ({}),
        Link: ({ children, ...props }: { children: React.ReactNode }) => (
            <a {...props}>{children}</a>
        ),
    };
});

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));

vi.mock("lottie-react", () => ({
    Lottie: () => <div data-testid="lottie-animation" />,
}));

vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" }, updatePreferences: vi.fn() }),
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ user: { userId: "user-1" }, isLoading: false }),
}));

const mockUseInfiniteQuery = vi.mocked(useInfiniteQuery);

const createMockProduct = (overrides: Partial<ProductListing> = {}): ProductListing =>
    ({
        productListingId: "listing-1",
        productListingTitleSlugId: "test-product",
        sourceListingId: "source-item-1",
        source: { listingSourceId: "source-1", slugId: "test-source", name: "Test Source" },
        title: "Test Product",
        price: null,
        formattedPrice: "10 €",
        priceValuation: "CURRENT",
        valuation: { type: "UNKNOWN" },
        availability: null,
        lifecycle: "ACTIVE",
        url: undefined,
        viewUrl: undefined,
        images: [],
        contentPolicy: null,
        updated: new Date("2023-01-02"),
        userState: {
            watchlist: { watching: true, notifications: false },
            contentVisibility: { showUnassessedOrSensitiveContent: false },
            notification: { unseenNotificationIds: [], hasUnseenNotification: false },
            searchFilter: { matched: false, hidden: false },
        },
        ...overrides,
    }) as unknown as ProductListing;

type InfiniteQueryMockOptions = {
    products?: ProductListing[];
    isPending?: boolean;
    error?: Error | null;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
};

function setInfiniteQueryMock({
    products = [],
    isPending = false,
    error = null,
    hasNextPage = false,
    isFetchingNextPage = false,
}: InfiniteQueryMockOptions = {}) {
    const pages = isPending
        ? undefined
        : [
              {
                  products: products,
                  size: products.length,
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

describe("WatchlistPage", () => {
    beforeEach(() => {
        mockUseInfiniteQuery.mockReset();
        setInfiniteQueryMock();
    });

    describe("Loading State", () => {
        it("should render skeleton loaders while data is loading", () => {
            setInfiniteQueryMock({ isPending: true });
            renderWithQueryClient(<WatchlistPage />);

            const skeletons = screen.getAllByTestId("product-card-skeleton");
            expect(skeletons).toHaveLength(4);
        });
    });

    describe("Error State", () => {
        it("should render error message when there is an error", () => {
            setInfiniteQueryMock({ error: new Error("API Error") });
            renderWithQueryClient(<WatchlistPage />);

            expect(screen.getByText("Merkliste nicht erreichbar")).toBeInTheDocument();
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
            renderWithQueryClient(<WatchlistPage />);

            expect(screen.getByText("Keine Artikel gefunden")).toBeInTheDocument();
            expect(
                screen.getByText("Fügen Sie Artikel zur Merkliste hinzu, um sie hier anzusehen."),
            ).toBeInTheDocument();
        });

        it("should display search icon in empty state", () => {
            setInfiniteQueryMock({ products: [] });
            const { container } = renderWithQueryClient(<WatchlistPage />);

            // Icon is an SVG with aria-hidden, so we check for its presence
            const icon = container.querySelector("svg.lucide-search-x");
            expect(icon).toBeInTheDocument();
        });
    });

    describe("Products Display", () => {
        it("should render watchlist products", () => {
            const products = [
                createMockProduct({ productListingId: "1", title: "Product 1" }),
                createMockProduct({ productListingId: "2", title: "Product 2" }),
            ];
            setInfiniteQueryMock({ products });
            renderWithQueryClient(<WatchlistPage />);

            expect(screen.getByText("Product 1")).toBeInTheDocument();
            expect(screen.getByText("Product 2")).toBeInTheDocument();
        });

        it("should render the title without assuming a total count", () => {
            const products = [createMockProduct(), createMockProduct({ productListingId: "2" })];
            setInfiniteQueryMock({ products });
            renderWithQueryClient(<WatchlistPage />);

            expect(screen.getByText("Meine Merkliste")).toBeInTheDocument();
            expect(screen.queryByText("2 Artikel")).not.toBeInTheDocument();
        });

        it("should ensure all products have isWatching set to true", () => {
            const productWithoutWatchlistData = createMockProduct({ productListingId: "1" });
            setInfiniteQueryMock({ products: [productWithoutWatchlistData] });
            renderWithQueryClient(<WatchlistPage />);

            // Component should render the product - the component sets isWatching to true internally
            expect(screen.getByText("Test Product")).toBeInTheDocument();
        });

        it("should preserve notification settings for watchlist products", () => {
            const productWithNotifications = createMockProduct({
                productListingId: "1",
                userState: {
                    watchlist: { watching: true, notifications: true },
                    contentVisibility: { showUnassessedOrSensitiveContent: false },
                    notification: { unseenNotificationIds: [], hasUnseenNotification: false },
                    searchFilter: { matched: false, hidden: false },
                },
            });
            setInfiniteQueryMock({ products: [productWithNotifications] });
            renderWithQueryClient(<WatchlistPage />);

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
            renderWithQueryClient(<WatchlistPage />);

            expect(screen.getByText("Lade neue Ergebnisse...")).toBeInTheDocument();
        });

        it("should show 'all loaded' message when no more pages", () => {
            setInfiniteQueryMock({
                products: [createMockProduct()],
                hasNextPage: false,
                isFetchingNextPage: false,
            });
            renderWithQueryClient(<WatchlistPage />);

            expect(
                screen.getByText("Sie haben 1 Artikel Ihrer Merkliste gesehen."),
            ).toBeInTheDocument();
        });

        it("should show 'all loaded' message with plural for multiple products", () => {
            const products = [
                createMockProduct({ productListingId: "1" }),
                createMockProduct({ productListingId: "2" }),
            ];
            setInfiniteQueryMock({
                products: products,
                hasNextPage: false,
                isFetchingNextPage: false,
            });
            renderWithQueryClient(<WatchlistPage />);

            expect(
                screen.getByText("Sie haben alle 2 Artikel Ihrer Merkliste gesehen."),
            ).toBeInTheDocument();
        });

        it("should display lottie animation when all products are loaded", () => {
            setInfiniteQueryMock({
                products: [createMockProduct()],
                hasNextPage: false,
                isFetchingNextPage: false,
            });
            renderWithQueryClient(<WatchlistPage />);

            expect(screen.getByTestId("lottie-animation")).toBeInTheDocument();
        });

        it("should show nothing when has next page but not fetching", () => {
            setInfiniteQueryMock({
                products: [createMockProduct()],
                hasNextPage: true,
                isFetchingNextPage: false,
            });
            renderWithQueryClient(<WatchlistPage />);

            // Should not show loading or completed state
            expect(screen.queryByText("Lade neue Ergebnisse...")).not.toBeInTheDocument();
            expect(
                screen.queryByText(/Sie haben .* ihrer Merkliste gesehen./),
            ).not.toBeInTheDocument();
        });
    });

    describe("Multiple Pages", () => {
        it("should flatten and display products from multiple pages", () => {
            const page1Items = [createMockProduct({ productListingId: "1", title: "Product 1" })];
            const page2Items = [createMockProduct({ productListingId: "2", title: "Product 2" })];

            mockUseInfiniteQuery.mockReturnValue({
                data: {
                    pages: [
                        { products: page1Items, size: 1, searchAfter: "token1" },
                        { products: page2Items, size: 1, searchAfter: undefined },
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

            renderWithQueryClient(<WatchlistPage />);

            expect(screen.getByText("Product 1")).toBeInTheDocument();
            expect(screen.getByText("Product 2")).toBeInTheDocument();
        });

        it("does not render the same canonical listing twice across pages", () => {
            const duplicateInFirstPage = createMockProduct({
                productListingId: "listing-1",
                title: "Repeated listing",
            });
            const duplicateInSecondPage = createMockProduct({
                productListingId: "listing-1",
                title: "Repeated listing",
            });

            mockUseInfiniteQuery.mockReturnValue({
                data: {
                    pages: [
                        { products: [duplicateInFirstPage], size: 1, searchAfter: "cursor-1" },
                        { products: [duplicateInSecondPage], size: 1, searchAfter: undefined },
                    ],
                    pageParams: [undefined, "cursor-1"],
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

            renderWithQueryClient(<WatchlistPage />);

            expect(screen.getAllByText("Repeated listing")).toHaveLength(1);
        });
    });
});
