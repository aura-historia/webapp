import type { OverviewProduct } from "@/data/internal/OverviewProduct.ts";
import { screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import type { SearchResultData } from "@/data/internal/SearchResultData.ts";
import { useSearch } from "@/hooks/search/useSearch.ts";
import { SearchResults } from "@/components/search/SearchResults.tsx";
import type React from "react";
import { renderWithQueryClient } from "@/test/utils.tsx";

vi.mock("@/hooks/useSearch.ts", () => ({
    useSearch: vi.fn(),
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

const mockUseSearch = vi.mocked(useSearch);

const buildQueryPayload = (products: OverviewProduct[]): SearchResultData => ({
    products,
    size: products.length,
    total: products.length,
    searchAfter: undefined,
});

type SearchMockOptions = {
    products?: OverviewProduct[];
    isPending?: boolean;
    error?: Error | null;
};

function setSearchMock({ products = [], isPending = false, error = null }: SearchMockOptions = {}) {
    const pages = isPending ? undefined : [buildQueryPayload(products)];
    mockUseSearch.mockReturnValue({
        data: pages ? { pages, pageParams: [undefined] } : undefined,
        isPending,
        error,
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
    } as unknown as ReturnType<typeof useSearch>);
}

describe("SearchResults", () => {
    beforeEach(() => {
        mockUseSearch.mockReset();
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
        expect(
            screen.getByText(
                "Fehler beim Laden der Suchergebnisse. Bitte versuchen Sie es später erneut!",
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

    it("renders a list of product cards when products are found", () => {
        const base: Omit<OverviewProduct, "productId" | "title"> = {
            eventId: "e1",
            shopId: "s1",
            shopsProductId: "si1",
            shopName: "Shop 1",
            description: undefined,
            price: "10 €",
            state: "AVAILABLE",
            url: null,
            images: [],
            created: new Date(),
            updated: new Date(),
            originYear: undefined,
            originYearMin: undefined,
            originYearMax: undefined,
            authenticity: "UNKNOWN",
            condition: "UNKNOWN",
            provenance: "UNKNOWN",
            restoration: "UNKNOWN",
        } as const;

        setSearchMock({
            products: [
                { ...base, productId: "1", title: "Product 1" },
                { ...base, productId: "2", title: "Product 2" },
            ],
        });
        renderWithQueryClient(<SearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();
    });
});
