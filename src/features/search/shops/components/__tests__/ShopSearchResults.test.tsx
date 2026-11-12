import { fireEvent, screen } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { useShopSearch } from "@/features/search/shops/api/useShopSearch.ts";
import { ShopSearchResults } from "@/features/search/shops/components/ShopSearchResults.tsx";
import { makePublicListingSource } from "@/test/fixtures.ts";
import { renderWithQueryClient } from "@/test/utils.tsx";

vi.mock("@/features/search/shops/api/useShopSearch.ts", () => ({
    useShopSearch: vi.fn(),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({
            children,
            to,
            search,
            params: _params,
            from: _from,
            ...props
        }: {
            children: React.ReactNode;
            to?: string;
            search?: { q?: string };
            params?: unknown;
            from?: string;
        }) => (
            <a href={`${to}?q=${search?.q ?? ""}`} {...props}>
                {children}
            </a>
        ),
    };
});

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));

const mockUseShopSearch = vi.mocked(useShopSearch);

type ShopSearchMockOptions = {
    sources?: PublicListingSource[];
    isPending?: boolean;
    error?: Error | null;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage?: () => void;
    refetch?: () => void;
};

function setShopSearchMock({
    sources = [],
    isPending = false,
    error = null,
    hasNextPage = false,
    isFetchingNextPage = false,
    fetchNextPage = vi.fn(),
    refetch = vi.fn(),
}: ShopSearchMockOptions = {}) {
    const pages = isPending ? undefined : [{ sources, size: sources.length }];
    mockUseShopSearch.mockReturnValue({
        data: pages ? { pages, pageParams: [undefined] } : undefined,
        isPending,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } as unknown as ReturnType<typeof useShopSearch>);
}

const TWO_SHOPS = [
    makePublicListingSource({
        listingSourceId: "ls_1",
        name: "Galerie Lenôtre",
        slugId: "lenotre",
    }),
    makePublicListingSource({
        listingSourceId: "ls_2",
        name: "Brocante du Midi",
        slugId: "midi",
        url: undefined,
        viewUrl: undefined,
    }),
];

describe("ShopSearchResults", () => {
    beforeEach(() => {
        mockUseShopSearch.mockReset();
        setShopSearchMock();
    });

    it("shows six card skeletons and a status label while loading", () => {
        setShopSearchMock({ isPending: true });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "galerie" }} />);
        expect(screen.getAllByTestId("shop-result-skeleton")).toHaveLength(6);
        expect(screen.getByText("Anbieter werden geladen")).toBeInTheDocument();
    });

    it("shows the error panel with a retry that refetches", () => {
        const refetch = vi.fn();
        setShopSearchMock({ error: new Error("boom"), refetch });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "galerie" }} />);
        expect(screen.getByRole("alert")).toHaveTextContent("Fehler beim Laden");
        fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
        expect(refetch).toHaveBeenCalled();
    });

    it("offers object search and all providers when nothing matches the query", () => {
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "commode" }} />);
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
            "Keine Anbieter gefunden.",
        );
        expect(screen.getByText(/Kein Anbietername enthält „commode“/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Objekte zu „commode“ suchen" })).toHaveAttribute(
            "href",
            "/$lng/search?q=commode",
        );
        expect(screen.getByRole("link", { name: "Alle Anbieter anzeigen" })).toHaveAttribute(
            "href",
            "/$lng/search/shops?q=",
        );
    });

    it("shows no actions in the empty state without a query", () => {
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "" }} />);
        expect(screen.getByText("Derzeit gibt es keine Anbieter anzuzeigen.")).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("renders one card per provider and the website link only when a viewUrl exists", () => {
        setShopSearchMock({ sources: TWO_SHOPS });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "" }} />);
        const cards = screen.getAllByTestId("shop-result-card");
        expect(cards).toHaveLength(2);
        expect(cards[0]).toHaveTextContent("Galerie Lenôtre");
        expect(
            cards[0].querySelector(
                'a[href="https://example.com/?utm_source=aura_historia&utm_medium=referral"]',
            ),
        ).not.toBeNull();
        expect(cards[1].querySelector('a[target="_blank"]')).toBeNull();
        expect(cards[1]).toHaveTextContent("B");
    });

    it("ends with the all-providers line for a browse and names the query for a search", () => {
        setShopSearchMock({ sources: TWO_SHOPS });
        const { unmount } = renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "" }} />);
        expect(screen.getByRole("status")).toHaveTextContent("Sie haben alle Anbieter gesehen.");
        unmount();

        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "galerie" }} />);
        expect(screen.getByRole("status")).toHaveTextContent(
            "Sie haben alle Anbieter zu „galerie“ gesehen.",
        );
    });

    it("shows loading more while the next page loads", () => {
        setShopSearchMock({ sources: TWO_SHOPS, hasNextPage: true, isFetchingNextPage: true });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "" }} />);
        expect(screen.getByRole("status")).toHaveTextContent("Weitere Anbieter werden geladen…");
    });

    it("keeps loaded providers and offers a retry when the next page fails", () => {
        const fetchNextPage = vi.fn();
        setShopSearchMock({
            sources: TWO_SHOPS,
            hasNextPage: true,
            error: new Error("boom"),
            fetchNextPage,
        });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "" }} />);
        expect(screen.getAllByTestId("shop-result-card")).toHaveLength(2);
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Weitere Anbieter konnten nicht geladen werden.",
        );
        fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
        expect(fetchNextPage).toHaveBeenCalled();
    });
});
