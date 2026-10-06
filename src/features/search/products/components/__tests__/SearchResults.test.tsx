import { makeProductListing, makeProductListingUserState } from "@/test/fixtures.ts";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import { useSearch } from "@/features/search/products/hooks/useSearch.ts";
import { SearchResults } from "@/features/search/products/components/SearchResults.tsx";
import type React from "react";
import { renderWithQueryClient } from "@/test/utils.tsx";

vi.mock("@/features/search/products/hooks/useSearch.ts", () => ({
    useSearch: vi.fn(),
}));

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

vi.mock("@/features/watchlist/components/NotificationButton", () => ({
    NotificationButton: () => (
        <button type="button" data-testid="notification-button">
            Notification
        </button>
    ),
}));

const intersectionState = vi.hoisted(() => ({
    inView: false,
}));

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: intersectionState.inView }),
}));

vi.mock("lottie-react", () => ({
    Lottie: () => <div data-testid="lottie-animation" />,
}));

const mockUseSearch = vi.mocked(useSearch);

const buildQueryPayload = (
    products: ProductListing[],
    total = products.length,
): SearchResultData => ({
    products,
    size: products.length,
    total,
    searchAfter: undefined,
});

type SearchMockOptions = {
    products?: ProductListing[];
    total?: number;
    hasNextPage?: boolean;
    fetchNextPage?: () => void;
    isPending?: boolean;
    error?: Error | null;
};

function setSearchMock({
    products = [],
    total,
    hasNextPage = false,
    fetchNextPage = vi.fn(),
    isPending = false,
    error = null,
}: SearchMockOptions = {}) {
    const pages = isPending ? undefined : [buildQueryPayload(products, total)];
    mockUseSearch.mockReturnValue({
        data: pages ? { pages, pageParams: [undefined] } : undefined,
        isPending,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage: false,
    } as unknown as ReturnType<typeof useSearch>);
}

describe("SearchResults", () => {
    beforeEach(() => {
        mockUseSearch.mockReset();
        intersectionState.inView = false;
        setSearchMock();
    });

    it("renders a message when query length is less than 3 characters", () => {
        renderWithQueryClient(<SearchResults searchFilters={{ q: "ab" }} />);
        expect(
            screen.getByText("Bitte geben Sie mindestens 3 Zeichen ein, um die Suche zu starten."),
        ).toBeInTheDocument();
    });

    it("renders skeleton loaders while data is loading", () => {
        setSearchMock({ isPending: true });
        renderWithQueryClient(<SearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getAllByTestId("product-card-skeleton")).toHaveLength(4);
    });

    it("renders an error message when there is an error", () => {
        setSearchMock({ error: new Error("API Error") });
        renderWithQueryClient(<SearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getByText("Fehler beim Laden")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Die Suchergebnisse konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
            ),
        ).toBeInTheDocument();
    });

    it("renders a message when no products are found", () => {
        setSearchMock({ products: [] });
        renderWithQueryClient(<SearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getByText("Keine Ergebnisse gefunden")).toBeInTheDocument();
        expect(
            screen.getByText("Versuchen Sie, Ihren Suchbegriff oder Ihre Filter anzupassen."),
        ).toBeInTheDocument();
    });

    it("reports zero results when API total is zero", () => {
        const onTotalChange = vi.fn();

        setSearchMock({ products: [], total: 0 });
        renderWithQueryClient(
            <SearchResults searchFilters={{ q: "test" }} onTotalChange={onTotalChange} />,
        );

        expect(onTotalChange).toHaveBeenCalledWith(0);
    });

    it("renders HiddenMatchCard instead of ProductCard when product is hidden", () => {
        const hiddenProduct = makeProductListing({
            title: "Inhalt verborgen",
            userState: makeProductListingUserState({
                searchFilter: { matched: true, hidden: true },
            }),
        });
        setSearchMock({ products: [hiddenProduct] });
        renderWithQueryClient(<SearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getByText(/Verborgen/i)).toBeInTheDocument();
        expect(screen.getByText(/Kontingent/i)).toBeInTheDocument();
    });

    it("renders a list of product cards when products are found", () => {
        const base = makeProductListing();

        setSearchMock({
            products: [
                { ...base, productListingId: "1", title: "Product 1" },
                { ...base, productListingId: "2", title: "Product 2" },
            ],
        });
        renderWithQueryClient(<SearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("loads the next page when the cursor indicates more results even if total is reached", async () => {
        const fetchNextPage = vi.fn();
        const product = makeProductListing({ productListingId: "1", title: "Product 1" });

        intersectionState.inView = true;
        setSearchMock({
            products: [product],
            total: 1,
            hasNextPage: true,
            fetchNextPage,
        });

        renderWithQueryClient(<SearchResults searchFilters={{ q: "test" }} />);

        await waitFor(() => expect(fetchNextPage).toHaveBeenCalledTimes(1));
    });
});
