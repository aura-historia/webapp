import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { SearchFilterDetail } from "../SearchFilterDetail.tsx";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";

const mockUseUserSearchFilter = vi.hoisted(() => vi.fn());
const mockDeleteMutate = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/search-filters/useUserSearchFilter.ts", () => ({
    useUserSearchFilter: mockUseUserSearchFilter,
}));

vi.mock("@/hooks/search-filters/useDeleteUserSearchFilter.ts", () => ({
    useDeleteUserSearchFilter: () => ({
        mutate: mockDeleteMutate,
        isPending: false,
    }),
}));

vi.mock("@tanstack/react-router", async () => {
    const actual = await vi.importActual("@tanstack/react-router");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/components/search-filters/CreateSearchFilterWizard.tsx", () => ({
    CreateSearchFilterWizard: ({ open }: { open: boolean }) =>
        open ? <div data-testid="edit-wizard" /> : null,
}));

vi.mock("@/components/search-filters/match/SearchFilterMatches.tsx", () => ({
    SearchFilterMatches: ({ filterId }: { filterId: string }) => (
        <div data-testid="section-matches">{filterId}</div>
    ),
}));

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
    isPending?: boolean;
    error?: Error | null;
};

function setFilterMock({
    filter = buildFilter(),
    isPending = false,
    error = null,
}: FilterMockOptions = {}) {
    mockUseUserSearchFilter.mockReturnValue({ data: filter ?? undefined, isPending, error });
}

describe("SearchFilterDetail", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setFilterMock();
    });

    describe("Loading state", () => {
        it("renders the header skeleton while the filter is loading", () => {
            setFilterMock({ filter: null, isPending: true });
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            expect(screen.getByTestId("section-configuration-skeleton")).toBeInTheDocument();
            expect(screen.queryByTestId("section-configuration")).not.toBeInTheDocument();
        });

        it("does not render the header skeleton once the filter has loaded", () => {
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            expect(screen.queryByTestId("section-configuration-skeleton")).not.toBeInTheDocument();
        });
    });

    describe("Error state", () => {
        it("renders error EmptyState when the filter fails to load, and no matches section", () => {
            setFilterMock({ error: new Error("not found") });
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            expect(screen.getByText("Fehler beim Laden")).toBeInTheDocument();
            expect(screen.queryByTestId("section-matches")).not.toBeInTheDocument();
        });
    });

    describe("Loaded state", () => {
        it("renders the matches section", () => {
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            expect(screen.getByTestId("section-matches")).toHaveTextContent("filter-1");
        });

        it("renders the filter's name and query in the configuration header", () => {
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            const header = screen.getByTestId("section-configuration");
            expect(header).toHaveTextContent("Antike Vasen");
            expect(header).toHaveTextContent("vase");
        });

        it("does not render the configuration header when the filter has not loaded yet", () => {
            setFilterMock({ filter: null });
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            expect(screen.queryByTestId("section-configuration")).not.toBeInTheDocument();
        });

        it("opens the edit wizard when the edit button is clicked", async () => {
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);
            expect(screen.queryByTestId("edit-wizard")).not.toBeInTheDocument();

            await userEvent.click(screen.getByRole("button", { name: "Suchauftrag bearbeiten" }));

            expect(screen.getByTestId("edit-wizard")).toBeInTheDocument();
        });

        it("opens the delete confirmation dialog when the delete button is clicked", async () => {
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);

            await userEvent.click(screen.getByRole("button", { name: "Suchauftrag löschen" }));

            expect(
                screen.getByRole("heading", { name: 'Suchauftrag "Antike Vasen" löschen?' }),
            ).toBeInTheDocument();
        });

        it("deletes the filter and navigates back to the list when confirmed", async () => {
            mockDeleteMutate.mockImplementation((_id, { onSuccess }) => onSuccess());
            renderWithQueryClient(<SearchFilterDetail filterId="filter-1" />);

            await userEvent.click(screen.getByRole("button", { name: "Suchauftrag löschen" }));
            await userEvent.click(screen.getByRole("button", { name: "Endgültig löschen" }));

            expect(mockDeleteMutate).toHaveBeenCalledWith("filter-1", expect.anything());
            expect(mockNavigate).toHaveBeenCalledWith({ to: "/$lng/me/search-filters" });
        });
    });
});
