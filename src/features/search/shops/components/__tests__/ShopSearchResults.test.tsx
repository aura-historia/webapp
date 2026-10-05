import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";
import { makePublicListingSource } from "@/test/fixtures.ts";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useShopSearch } from "@/features/search/shops/api/useShopSearch.ts";
import { ShopSearchResults } from "@/features/search/shops/components/ShopSearchResults.tsx";
import type React from "react";
import { renderWithQueryClient } from "@/test/utils.tsx";

vi.mock("@/features/search/shops/api/useShopSearch.ts", () => ({
    useShopSearch: vi.fn(),
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

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));

vi.mock("lottie-react", () => ({
    Lottie: () => <div data-testid="lottie-animation" />,
}));

const mockUseShopSearch = vi.mocked(useShopSearch);

const buildShop = makePublicListingSource;

type ShopSearchMockOptions = {
    sources?: PublicListingSource[];
    isPending?: boolean;
    error?: Error | null;
};

function setShopSearchMock({
    sources = [],
    isPending = false,
    error = null,
}: ShopSearchMockOptions = {}) {
    const pages = isPending
        ? undefined
        : [{ sources, size: sources.length, searchAfter: undefined }];
    mockUseShopSearch.mockReturnValue({
        data: pages ? { pages, pageParams: [undefined] } : undefined,
        isPending,
        error,
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
    } as unknown as ReturnType<typeof useShopSearch>);
}

describe("ShopSearchResults", () => {
    beforeEach(() => {
        mockUseShopSearch.mockReset();
        setShopSearchMock();
    });

    it("renders skeletons while loading", () => {
        setShopSearchMock({ isPending: true });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getAllByTestId("shop-card-skeleton")).toHaveLength(4);
    });

    it("renders an error message when the search fails", () => {
        setShopSearchMock({ error: new Error("boom") });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getByText("Fehler beim Laden")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Die Suchergebnisse konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
            ),
        ).toBeInTheDocument();
    });

    it("renders a no-results message when there are no sources", () => {
        setShopSearchMock({ sources: [] });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getByText("Keine Ergebnisse gefunden")).toBeInTheDocument();
    });

    it("renders one ShopCard per shop returned by the search", () => {
        setShopSearchMock({
            sources: [
                buildShop({ listingSourceId: "shop-1", name: "Shop One" }),
                buildShop({ listingSourceId: "shop-2", name: "Shop Two", slugId: "two" }),
            ],
        });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getByText("Shop One")).toBeInTheDocument();
        expect(screen.getByText("Shop Two")).toBeInTheDocument();
        expect(screen.getAllByTestId("shop-card")).toHaveLength(2);
    });
});
