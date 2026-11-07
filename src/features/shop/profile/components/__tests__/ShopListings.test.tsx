import { fireEvent, render, screen, within } from "@testing-library/react";
import type { InfiniteData } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import {
    type ShopProductsPage,
    useShopProducts,
} from "@/features/shop/profile/hooks/useShopProducts.ts";
import { makeProductListing, makePublicListingSource } from "@/test/fixtures.ts";
import { ShopListings } from "../ShopListings.tsx";

const intersection = vi.hoisted(() => ({ inView: false }));

vi.mock("@/features/shop/profile/hooks/useShopProducts.ts", () => ({
    useShopProducts: vi.fn(),
}));

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: intersection.inView }),
}));

vi.mock("@/features/search/products/components/results/SearchResultCard.tsx", () => ({
    SearchResultCard: ({ product }: { product: ProductListing }) => (
        <article data-testid="search-result-card">{product.title}</article>
    ),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({
            children,
            to,
            search,
            className,
        }: {
            children: ReactNode;
            to: string;
            search?: { q?: string };
            className?: string;
        }) => {
            const query = search?.q ? `?q=${encodeURIComponent(search.q)}` : "";
            return (
                <a href={`${to.replace("$lng", "de")}${query}`} className={className}>
                    {children}
                </a>
            );
        },
    };
});

const mockUseShopProducts = vi.mocked(useShopProducts);

const source = makePublicListingSource();

type MockOptions = {
    isPending?: boolean;
    error?: Error | null;
    products?: ProductListing[];
    total?: number;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
};

function setMock(options: MockOptions = {}) {
    const {
        isPending = false,
        error = null,
        products = [],
        hasNextPage = false,
        isFetchingNextPage = false,
    } = options;
    // An explicit `total: undefined` stands for a page without a total.
    const total = "total" in options ? options.total : products.length;
    const data: InfiniteData<ShopProductsPage> | undefined = isPending
        ? undefined
        : { pages: [{ products, total, searchAfter: undefined }], pageParams: [undefined] };
    const refetch = vi.fn();
    const fetchNextPage = vi.fn();

    mockUseShopProducts.mockReturnValue({
        data,
        isPending,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } as unknown as ReturnType<typeof useShopProducts>);

    return { refetch, fetchNextPage };
}

function renderListings(query = "", onQueryChange = vi.fn()) {
    render(<ShopListings source={source} query={query} onQueryChange={onQueryChange} />);
    return { onQueryChange };
}

const products = [
    makeProductListing({ productListingId: "p1", title: "Ancient Vase" }),
    makeProductListing({ productListingId: "p2", title: "Roman Coin" }),
];

/** The result line above the grid; the loader row under the grid is a second status. */
function resultLine() {
    return screen.getAllByRole("status")[0];
}

describe("ShopListings", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        intersection.inView = false;
        setMock();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Section header", () => {
        it("renders the listings heading and the recent-first sort label", () => {
            setMock({ products });
            renderListings();

            expect(
                screen.getByRole("heading", { level: 2, name: "Erfasste Angebote." }),
            ).toBeInTheDocument();
            expect(screen.getByText("Zuletzt aktualisierte zuerst")).toBeInTheDocument();
            expect(screen.queryByText("Beste Treffer zuerst")).not.toBeInTheDocument();
        });

        it("shows the relevance sort label while a query is active", () => {
            setMock({ products });
            renderListings("vase");

            expect(screen.getByText("Beste Treffer zuerst")).toBeInTheDocument();
            expect(screen.queryByText("Zuletzt aktualisierte zuerst")).not.toBeInTheDocument();
        });

        it("renders the provider search with the active query", () => {
            setMock({ products });
            renderListings("vase");

            expect(
                screen.getByRole("search", { name: "Angebote von Antique Store durchsuchen" }),
            ).toBeInTheDocument();
            expect(screen.getByRole("searchbox")).toHaveValue("vase");
        });

        it("passes a submitted search to onQueryChange", () => {
            setMock({ products });
            const { onQueryChange } = renderListings();

            fireEvent.change(screen.getByRole("searchbox"), { target: { value: "lamp" } });
            fireEvent.submit(screen.getByRole("search"));

            expect(onQueryChange).toHaveBeenCalledWith("lamp");
        });

        it("loads the source's listings without a query", () => {
            renderListings();
            expect(mockUseShopProducts).toHaveBeenCalledWith("ls_01TESTSOURCE", "");
        });

        it("loads the source's listings for the active query", () => {
            renderListings("vase");
            expect(mockUseShopProducts).toHaveBeenCalledWith("ls_01TESTSOURCE", "vase");
        });
    });

    describe("Loading", () => {
        it("renders four card skeletons while pending", () => {
            setMock({ isPending: true });
            renderListings();

            expect(screen.getAllByTestId("search-result-skeleton")).toHaveLength(4);
            expect(screen.getByText("Angebote werden geladen")).toBeInTheDocument();
            expect(resultLine()).toBeEmptyDOMElement();
        });

        it("announces the running search while a query is pending", () => {
            setMock({ isPending: true });
            renderListings("vase");

            expect(resultLine()).toHaveTextContent("Suche nach „vase“…");
            expect(screen.getAllByTestId("search-result-skeleton")).toHaveLength(4);
        });
    });

    describe("Error", () => {
        it("renders the error panel", () => {
            vi.spyOn(console, "error").mockImplementation(() => {});
            setMock({ error: new Error("load failed") });
            renderListings();

            const alert = screen.getByRole("alert");
            expect(
                within(alert).getByRole("heading", { name: "Angebote nicht verfügbar." }),
            ).toBeInTheDocument();
            expect(
                within(alert).getByText(
                    "Die Angebote dieses Anbieters konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
                ),
            ).toBeInTheDocument();
        });

        it("retries loading", () => {
            vi.spyOn(console, "error").mockImplementation(() => {});
            const { refetch } = setMock({ error: new Error("load failed") });
            renderListings();

            fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));

            expect(refetch).toHaveBeenCalledTimes(1);
        });

        it("shows no result line for a failed search", () => {
            vi.spyOn(console, "error").mockImplementation(() => {});
            setMock({ error: new Error("load failed") });
            renderListings("vase");

            expect(resultLine()).toBeEmptyDOMElement();
        });
    });

    describe("Empty", () => {
        it("renders the empty state with a link to search all objects", () => {
            renderListings();

            expect(
                screen.getByRole("heading", { name: "Zurzeit keine Angebote." }),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Von Antique Store sind im Moment keine Angebote erfasst. Neue Angebote erscheinen hier, sobald wir sie erfassen.",
                ),
            ).toBeInTheDocument();
            expect(screen.getByRole("link", { name: "Alle Objekte durchsuchen" })).toHaveAttribute(
                "href",
                "/de/search",
            );
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });

        it("keeps loading instead of showing the empty state when an empty page has a cursor", () => {
            setMock({ products: [], hasNextPage: true });
            renderListings();

            expect(
                screen.queryByRole("heading", { name: "Zurzeit keine Angebote." }),
            ).not.toBeInTheDocument();
        });
    });

    describe("No matches", () => {
        it("renders the no-matches state for the query", () => {
            renderListings("vase");

            expect(
                screen.getByRole("heading", { name: "Hier keine Treffer." }),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Bei Antique Store passt nichts zu „vase“. Versuchen Sie einen anderen Begriff oder durchsuchen Sie alle Anbieter.",
                ),
            ).toBeInTheDocument();
            expect(
                screen.queryByRole("heading", { name: "Zurzeit keine Angebote." }),
            ).not.toBeInTheDocument();
        });

        it("links to the full search with the query", () => {
            renderListings("vase");

            expect(screen.getByRole("link", { name: "Alle Anbieter durchsuchen" })).toHaveAttribute(
                "href",
                "/de/search?q=vase",
            );
        });

        it("restores the full list", () => {
            const { onQueryChange } = renderListings("vase");

            fireEvent.click(screen.getByRole("button", { name: "Alle Angebote anzeigen" }));

            expect(onQueryChange).toHaveBeenCalledWith("");
        });
    });

    describe("Results", () => {
        it("renders a card for every listing", () => {
            setMock({ products });
            renderListings();

            expect(screen.getAllByTestId("search-result-card")).toHaveLength(2);
            expect(screen.getByText("Ancient Vase")).toBeInTheDocument();
            expect(screen.getByText("Roman Coin")).toBeInTheDocument();
        });

        it("flattens listings from several pages", () => {
            mockUseShopProducts.mockReturnValue({
                data: {
                    pages: [
                        { products: [products[0]], total: 2, searchAfter: undefined },
                        { products: [products[1]], total: 2, searchAfter: undefined },
                    ],
                    pageParams: [undefined, undefined],
                },
                isPending: false,
                error: null,
                refetch: vi.fn(),
                fetchNextPage: vi.fn(),
                hasNextPage: false,
                isFetchingNextPage: false,
            } as unknown as ReturnType<typeof useShopProducts>);
            renderListings();

            expect(screen.getAllByTestId("search-result-card")).toHaveLength(2);
        });

        it("shows no result line without a query", () => {
            setMock({ products });
            renderListings();

            expect(resultLine()).toBeEmptyDOMElement();
            expect(
                screen.queryByRole("button", { name: "Alle Angebote anzeigen" }),
            ).not.toBeInTheDocument();
        });

        it("counts the matches for the query", () => {
            setMock({ products, total: 12 });
            renderListings("vase");

            expect(resultLine()).toHaveTextContent("12 Ergebnisse für „vase“");
        });

        it("uses the singular for one match", () => {
            setMock({ products: [products[0]], total: 1 });
            renderListings("vase");

            expect(resultLine()).toHaveTextContent("1 Ergebnis für „vase“");
        });

        it("falls back to an uncounted result line without a total", () => {
            setMock({ products, total: undefined });
            renderListings("vase");

            expect(resultLine()).toHaveTextContent("Ergebnisse für „vase“");
            expect(resultLine()).not.toHaveTextContent(/\d/);
        });

        it("restores the full list from the result line", () => {
            setMock({ products });
            const { onQueryChange } = renderListings("vase");

            fireEvent.click(screen.getByRole("button", { name: "Alle Angebote anzeigen" }));

            expect(onQueryChange).toHaveBeenCalledWith("");
        });
    });

    describe("Pagination", () => {
        it("shows the loading-more row while the next page loads", () => {
            setMock({ products, hasNextPage: true, isFetchingNextPage: true });
            renderListings();

            expect(screen.getByText("Weitere Angebote werden geladen…")).toBeInTheDocument();
        });

        it("tells the reader every listing of the provider is shown", () => {
            setMock({ products });
            renderListings();

            expect(
                screen.getByText("Sie haben alle Angebote von Antique Store gesehen."),
            ).toBeInTheDocument();
        });

        it("tells the reader every match for the query is shown", () => {
            setMock({ products });
            renderListings("vase");

            expect(
                screen.getByText("Sie haben alle Ergebnisse für „vase“ gesehen."),
            ).toBeInTheDocument();
        });

        it("shows no loader row while more pages wait", () => {
            setMock({ products, hasNextPage: true });
            renderListings();

            expect(screen.queryByText("Weitere Angebote werden geladen…")).not.toBeInTheDocument();
            expect(
                screen.queryByText("Sie haben alle Angebote von Antique Store gesehen."),
            ).not.toBeInTheDocument();
        });

        it("loads the next page when the sentinel scrolls into view", () => {
            intersection.inView = true;
            const { fetchNextPage } = setMock({ products, hasNextPage: true });
            renderListings();

            expect(fetchNextPage).toHaveBeenCalledTimes(1);
        });

        it("does not load another page while one is loading", () => {
            intersection.inView = true;
            const { fetchNextPage } = setMock({
                products,
                hasNextPage: true,
                isFetchingNextPage: true,
            });
            renderListings();

            expect(fetchNextPage).not.toHaveBeenCalled();
        });

        it("does not load past the last page", () => {
            intersection.inView = true;
            const { fetchNextPage } = setMock({ products });
            renderListings();

            expect(fetchNextPage).not.toHaveBeenCalled();
        });
    });
});
