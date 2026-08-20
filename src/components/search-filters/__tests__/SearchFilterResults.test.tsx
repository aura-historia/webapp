import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { SearchFilterResults } from "../SearchFilterResults.tsx";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import type { UserSearchFilterCollection } from "@/data/internal/search-filter/UserSearchFilterCollection.ts";
import type React from "react";

const mockUseUserSearchFilters = vi.hoisted(() => vi.fn());
const mockUseDeleteUserSearchFilter = vi.hoisted(() => vi.fn());
const mockUseUserAccount = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/search-filters/useUserSearchFilters.ts", () => ({
    useUserSearchFilters: mockUseUserSearchFilters,
}));

vi.mock("@/hooks/search-filters/useDeleteUserSearchFilter.ts", () => ({
    useDeleteUserSearchFilter: mockUseDeleteUserSearchFilter,
}));

vi.mock("@/features/account-management/index.ts", () => ({
    useUserAccount: mockUseUserAccount,
}));

vi.mock("@/components/search-filters/CreateSearchFilterWizard.tsx", () => ({
    CreateSearchFilterWizard: () => null,
}));

vi.mock("@/components/search-filters/SearchFilterCard.tsx", () => ({
    SearchFilterCard: ({ filter }: { filter: UserSearchFilter }) => (
        <div data-testid="search-filter-card">{filter.name}</div>
    ),
}));

vi.mock("@/components/search-filters/SearchFilterCardSkeleton.tsx", () => ({
    SearchFilterCardSkeleton: () => <div data-testid="search-filter-card-skeleton" />,
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

const buildFilter = (overrides: Partial<UserSearchFilter> = {}): UserSearchFilter => ({
    id: "filter-1",
    userId: "user-1",
    name: "Mein Filter",
    notifications: true,
    state: "ACTIVE",
    search: { q: "vase" },
    created: new Date("2024-01-01"),
    updated: new Date("2024-01-01"),
    ...overrides,
});

const buildCollection = (
    items: UserSearchFilter[],
    total?: number,
): UserSearchFilterCollection => ({
    items,
    from: 0,
    size: items.length,
    total: total ?? items.length,
});

type FiltersMockOptions = {
    filters?: UserSearchFilter[];
    total?: number;
    isPending?: boolean;
    error?: Error | null;
    canCreate?: boolean;
};

function setMock({
    filters = [],
    total,
    isPending = false,
    error = null,
    canCreate = true,
}: FiltersMockOptions = {}) {
    mockUseUserSearchFilters.mockReturnValue({
        data: isPending || error ? undefined : buildCollection(filters, total),
        isPending,
        error,
    });

    mockUseDeleteUserSearchFilter.mockReturnValue({ mutate: vi.fn(), isPending: false });

    mockUseUserAccount.mockReturnValue({
        data: { subscriptionType: canCreate ? "pro" : "free" },
        isPending: false,
    });
}

describe("SearchFilterResults", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setMock();
    });

    describe("Loading state", () => {
        it("renders skeleton cards while loading", () => {
            setMock({ isPending: true });
            renderWithQueryClient(<SearchFilterResults />);
            expect(screen.getAllByTestId("search-filter-card-skeleton")).toHaveLength(4);
        });
    });

    describe("Error state", () => {
        it("renders error EmptyState when the hook returns an error", () => {
            setMock({ error: new Error("network error") });
            renderWithQueryClient(<SearchFilterResults />);
            expect(screen.getByText("Fehler beim Laden")).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Die Suchaufträge konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
                ),
            ).toBeInTheDocument();
        });
    });

    describe("Null data", () => {
        it("renders nothing when data is undefined and not loading", () => {
            mockUseUserSearchFilters.mockReturnValue({
                data: undefined,
                isPending: false,
                error: null,
            });
            mockUseDeleteUserSearchFilter.mockReturnValue({ mutate: vi.fn(), isPending: false });
            mockUseUserAccount.mockReturnValue({
                data: { subscriptionType: "free" },
                isPending: false,
            });

            const { container } = renderWithQueryClient(<SearchFilterResults />);
            expect(container.firstChild).toBeNull();
        });
    });

    describe("Empty state", () => {
        it("renders empty state when there are no filters", () => {
            setMock({ filters: [], total: 0 });
            renderWithQueryClient(<SearchFilterResults />);
            expect(screen.getByText("Keine Suchaufträge")).toBeInTheDocument();
            expect(
                screen.getByText("Speichern Sie eine Suche, um sie hier zu finden."),
            ).toBeInTheDocument();
        });

        it("renders empty state when search query matches nothing", async () => {
            setMock({
                filters: [buildFilter({ name: "Antike Vasen" })],
                total: 1,
            });
            renderWithQueryClient(<SearchFilterResults />);

            await userEvent.type(
                screen.getByPlaceholderText("Suchaufträge durchsuchen …"),
                "xyz-nomatch",
            );

            expect(screen.getByText("Keine Suchaufträge")).toBeInTheDocument();
        });
    });

    describe("Filter list", () => {
        it("renders one card per filter", () => {
            setMock({
                filters: [
                    buildFilter({ id: "f1", name: "Filter 1" }),
                    buildFilter({ id: "f2", name: "Filter 2" }),
                ],
                total: 2,
            });
            renderWithQueryClient(<SearchFilterResults />);
            expect(screen.getAllByTestId("search-filter-card")).toHaveLength(2);
            expect(screen.getByText("Filter 1")).toBeInTheDocument();
            expect(screen.getByText("Filter 2")).toBeInTheDocument();
        });

        it("renders the title and total count", () => {
            setMock({ filters: [buildFilter()], total: 1 });
            renderWithQueryClient(<SearchFilterResults />);
            expect(screen.getByText("Meine Suchaufträge")).toBeInTheDocument();
            expect(screen.getByText("1 Suchauftrag")).toBeInTheDocument();
        });

        it("filters cards by search query (case-insensitive)", async () => {
            setMock({
                filters: [
                    buildFilter({ id: "f1", name: "Antike Vasen" }),
                    buildFilter({ id: "f2", name: "Moderne Münzen" }),
                ],
                total: 2,
            });
            renderWithQueryClient(<SearchFilterResults />);

            await userEvent.type(
                screen.getByPlaceholderText("Suchaufträge durchsuchen …"),
                "antike",
            );

            expect(screen.getByText("Antike Vasen")).toBeInTheDocument();
            expect(screen.queryByText("Moderne Münzen")).not.toBeInTheDocument();
        });
    });

    describe("Create button", () => {
        it("renders the create button", () => {
            setMock({ filters: [], total: 0, canCreate: true });
            renderWithQueryClient(<SearchFilterResults />);
            expect(screen.getByRole("button", { name: /Neuer Suchauftrag/i })).toBeInTheDocument();
        });

        it("disables the create button when the quota is reached", () => {
            mockUseUserSearchFilters.mockReturnValue({
                data: buildCollection([buildFilter()], 1),
                isPending: false,
                error: null,
            });
            mockUseDeleteUserSearchFilter.mockReturnValue({ mutate: vi.fn(), isPending: false });
            mockUseUserAccount.mockReturnValue({
                data: { subscriptionType: "free" },
                isPending: false,
            });

            renderWithQueryClient(<SearchFilterResults />);
            expect(screen.getByRole("button", { name: /Neuer Suchauftrag/i })).toBeDisabled();
        });
    });
});
