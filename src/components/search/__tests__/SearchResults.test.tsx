import type { OverviewItem } from "@/data/internal/OverviewItem.ts";
import { render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import { SearchResults } from "../SearchResults";

vi.mock("@/hooks/useSimpleSearch.ts", () => ({
    useSimpleSearch: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
    Link: ({ children, ...props }: { children: React.ReactNode }) => <a {...props}>{children}</a>,
}));

import { useSimpleSearch } from "@/hooks/useSimpleSearch.ts";

const mockUseSimpleSearch = vi.mocked(useSimpleSearch);

const buildQueryPayload = (items: OverviewItem[]) => ({
    data: { items },
    error: undefined,
    request: new Request("http://localhost/mock"),
    response: new Response("{}", { status: 200 }),
});

type SearchMockOptions = {
    items?: OverviewItem[];
    isLoading?: boolean;
    error?: Error | null;
};

function setSearchMock({ items = [], isLoading = false, error = null }: SearchMockOptions = {}) {
    const data = isLoading ? undefined : buildQueryPayload(items);
    mockUseSimpleSearch.mockReturnValue({
        data,
        isLoading,
        error,
    } as ReturnType<typeof useSimpleSearch>);
}

describe("SearchResults", () => {
    beforeEach(() => {
        mockUseSimpleSearch.mockReset();
        setSearchMock();
    });

    it("renders a message when query length is less than 3 characters", () => {
        render(<SearchResults query="ab" />);
        expect(
            screen.getByText("Bitte geben Sie mindestens 3 Zeichen ein, um die Suche zu starten."),
        ).toBeInTheDocument();
    });

    it("renders skeleton loaders while data is loading", () => {
        setSearchMock({ isLoading: true });
        render(<SearchResults query="test" />);
        expect(screen.getAllByTestId("item-card-skeleton")).toHaveLength(4);
    });

    it("renders an error message when there is an error", () => {
        setSearchMock({ error: new Error("API Error") });
        render(<SearchResults query="test" />);
        expect(
            screen.getByText(
                "Fehler beim Laden der Suchergebnisse. Bitte versuchen Sie es später erneut!",
            ),
        ).toBeInTheDocument();
    });

    it("renders a message when no items are found", () => {
        setSearchMock({ items: [] });
        render(<SearchResults query="test" />);
        expect(screen.getByText("Keine Artikel gefunden!")).toBeInTheDocument();
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
        render(<SearchResults query="test" />);
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
});
