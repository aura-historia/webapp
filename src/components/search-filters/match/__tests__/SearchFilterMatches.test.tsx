import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { SearchFilterMatches } from "../SearchFilterMatches.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import type React from "react";

const mockUseUserSearchFilter = vi.hoisted(() => vi.fn());
const mockUseSearchFilterMatchedProducts = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/search-filters/useUserSearchFilter.ts", () => ({
    useUserSearchFilter: mockUseUserSearchFilter,
}));

vi.mock("@/hooks/search-filters/useSearchFilterMatchedProducts.ts", () => ({
    useSearchFilterMatchedProducts: mockUseSearchFilterMatchedProducts,
}));

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));

vi.mock("lottie-react", () => ({
    default: () => <div data-testid="lottie-animation" />,
}));

vi.mock("@/components/search-filters/match/SearchFilterMatchCard.tsx", () => ({
    SearchFilterMatchCard: ({ product }: { product: OverviewProduct }) => (
        <div data-testid="search-filter-match-card">{product.title}</div>
    ),
}));

vi.mock("@/components/product/overview/HiddenMatchCard.tsx", () => ({
    HiddenMatchCard: () => <div data-testid="hidden-match-card" />,
}));

vi.mock("@/components/product/overview/ProductCardSkeleton.tsx", () => ({
    ProductCardSkeleton: () => <div data-testid="product-card-skeleton" />,
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

const buildFilter = (overrides: Partial<UserSearchFilter> = {}): UserSearchFilter => ({
    id: "filter-1",
    userId: "user-1",
    name: "Antike Vasen",
    notifications: true,
    state: "ACTIVE",
    search: { q: "vase" },
    created: new Date("2024-01-01"),
    updated: new Date("2024-01-01"),
    ...overrides,
});

const buildProduct = (overrides: Partial<OverviewProduct> = {}): OverviewProduct => ({
    productId: "p1",
    productSlugId: "product-1",
    eventId: "e1",
    shopId: "s1",
    shopSlugId: "shop-1",
    shopsProductId: "si1",
    shopName: "Test Shop",
    sellerName: "Test Shop",
    shopType: "AUCTION_HOUSE",
    title: "Antike Vase",
    price: "100 €",
    state: "AVAILABLE",
    url: null,
    images: [],
    created: new Date("2024-01-01"),
    updated: new Date("2024-01-01"),
    ...overrides,
});

type MatchesMockOptions = {
    products?: OverviewProduct[];
    total?: number;
    isPending?: boolean;
    error?: Error | null;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
};

type FilterMockOptions = {
    filter?: UserSearchFilter | null;
    isPending?: boolean;
    error?: Error | null;
};

function setFilterMock({
    filter = buildFilter(),
    isPending = false,
    error = null,
}: FilterMockOptions = {}) {
    mockUseUserSearchFilter.mockReturnValue({ data: filter ?? undefined, isPending, error });
}

function setMatchesMock({
    products = [],
    total,
    isPending = false,
    error = null,
    hasNextPage = false,
    isFetchingNextPage = false,
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
    });
}

describe("SearchFilterMatches", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setFilterMock();
        setMatchesMock();
    });

    describe("Loading state", () => {
        it("renders skeleton cards while matches are loading", () => {
            setMatchesMock({ isPending: true });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getAllByTestId("product-card-skeleton")).toHaveLength(4);
        });

        it("renders skeleton cards while filter details are loading", () => {
            setFilterMock({ isPending: true });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getAllByTestId("product-card-skeleton")).toHaveLength(4);
        });
    });

    describe("Error state", () => {
        it("renders error EmptyState when matches fail to load", () => {
            setMatchesMock({ error: new Error("fetch failed") });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByText("Fehler beim Laden")).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Die Suchaufträge konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
                ),
            ).toBeInTheDocument();
        });

        it("renders error EmptyState when filter details fail to load", () => {
            setFilterMock({ error: new Error("not found") });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByText("Fehler beim Laden")).toBeInTheDocument();
        });
    });

    describe("Empty state", () => {
        it("renders no-matches EmptyState when there are no products", () => {
            setMatchesMock({ products: [], total: 0 });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByText("Keine Treffer gefunden")).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Für diesen Suchauftrag gibt es momentan keine passenden Produkte.",
                ),
            ).toBeInTheDocument();
        });

        it("renders a link back to search filters in the empty state", () => {
            setMatchesMock({ products: [], total: 0 });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(
                screen.getByRole("link", { name: "Zurück zu den Suchaufträgen" }),
            ).toBeInTheDocument();
        });
    });

    describe("Product list", () => {
        it("renders one match card per product", () => {
            setMatchesMock({
                products: [
                    buildProduct({ productId: "p1", title: "Vase 1" }),
                    buildProduct({ productId: "p2", title: "Vase 2" }),
                ],
                total: 2,
            });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getAllByTestId("search-filter-match-card")).toHaveLength(2);
            expect(screen.getByText("Vase 1")).toBeInTheDocument();
            expect(screen.getByText("Vase 2")).toBeInTheDocument();
        });

        it("renders HiddenMatchCard instead of a product card for hidden products", () => {
            setMatchesMock({
                products: [
                    buildProduct({ productId: "p1", title: "Sichtbar" }),
                    buildProduct({
                        productId: "p2",
                        title: "Verborgen",
                        userData: {
                            watchlistData: { isWatching: false, isNotificationEnabled: false },
                            notificationData: { hasUnseenNotification: false },
                            restrictedContentData: { consentGiven: false },
                            searchFilterData: { matched: true, hidden: true },
                        },
                    }),
                ],
                total: 2,
            });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByTestId("search-filter-match-card")).toBeInTheDocument();
            expect(screen.getByTestId("hidden-match-card")).toBeInTheDocument();
        });

        it("shows the filter name as heading", () => {
            setFilterMock({ filter: buildFilter({ name: "Antike Vasen" }) });
            setMatchesMock({ products: [buildProduct()], total: 1 });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByText("Antike Vasen")).toBeInTheDocument();
        });

        it("shows enhancedSearchDescription when present", () => {
            setFilterMock({
                filter: buildFilter({ enhancedSearchDescription: "KI-generierte Beschreibung" }),
            });
            setMatchesMock({ products: [buildProduct()], total: 1 });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByText("KI-generierte Beschreibung")).toBeInTheDocument();
        });

        it("renders the total product count", () => {
            setMatchesMock({ products: [buildProduct()], total: 42 });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByText("42 Suchaufträge")).toBeInTheDocument();
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
            expect(screen.getByTestId("lottie-animation")).toBeInTheDocument();
        });

        it("shows loading-more indicator when fetching the next page", () => {
            setMatchesMock({
                products: [buildProduct()],
                total: 10,
                hasNextPage: true,
                isFetchingNextPage: true,
            });
            renderWithQueryClient(<SearchFilterMatches filterId="filter-1" />);
            expect(screen.getByText("Lade neue Ergebnisse...")).toBeInTheDocument();
        });
    });
});
