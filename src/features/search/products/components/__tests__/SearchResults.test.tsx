import { makeProductListing, makeProductListingUserState } from "@/test/fixtures.ts";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";
import type { SearchResultData } from "@/data/internal/search/SearchResultData.ts";
import { useSearch } from "@/features/search/products/hooks/useSearch.ts";
import { SearchResults } from "@/features/search/products/components/SearchResults.tsx";
import type React from "react";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { GeographySearchError } from "@/features/search/products/lib/searchErrors.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SearchOrigin } from "@/features/search/products/hooks/useSearchOrigin.ts";

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

const intersectionState = vi.hoisted(() => ({
    inView: false,
}));

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: intersectionState.inView }),
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
    refetch?: () => void;
};

function setSearchMock({
    products = [],
    total,
    hasNextPage = false,
    fetchNextPage = vi.fn(),
    isPending = false,
    error = null,
    refetch = vi.fn(),
}: SearchMockOptions = {}) {
    const pages = isPending ? undefined : [buildQueryPayload(products, total)];
    mockUseSearch.mockReturnValue({
        data: pages ? { pages, pageParams: [undefined] } : undefined,
        isPending,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage: false,
        refetch,
    } as unknown as ReturnType<typeof useSearch>);
}

describe("SearchResults", () => {
    beforeEach(() => {
        mockUseSearch.mockReset();
        intersectionState.inView = false;
        setSearchMock();
    });

    it("renders skeleton loaders while data is loading", () => {
        setSearchMock({ isPending: true });
        renderWithQueryClient(
            <SearchResults searchFilters={{ q: "test" }} onResetFilters={vi.fn()} />,
        );
        expect(screen.getAllByTestId("search-result-skeleton")).toHaveLength(6);
    });

    it("renders an error message with a retry when there is an error", async () => {
        const refetch = vi.fn();
        setSearchMock({ error: new Error("API Error"), refetch });
        renderWithQueryClient(
            <SearchResults searchFilters={{ q: "test" }} onResetFilters={vi.fn()} />,
        );
        expect(
            screen.getByRole("heading", { name: "Fehler beim Laden der Ergebnisse." }),
        ).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
        expect(refetch).toHaveBeenCalledTimes(1);
        expect(
            screen.getByText(
                "Die Suchergebnisse konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
            ),
        ).toBeInTheDocument();
    });

    it("renders a message with a reset when no products are found", async () => {
        const onResetFilters = vi.fn();
        setSearchMock({ products: [] });
        renderWithQueryClient(
            <SearchResults searchFilters={{ q: "test" }} onResetFilters={onResetFilters} />,
        );
        expect(
            screen.getByRole("heading", { name: "Keine Ergebnisse gefunden." }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Versuchen Sie, Ihren Suchbegriff oder Ihre Filter anzupassen./),
        ).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Alle Filter zurücksetzen" }));
        expect(onResetFilters).toHaveBeenCalledTimes(1);
    });

    it("reports zero results when API total is zero", () => {
        const onTotalChange = vi.fn();

        setSearchMock({ products: [], total: 0 });
        renderWithQueryClient(
            <SearchResults
                searchFilters={{ q: "test" }}
                onTotalChange={onTotalChange}
                onResetFilters={vi.fn()}
            />,
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
        renderWithQueryClient(
            <SearchResults searchFilters={{ q: "test" }} onResetFilters={vi.fn()} />,
        );
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
        renderWithQueryClient(
            <SearchResults searchFilters={{ q: "test" }} onResetFilters={vi.fn()} />,
        );
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

        renderWithQueryClient(
            <SearchResults searchFilters={{ q: "test" }} onResetFilters={vi.fn()} />,
        );

        await waitFor(() => expect(fetchNextPage).toHaveBeenCalledTimes(1));
    });

    describe("location", () => {
        const home: SearchOrigin = {
            status: "ready",
            point: { latitude: 48.137, longitude: 11.575 },
            label: "Zuhause",
            key: "address:uaddr_home:1",
        };
        const distanceSearch = (mode: "APPROXIMATE" | "STRICT"): SearchFilterArguments => ({
            q: "test",
            location: {
                kind: "DISTANCE",
                near: { kind: "ADDRESS", addressId: "uaddr_home" },
                radius: { amount: 50, unit: "KILOMETERS" },
                mode,
            },
        });

        it("offers to reset a location the backend rejected", async () => {
            const onChangeFilters = vi.fn();
            setSearchMock({ error: new GeographySearchError("rejected") });
            renderWithQueryClient(
                <SearchResults
                    searchFilters={distanceSearch("APPROXIMATE")}
                    origin={home}
                    onChangeFilters={onChangeFilters}
                    onResetFilters={vi.fn()}
                />,
            );

            await userEvent.click(
                screen.getByRole("button", { name: "Standortfilter zurücksetzen" }),
            );
            expect(onChangeFilters).toHaveBeenCalledWith({ q: "test", location: undefined });
        });

        it("offers to widen, include approximate locations or drop an empty distance search", async () => {
            const onChangeFilters = vi.fn();
            const searchFilters = distanceSearch("STRICT");
            setSearchMock({ products: [] });
            renderWithQueryClient(
                <SearchResults
                    searchFilters={searchFilters}
                    origin={home}
                    onChangeFilters={onChangeFilters}
                    onResetFilters={vi.fn()}
                />,
            );
            expect(screen.getByText(/Zuhause/)).toBeInTheDocument();

            await userEvent.click(screen.getByRole("button", { name: /Im Umkreis von 100/ }));
            expect(onChangeFilters).toHaveBeenLastCalledWith({
                ...searchFilters,
                location: {
                    ...searchFilters.location,
                    radius: { amount: 100, unit: "KILOMETERS" },
                },
            });

            await userEvent.click(
                screen.getByRole("button", { name: "Ungefähre Standorte einbeziehen" }),
            );
            expect(onChangeFilters).toHaveBeenLastCalledWith({
                ...searchFilters,
                location: { ...searchFilters.location, mode: "APPROXIMATE" },
            });

            await userEvent.click(screen.getByRole("button", { name: "Entfernung entfernen" }));
            expect(onChangeFilters).toHaveBeenLastCalledWith({ q: "test", location: undefined });
        });

        it("offers no approximate switch when approximate locations already count", () => {
            setSearchMock({ products: [] });
            renderWithQueryClient(
                <SearchResults
                    searchFilters={distanceSearch("APPROXIMATE")}
                    origin={home}
                    onResetFilters={vi.fn()}
                />,
            );
            expect(
                screen.queryByRole("button", { name: "Ungefähre Standorte einbeziehen" }),
            ).not.toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Entfernung entfernen" })).toBeVisible();
        });
    });
});
