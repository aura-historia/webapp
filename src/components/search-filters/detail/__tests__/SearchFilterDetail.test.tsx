import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { SearchFilterDetail } from "../SearchFilterDetail.tsx";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import type React from "react";

const mockUseUserSearchFilter = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/search-filters/useUserSearchFilter.ts", () => ({
    useUserSearchFilter: mockUseUserSearchFilter,
}));

vi.mock("@/components/search-filters/CreateSearchFilterWizard.tsx", () => ({
    CreateSearchFilterWizard: ({ open }: { open: boolean }) =>
        open ? <div data-testid="edit-wizard" /> : null,
}));

vi.mock("@/components/search-filters/match/SearchFilterMatches.tsx", () => ({
    SearchFilterMatches: ({ filterId }: { filterId: string }) => (
        <div data-testid="search-filter-matches">{filterId}</div>
    ),
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

type FilterMockOptions = {
    filter?: UserSearchFilter | null;
    error?: Error | null;
};

function setFilterMock({ filter = buildFilter(), error = null }: FilterMockOptions = {}) {
    mockUseUserSearchFilter.mockReturnValue({ data: filter ?? undefined, error });
}

describe("SearchFilterDetail", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setFilterMock();
    });

    describe("Loading state", () => {
        it("renders only the matches section while the filter is loading", () => {
            setFilterMock({ filter: null });
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            expect(screen.getByTestId("search-filter-matches")).toBeInTheDocument();
            expect(screen.queryByRole("heading")).not.toBeInTheDocument();
        });
    });

    describe("Error state", () => {
        it("renders error EmptyState when the filter fails to load", () => {
            setFilterMock({ error: new Error("not found") });
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            expect(screen.getByText("Fehler beim Laden")).toBeInTheDocument();
        });
    });

    describe("Loaded state", () => {
        it("renders the filter name and description", () => {
            setFilterMock({
                filter: buildFilter({
                    name: "Antike Vasen",
                    enhancedSearchDescription: "KI-generierte Beschreibung",
                }),
            });
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            expect(screen.getByText("Antike Vasen")).toBeInTheDocument();
            expect(screen.getByText("KI-generierte Beschreibung")).toBeInTheDocument();
        });

        it("renders a search-now link to /search with the filter's query", () => {
            setFilterMock({ filter: buildFilter({ search: { q: "vase" } }) });
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            const link = screen.getByRole("link", { name: "Jetzt suchen" });
            expect(link).toHaveAttribute("href", "/search");
        });

        it("opens the edit wizard when the edit button is clicked", async () => {
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            expect(screen.queryByTestId("edit-wizard")).not.toBeInTheDocument();

            await userEvent.click(screen.getByRole("button", { name: "Suchauftrag bearbeiten" }));

            expect(screen.getByTestId("edit-wizard")).toBeInTheDocument();
        });

        it("renders the matches section", () => {
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            expect(screen.getByTestId("search-filter-matches")).toHaveTextContent("filter-1");
        });
    });
});
