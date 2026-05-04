import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useShopSearch } from "@/hooks/search/useShopSearch.ts";
import { ShopSearchResults } from "@/components/search/ShopSearchResults.tsx";
import type React from "react";
import { renderWithQueryClient } from "@/test/utils.tsx";

vi.mock("@/hooks/search/useShopSearch.ts", () => ({
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
    default: () => <div data-testid="lottie-animation" />,
}));

const mockUseShopSearch = vi.mocked(useShopSearch);

const buildShop = (overrides: Partial<ShopDetail> = {}): ShopDetail => ({
    shopId: "shop-1",
    shopSlugId: "example-shop",
    name: "Example Shop",
    shopType: "AUCTION_HOUSE",
    partnerStatus: "PARTNERED",
    image: undefined,
    domains: ["example.com"],
    created: new Date("2024-01-15T00:00:00.000Z"),
    updated: new Date("2024-06-15T00:00:00.000Z"),
    ...overrides,
});

type ShopSearchMockOptions = {
    shops?: ShopDetail[];
    total?: number;
    isPending?: boolean;
    error?: Error | null;
};

function setShopSearchMock({
    shops = [],
    total,
    isPending = false,
    error = null,
}: ShopSearchMockOptions = {}) {
    const pages = isPending
        ? undefined
        : [{ shops, size: shops.length, total: total ?? shops.length, searchAfter: undefined }];
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

    it("renders a hint when the query is too short", () => {
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "ab" }} />);
        expect(
            screen.getByText("Bitte geben Sie mindestens 3 Zeichen ein, um die Suche zu starten."),
        ).toBeInTheDocument();
    });

    it("renders skeletons while loading", () => {
        setShopSearchMock({ isPending: true });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getAllByTestId("shop-card-skeleton")).toHaveLength(4);
    });

    it("renders an error message when the search fails", () => {
        setShopSearchMock({ error: new Error("boom") });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "test" }} />);
        expect(
            screen.getByText(
                "Fehler beim Laden der Suchergebnisse. Bitte versuchen Sie es später erneut!",
            ),
        ).toBeInTheDocument();
    });

    it("renders a no-results message when there are no shops", () => {
        setShopSearchMock({ shops: [], total: 0 });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getByText("Keine Ergebnisse gefunden")).toBeInTheDocument();
    });

    it("reports the total count through onTotalChange", () => {
        const onTotalChange = vi.fn();
        setShopSearchMock({ shops: [], total: 0 });
        renderWithQueryClient(
            <ShopSearchResults searchFilters={{ q: "test" }} onTotalChange={onTotalChange} />,
        );
        expect(onTotalChange).toHaveBeenCalledWith(0);
    });

    it("renders one ShopCard per shop returned by the search", () => {
        setShopSearchMock({
            shops: [
                buildShop({ shopId: "shop-1", name: "Shop One" }),
                buildShop({ shopId: "shop-2", name: "Shop Two", shopSlugId: "two" }),
            ],
            total: 2,
        });
        renderWithQueryClient(<ShopSearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getByText("Shop One")).toBeInTheDocument();
        expect(screen.getByText("Shop Two")).toBeInTheDocument();
        expect(screen.getAllByTestId("shop-card")).toHaveLength(2);
    });
});
