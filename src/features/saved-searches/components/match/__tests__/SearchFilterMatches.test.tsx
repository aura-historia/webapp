import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { SearchFilterMatches } from "../SearchFilterMatches.tsx";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import type React from "react";

const mockUseSearchFilterMatchedProducts = vi.hoisted(() => vi.fn());
const observedRef = vi.hoisted(() => vi.fn());

vi.mock("@/features/saved-searches/api/useSearchFilterMatchedProducts.ts", () => ({
    useSearchFilterMatchedProducts: mockUseSearchFilterMatchedProducts,
}));

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: observedRef, inView: false }),
}));

vi.mock("@/features/saved-searches/components/match/SearchFilterMatchCard.tsx", () => ({
    SearchFilterMatchCard: ({ product }: { product: ProductListing }) => (
        <div data-testid="search-filter-match-card">{product.title}</div>
    ),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({ children, to, ...props }: { children: React.ReactNode; to?: string }) => (
            <a href={to} {...props}>
                {children}
            </a>
        ),
    };
});

const buildProduct = (overrides: Partial<ProductListing> = {}): ProductListing => ({
    productListingId: "p1",
    source: { listingSourceId: "s1", name: "Test Shop", slugId: "shop-1" },
    sourceListingId: "si1",
    title: "Antike Vase",
    priceValuation: "CURRENT",
    valuation: { type: "CURRENT", fxRateId: "fx-1", capturedAt: new Date("2024-01-01") },
    availability: "AVAILABLE",
    lifecycle: "ACTIVE",
    images: [],
    contentPolicy: null,
    updated: new Date("2024-01-01"),
    ...overrides,
});

type MatchesMockOptions = {
    products?: ProductListing[];
    total?: number;
    isPending?: boolean;
    error?: Error | null;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    refetch?: () => void;
};

function setMatchesMock({
    products = [],
    total,
    isPending = false,
    error = null,
    hasNextPage = false,
    isFetchingNextPage = false,
    refetch = vi.fn(),
}: MatchesMockOptions = {}) {
    const resolvedTotal = total ?? products.length;
    mockUseSearchFilterMatchedProducts.mockReturnValue({
        data: isPending
            ? undefined
            : {
                  pages: [{ items: products, size: products.length, total: resolvedTotal }],
                  pageParams: [undefined],
              },
        isPending,
        error,
        fetchNextPage: vi.fn(),
        hasNextPage,
        isFetchingNextPage,
        refetch,
    });
}

describe("SearchFilterMatches", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setMatchesMock();
    });

    it("observes a sentinel before requesting the next page", () => {
        setMatchesMock({ products: [buildProduct()], hasNextPage: true });
        renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
        expect(observedRef).toHaveBeenCalledWith(expect.any(HTMLElement));
        expect(screen.queryByTestId("list-loader-check")).not.toBeInTheDocument();
    });

    it("keeps observing an empty page when its cursor has more matches", () => {
        setMatchesMock({ products: [], hasNextPage: true });
        renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
        expect(observedRef).toHaveBeenCalledWith(expect.any(HTMLElement));
        expect(
            screen.queryByRole("heading", { name: "Noch keine Treffer." }),
        ).not.toBeInTheDocument();
    });

    describe("Loading state", () => {
        it("renders skeleton cards while matches are loading", () => {
            setMatchesMock({ isPending: true });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByRole("status")).toHaveTextContent("Treffer werden geladen");
            expect(screen.getAllByTestId("search-result-skeleton")).toHaveLength(4);
        });

        it("does not show the match count while loading", () => {
            setMatchesMock({ isPending: true });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.queryByText(/Produkte?$/)).not.toBeInTheDocument();
        });
    });

    describe("Error state", () => {
        it("renders an error panel when matches fail to load", () => {
            setMatchesMock({ error: new Error("fetch failed") });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByRole("alert")).toBeInTheDocument();
            expect(
                screen.getByRole("heading", { name: "Treffer nicht verfügbar." }),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Die Treffer konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
                ),
            ).toBeInTheDocument();
        });

        it("retries loading the matches", () => {
            const refetch = vi.fn();
            setMatchesMock({ error: new Error("fetch failed"), refetch });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
            expect(refetch).toHaveBeenCalledTimes(1);
        });
    });

    describe("Empty state", () => {
        it("renders the no-matches panel when there are no products", () => {
            setMatchesMock({ products: [], total: 0 });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(
                screen.getByRole("heading", { name: "Noch keine Treffer." }),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Für diesen Suchauftrag wurden noch keine passenden Objekte gefunden. Passen Sie den Suchauftrag gegebenenfalls an.",
                ),
            ).toBeInTheDocument();
        });

        it("offers editing the filter when onEdit is given", () => {
            const onEdit = vi.fn();
            setMatchesMock({ products: [], total: 0 });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" onEdit={onEdit} />);
            fireEvent.click(screen.getByRole("button", { name: "Suchauftrag bearbeiten" }));
            expect(onEdit).toHaveBeenCalledTimes(1);
        });

        it("omits the edit button without onEdit", () => {
            setMatchesMock({ products: [], total: 0 });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.queryByRole("button")).not.toBeInTheDocument();
        });
    });

    describe("Product list", () => {
        it("renders one match card per product", () => {
            setMatchesMock({
                products: [
                    buildProduct({ productListingId: "p1", title: "Vase 1" }),
                    buildProduct({ productListingId: "p2", title: "Vase 2" }),
                ],
                total: 2,
            });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getAllByTestId("search-filter-match-card")).toHaveLength(2);
            expect(screen.getByText("Vase 1")).toBeInTheDocument();
            expect(screen.getByText("Vase 2")).toBeInTheDocument();
        });

        it("renders the hidden match card instead of a product card for hidden products", () => {
            setMatchesMock({
                products: [
                    buildProduct({ productListingId: "p1", title: "Sichtbar" }),
                    buildProduct({
                        productListingId: "p2",
                        title: "Verborgen",
                        userState: {
                            watchlist: { watching: false, notifications: false },
                            notification: {
                                unseenNotificationIds: [],
                                hasUnseenNotification: false,
                            },
                            contentVisibility: { showUnassessedOrSensitiveContent: false },
                            searchFilter: { matched: true, hidden: true },
                        },
                    }),
                ],
                total: 2,
            });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByTestId("search-filter-match-card")).toBeInTheDocument();
            expect(
                screen.getByRole("article", { name: "Verborgener Treffer" }),
            ).toBeInTheDocument();
            expect(screen.queryByText("Verborgen")).not.toBeInTheDocument();
        });

        it("renders the section heading", () => {
            setMatchesMock({ products: [buildProduct()], total: 1 });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(
                screen.getByRole("heading", { level: 2, name: "Gefundene Objekte." }),
            ).toBeInTheDocument();
        });

        it("renders the total product count", () => {
            setMatchesMock({ products: [buildProduct()], total: 42 });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByText("42 Produkte")).toBeInTheDocument();
        });
    });

    describe("Pagination", () => {
        it("shows all-loaded indicator when all products are displayed", () => {
            setMatchesMock({
                products: [buildProduct()],
                total: 1,
                hasNextPage: false,
                isFetchingNextPage: false,
            });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByTestId("list-loader-check")).toBeInTheDocument();
            expect(screen.getByText("Sie haben 1 Treffer gesehen.")).toBeInTheDocument();
        });

        it("shows loading-more indicator when fetching the next page", () => {
            setMatchesMock({
                products: [buildProduct()],
                total: 10,
                hasNextPage: true,
                isFetchingNextPage: true,
            });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByRole("status")).toHaveTextContent("Weitere Treffer werden geladen…");
            expect(screen.getByText("1 von 10")).toBeInTheDocument();
        });
    });
});
