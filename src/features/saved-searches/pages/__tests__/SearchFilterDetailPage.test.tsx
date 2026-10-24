import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { SearchFilterDetailPage } from "../SearchFilterDetailPage.tsx";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import type React from "react";

const mockUseUserSearchFilter = vi.hoisted(() => vi.fn());
const mockDeleteMutate = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());
const mockUpdateMutate = vi.hoisted(() => vi.fn());

vi.mock("@/features/saved-searches/api/useUserSearchFilter.ts", () => ({
    useUserSearchFilter: mockUseUserSearchFilter,
}));

vi.mock("@/features/saved-searches/api/useDeleteUserSearchFilter.ts", () => ({
    useDeleteUserSearchFilter: () => ({
        mutate: mockDeleteMutate,
        isPending: false,
    }),
}));

vi.mock("@/features/saved-searches/api/useUpdateUserSearchFilter.ts", () => ({
    useUpdateUserSearchFilter: () => ({ mutate: mockUpdateMutate, isPending: false }),
}));

vi.mock("@/features/preferences/hooks/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({ preferences: { currency: "EUR" }, updatePreferences: vi.fn() }),
}));

vi.mock("@tanstack/react-router", async () => {
    const actual = await vi.importActual("@tanstack/react-router");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Link: ({
            children,
            to,
            hash,
            ...props
        }: {
            children: React.ReactNode;
            to?: string;
            hash?: string;
        }) => (
            <a href={hash ? `${to}#${hash}` : to} {...props}>
                {children}
            </a>
        ),
    };
});

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/features/saved-searches/components/CreateSearchFilterWizard.tsx", () => ({
    CreateSearchFilterWizard: ({ open }: { open: boolean }) =>
        open ? <div data-testid="edit-wizard" /> : null,
}));

vi.mock("@/features/saved-searches/components/match/SearchFilterMatches.tsx", () => ({
    SearchFilterMatches: ({ filterId, onEdit }: { filterId: string; onEdit?: () => void }) => (
        <div data-testid="section-matches" data-has-edit={String(onEdit != null)}>
            {filterId}
            {onEdit && (
                <button type="button" onClick={onEdit}>
                    edit from matches
                </button>
            )}
        </div>
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
    refetch?: () => void;
};

function setFilterMock({
    filter = buildFilter(),
    isPending = false,
    error = null,
    refetch = vi.fn(),
}: FilterMockOptions = {}) {
    mockUseUserSearchFilter.mockReturnValue({
        data: filter ?? undefined,
        isPending,
        error,
        refetch,
    });
}

describe("SearchFilterDetailPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setFilterMock();
    });

    describe("Loading state", () => {
        it("renders the header skeleton while the filter is loading", () => {
            setFilterMock({ filter: null, isPending: true });
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            expect(screen.getByTestId("search-filter-detail-skeleton")).toBeInTheDocument();
            expect(screen.queryByTestId("section-configuration")).not.toBeInTheDocument();
        });

        it("does not render the header skeleton once the filter has loaded", () => {
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            expect(screen.queryByTestId("search-filter-detail-skeleton")).not.toBeInTheDocument();
        });
    });

    describe("Error state", () => {
        it("renders error EmptyState when the filter fails to load, and no matches section", () => {
            setFilterMock({ error: new Error("not found") });
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            expect(screen.getByRole("alert")).toBeInTheDocument();
            expect(
                screen.getByRole("heading", { name: "Suchaufträge nicht verfügbar." }),
            ).toBeInTheDocument();
            expect(screen.queryByTestId("section-matches")).not.toBeInTheDocument();
            expect(screen.getByRole("link", { name: "Meine Suchaufträge" })).toHaveAttribute(
                "href",
                "/$lng/me/search-filters",
            );
        });

        it("retries loading the filter", () => {
            const refetch = vi.fn();
            setFilterMock({ error: new Error("not found"), refetch });
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
            expect(refetch).toHaveBeenCalledTimes(1);
        });
    });

    describe("Loaded state", () => {
        it("renders the matches section with an edit shortcut", () => {
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            expect(screen.getByTestId("section-matches")).toHaveTextContent("filter-1");
            expect(screen.getByTestId("section-matches")).toHaveAttribute("data-has-edit", "true");
        });

        it("renders the back link, eyebrow, state and name in the header", () => {
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            const header = screen.getByTestId("section-configuration");
            expect(screen.getByRole("link", { name: "Meine Suchaufträge" })).toHaveAttribute(
                "href",
                "/$lng/me/search-filters",
            );
            expect(header).toHaveTextContent("Suchauftrag");
            expect(header).toHaveTextContent("Aktiv");
            expect(
                screen.getByRole("heading", { level: 1, name: "Antike Vasen" }),
            ).toBeInTheDocument();
            expect(header).toHaveTextContent(/Angelegt .+ · Aktualisiert .+/);
        });

        it("renders the criteria band with the configuration grid", () => {
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            const band = screen.getByRole("region", { name: "Ihre Suchkriterien" });
            expect(band).toHaveTextContent("“vase”");
            expect(band).toHaveTextContent("Verfügbarkeit");
        });

        it("toggles email alerts", () => {
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            const toggle = screen.getByRole("button", { name: "E-Mail-Hinweise an" });
            expect(toggle).toHaveAttribute("aria-pressed", "true");
            fireEvent.click(toggle);
            expect(mockUpdateMutate).toHaveBeenCalledWith({
                id: "filter-1",
                patch: { notifications: false },
            });
        });

        it("pauses an active filter", () => {
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            fireEvent.click(screen.getByRole("button", { name: "Pausieren" }));
            expect(mockUpdateMutate).toHaveBeenCalledWith({
                id: "filter-1",
                patch: { state: "INACTIVE_BY_USER" },
            });
        });

        it("resumes a paused filter and disables its email-alert toggle", () => {
            setFilterMock({ filter: buildFilter({ state: "INACTIVE_BY_USER" }) });
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            expect(screen.getByTestId("section-configuration")).toHaveTextContent(
                "Von Ihnen pausiert",
            );
            expect(screen.getByRole("button", { name: /E-Mail-Hinweise/ })).toBeDisabled();
            fireEvent.click(screen.getByRole("button", { name: "Fortsetzen" }));
            expect(mockUpdateMutate).toHaveBeenCalledWith({
                id: "filter-1",
                patch: { state: "ACTIVE" },
            });
        });

        it("offers an upgrade instead of resuming a plan-locked filter", () => {
            setFilterMock({ filter: buildFilter({ state: "INACTIVE_BY_RESTRICTED_PLAN" }) });
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            expect(screen.getByTestId("section-configuration")).toHaveTextContent(
                "Durch Tarif gesperrt",
            );
            expect(screen.getByRole("link", { name: "Upgraden zum Fortsetzen" })).toHaveAttribute(
                "href",
                "/$lng#pricing",
            );
            expect(screen.queryByRole("button", { name: "Fortsetzen" })).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Pausieren" })).not.toBeInTheDocument();
        });

        it("does not render the configuration header when the filter has not loaded yet", () => {
            setFilterMock({ filter: null });
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            expect(screen.queryByTestId("section-configuration")).not.toBeInTheDocument();
            expect(screen.getByTestId("section-matches")).toHaveAttribute("data-has-edit", "false");
        });

        it("opens the edit wizard from the empty matches state", async () => {
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            await userEvent.click(screen.getByRole("button", { name: "edit from matches" }));
            expect(screen.getByTestId("edit-wizard")).toBeInTheDocument();
        });

        it("opens the edit wizard when the edit button is clicked", async () => {
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);
            expect(screen.queryByTestId("edit-wizard")).not.toBeInTheDocument();

            await userEvent.click(screen.getByRole("button", { name: "Suchauftrag bearbeiten" }));

            expect(screen.getByTestId("edit-wizard")).toBeInTheDocument();
        });

        it("opens the delete confirmation dialog when the delete button is clicked", async () => {
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);

            await userEvent.click(screen.getByRole("button", { name: "Suchauftrag löschen" }));

            expect(
                screen.getByRole("heading", { name: 'Suchauftrag "Antike Vasen" löschen?' }),
            ).toBeInTheDocument();
        });

        it("deletes the filter and navigates back to the list when confirmed", async () => {
            mockDeleteMutate.mockImplementation((_id, { onSuccess }) => onSuccess());
            renderWithQueryClient(<SearchFilterDetailPage filterId="filter-1" />);

            await userEvent.click(screen.getByRole("button", { name: "Suchauftrag löschen" }));
            await userEvent.click(screen.getByRole("button", { name: "Endgültig löschen" }));

            expect(mockDeleteMutate).toHaveBeenCalledWith("filter-1", expect.anything());
            expect(mockNavigate).toHaveBeenCalledWith({ to: "/$lng/me/search-filters" });
        });
    });
});
