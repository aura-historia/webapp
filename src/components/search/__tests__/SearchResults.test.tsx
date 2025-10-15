import type { OverviewItem } from "@/data/internal/OverviewItem.ts";
import { render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import { SimpleSearchResults } from "../SimpleSearchResults.tsx";
import type { SearchResultData } from "@/data/internal/SearchResultData.ts";

vi.mock("@/hooks/useSimpleSearch.ts", () => ({
    useSimpleSearch: vi.fn(),
}));

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));

import { useSimpleSearch } from "@/hooks/useSimpleSearch.ts";

const mockUseSimpleSearch = vi.mocked(useSimpleSearch);

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
    mockUseSimpleSearch.mockReturnValue({
        data: pages ? { pages, pageParams: [undefined] } : undefined,
        isPending,
        error,
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
    } as unknown as ReturnType<typeof useSimpleSearch>);
}

describe("SearchResults", () => {
    beforeEach(() => {
        mockUseSimpleSearch.mockReset();
        setSearchMock();
    });

    it("renders a message when query length is less than 3 characters", () => {
        render(<SimpleSearchResults query="ab" />);
        expect(screen.getByText("search.messages.minQueryLength")).toBeInTheDocument();
    });

    it("renders skeleton loaders while data is loading", () => {
        setSearchMock({ isPending: true });
        render(<SimpleSearchResults query="test" />);
        expect(screen.getAllByTestId("item-card-skeleton")).toHaveLength(4);
    });

    it("renders an error message when there is an error", () => {
        setSearchMock({ error: new Error("API Error") });
        render(<SimpleSearchResults query="test" />);
        expect(screen.getByText("search.messages.error")).toBeInTheDocument();
    });

    it("renders a message when no items are found", () => {
        setSearchMock({ items: [] });
        render(<SimpleSearchResults query="test" />);
        expect(screen.getByText("search.messages.noResults")).toBeInTheDocument();
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
        render(<SimpleSearchResults query="test" />);
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
});
