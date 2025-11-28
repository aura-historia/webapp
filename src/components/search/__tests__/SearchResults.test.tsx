import type { OverviewItem } from "@/data/internal/OverviewItem.ts";
import { screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import type { SearchResultData } from "@/data/internal/SearchResultData.ts";
import { useSearch } from "@/hooks/useSearch.ts";
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

const buildQueryPayload = (items: OverviewItem[]): SearchResultData => ({
    items,
    size: items.length,
    total: items.length,
    searchAfter: undefined,
});

type SearchMockOptions = {
    items?: OverviewItem[];
    isPending?: boolean;
    error?: Error | null;
};

function setSearchMock({ items = [], isPending = false, error = null }: SearchMockOptions = {}) {
    const pages = isPending ? undefined : [buildQueryPayload(items)];
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
        expect(screen.getAllByTestId("item-card-skeleton")).toHaveLength(4);
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

    it("renders a message when no items are found", () => {
        setSearchMock({ items: [] });
        renderWithQueryClient(<SearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getByText("Keine Ergebnisse gefunden")).toBeInTheDocument();
        expect(
            screen.getByText("Versuchen Sie, Ihren Suchbegriff oder Ihre Filter anzupassen."),
        ).toBeInTheDocument();
    });

    it("renders a list of item cards when items are found", () => {
        const base: Omit<OverviewItem, "itemId" | "title"> = {
            eventId: "e1",
            shopId: "s1",
            shopsItemId: "si1",
            shopName: "Shop 1",
            description: undefined,
            price: "10 €",
            state: "AVAILABLE",
            url: null,
            images: [],
            created: new Date(),
            updated: new Date(),
        } as const;

        setSearchMock({
            items: [
                { ...base, itemId: "1", title: "Item 1" },
                { ...base, itemId: "2", title: "Item 2" },
            ],
        });
        renderWithQueryClient(<SearchResults searchFilters={{ q: "test" }} />);
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
});
