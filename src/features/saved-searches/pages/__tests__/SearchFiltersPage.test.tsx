import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { SearchFiltersPage } from "../SearchFiltersPage.tsx";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import type { UserSearchFilterCollection } from "@/data/internal/search-filter/UserSearchFilterCollection.ts";
import type React from "react";

const mockUseUserSearchFilters = vi.hoisted(() => vi.fn());
const mockUseUserAccount = vi.hoisted(() => vi.fn());

vi.mock("@/features/saved-searches/api/useUserSearchFilters.ts", () => ({
    useUserSearchFilters: mockUseUserSearchFilters,
}));

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: mockUseUserAccount,
}));

vi.mock("@/features/saved-searches/components/CreateSearchFilterWizard.tsx", () => ({
    CreateSearchFilterWizard: ({
        open,
        mode,
        filter,
    }: {
        open: boolean;
        mode: string;
        filter?: UserSearchFilter;
    }) =>
        open ? (
            <div data-testid="wizard" data-mode={mode}>
                {filter?.name}
            </div>
        ) : null,
}));

type CardMockProps = {
    filter: UserSearchFilter;
    canDuplicate: boolean;
    onEdit: (filter: UserSearchFilter) => void;
    onDuplicate: (filter: UserSearchFilter) => void;
};

vi.mock("@/features/saved-searches/components/SearchFilterCard.tsx", () => ({
    SearchFilterCard: ({ filter, canDuplicate, onEdit, onDuplicate }: CardMockProps) => (
        <div data-testid="search-filter-card" data-can-duplicate={String(canDuplicate)}>
            {filter.name}
            <button type="button" onClick={() => onEdit(filter)}>
                edit {filter.name}
            </button>
            <button type="button" onClick={() => onDuplicate(filter)}>
                duplicate {filter.name}
            </button>
        </div>
    ),
    SearchFilterRestingRow: ({ filter }: CardMockProps) => (
        <div data-testid="search-filter-resting-row">{filter.name}</div>
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
    subscriptionType?: "free" | "pro" | "ultimate";
    refetch?: () => void;
};

function setMock({
    filters = [],
    total,
    isPending = false,
    error = null,
    subscriptionType = "pro",
    refetch = vi.fn(),
}: FiltersMockOptions = {}) {
    mockUseUserSearchFilters.mockReturnValue({
        data: isPending || error ? undefined : buildCollection(filters, total),
        isPending,
        error,
        refetch,
    });

    mockUseUserAccount.mockReturnValue({
        data: { subscriptionType },
        isPending: false,
    });
}

const SEARCH_PLACEHOLDER = "Suchaufträge durchsuchen…";

describe("SearchFiltersPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setMock();
    });

    describe("Header", () => {
        it("renders the heading and lead", () => {
            setMock({ filters: [buildFilter()] });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(
                screen.getByRole("heading", { level: 1, name: "Meine Suchaufträge." }),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Gespeicherte Suchen, die den Markt weiter beobachten. Wir schreiben Ihnen, sobald neue Objekte passen.",
                ),
            ).toBeInTheDocument();
        });

        it("shows the quota for finite plans", () => {
            setMock({ filters: [buildFilter()], subscriptionType: "pro" });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(screen.getByText("1 von 5 im Tarif „Pro“")).toBeInTheDocument();
        });

        it("hides the quota for unlimited plans", () => {
            setMock({ filters: [buildFilter()], subscriptionType: "ultimate" });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(screen.queryByText(/im Tarif „/)).not.toBeInTheDocument();
        });

        it("hides the name search when there are no filters", () => {
            setMock({ filters: [] });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(screen.queryByPlaceholderText(SEARCH_PLACEHOLDER)).not.toBeInTheDocument();
        });
    });

    describe("Loading state", () => {
        it("renders skeleton cards and rows while loading", () => {
            setMock({ isPending: true });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(screen.getByRole("status")).toHaveTextContent("Suchaufträge werden geladen");
            expect(screen.getAllByTestId("search-filter-card-skeleton")).toHaveLength(2);
            expect(screen.getAllByTestId("search-filter-row-skeleton")).toHaveLength(2);
        });

        it("disables the create button and hides the quota while loading", () => {
            setMock({ isPending: true });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(screen.getByRole("button", { name: "Suchauftrag anlegen" })).toBeDisabled();
            expect(screen.queryByText(/im Tarif „/)).not.toBeInTheDocument();
        });
    });

    describe("Error state", () => {
        it("renders an error panel when the hook returns an error", () => {
            setMock({ error: new Error("network error") });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(screen.getByRole("alert")).toBeInTheDocument();
            expect(
                screen.getByRole("heading", { name: "Suchaufträge nicht verfügbar." }),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Die Suchaufträge konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
                ),
            ).toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: "Suchauftrag anlegen" }),
            ).not.toBeInTheDocument();
        });

        it("retries loading the filters", () => {
            const refetch = vi.fn();
            setMock({ error: new Error("network error"), refetch });
            renderWithQueryClient(<SearchFiltersPage />);
            fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
            expect(refetch).toHaveBeenCalledTimes(1);
        });
    });

    describe("Empty state", () => {
        it("renders the empty state when there are no filters", () => {
            setMock({ filters: [], total: 0 });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(
                screen.getByRole("heading", { name: "Noch keine Suchaufträge." }),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Sie haben noch keine Suchaufträge gespeichert. Speichern Sie eine Suche, und wir schreiben Ihnen, sobald neue Objekte passen.",
                ),
            ).toBeInTheDocument();
        });

        it("offers creating a filter and searching listings", () => {
            setMock({ filters: [], total: 0 });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(screen.getAllByRole("button", { name: "Suchauftrag anlegen" })).toHaveLength(2);
            expect(screen.getByRole("link", { name: "Objekte suchen" })).toHaveAttribute(
                "href",
                "/$lng/search",
            );
        });

        it("renders the empty state when data is undefined and not loading", () => {
            mockUseUserSearchFilters.mockReturnValue({
                data: undefined,
                isPending: false,
                error: null,
                refetch: vi.fn(),
            });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(
                screen.getByRole("heading", { name: "Noch keine Suchaufträge." }),
            ).toBeInTheDocument();
        });
    });

    describe("Name search", () => {
        it("filters by name (case-insensitive)", async () => {
            setMock({
                filters: [
                    buildFilter({ id: "f1", name: "Antike Vasen" }),
                    buildFilter({ id: "f2", name: "Moderne Münzen" }),
                ],
                total: 2,
            });
            renderWithQueryClient(<SearchFiltersPage />);

            await userEvent.type(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), "antike");

            expect(screen.getByText("Antike Vasen")).toBeInTheDocument();
            expect(screen.queryByText("Moderne Münzen")).not.toBeInTheDocument();
        });

        it("explains when no name matches and clears the search", async () => {
            setMock({
                filters: [
                    buildFilter({ id: "f1", name: "Antike Vasen" }),
                    buildFilter({ id: "f2", name: "Moderne Münzen" }),
                ],
                total: 2,
            });
            renderWithQueryClient(<SearchFiltersPage />);

            await userEvent.type(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), "xyz");

            expect(
                screen.getByRole("heading", { name: "Kein Suchauftrag passt zu „xyz“." }),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Prüfen Sie die Schreibweise oder leeren Sie die Suche, um alle 2 Suchaufträge zu sehen.",
                ),
            ).toBeInTheDocument();
            expect(screen.queryAllByTestId("search-filter-card")).toHaveLength(0);

            // One clear button in the field, one in the no-match panel.
            const clearButtons = screen.getAllByRole("button", { name: "Suche leeren" });
            expect(clearButtons).toHaveLength(2);
            await userEvent.click(clearButtons[1]);

            expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toHaveValue("");
            expect(screen.getAllByTestId("search-filter-card")).toHaveLength(2);
        });
    });

    describe("Filter sections", () => {
        it("splits active filters into the watching band and the rest into resting", () => {
            setMock({
                filters: [
                    buildFilter({ id: "f1", name: "Aktiv 1" }),
                    buildFilter({ id: "f2", name: "Pausiert", state: "INACTIVE_BY_USER" }),
                    buildFilter({ id: "f3", name: "Aktiv 2" }),
                    buildFilter({
                        id: "f4",
                        name: "Gesperrt",
                        state: "INACTIVE_BY_RESTRICTED_PLAN",
                    }),
                ],
            });
            renderWithQueryClient(<SearchFiltersPage />);

            const watching = screen.getByRole("region", { name: "Im Einsatz." });
            expect(
                within(watching)
                    .getAllByTestId("search-filter-card")
                    .map((card) => card.firstChild?.textContent),
            ).toEqual(["Aktiv 1", "Aktiv 2"]);
            expect(
                within(watching).getByText("2 aktiv · mit jedem neuen Angebot abgeglichen"),
            ).toBeInTheDocument();

            const resting = screen.getByRole("region", { name: "Ruhend" });
            expect(
                within(resting)
                    .getAllByTestId("search-filter-resting-row")
                    .map((row) => row.textContent),
            ).toEqual(["Pausiert", "Gesperrt"]);
            expect(within(resting).getByText("2 suchen keine Treffer")).toBeInTheDocument();
        });

        it("explains an empty resting section when every filter is active", () => {
            setMock({ filters: [buildFilter()] });
            renderWithQueryClient(<SearchFiltersPage />);
            const resting = screen.getByRole("region", { name: "Ruhend" });
            expect(
                within(resting).getByText(
                    "Suchaufträge, die Sie pausieren oder die Ihr Tarif sperrt, warten hier, ohne nach Treffern zu suchen.",
                ),
            ).toBeInTheDocument();
            expect(
                within(resting).queryByTestId("search-filter-resting-row"),
            ).not.toBeInTheDocument();
        });

        it("omits the resting section when a name search matches no resting filter", async () => {
            setMock({ filters: [buildFilter({ name: "Antike Vasen" })] });
            renderWithQueryClient(<SearchFiltersPage />);

            await userEvent.type(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), "antike");

            expect(screen.queryByRole("region", { name: "Ruhend" })).not.toBeInTheDocument();
        });

        it("explains an empty watching band when no filter is active", () => {
            setMock({ filters: [buildFilter({ state: "INACTIVE_BY_USER" })] });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(
                screen.getByText(
                    "Gerade ist kein Suchauftrag im Einsatz. Setzen Sie unten einen fort oder legen Sie einen neuen an.",
                ),
            ).toBeInTheDocument();
            expect(screen.getByTestId("search-filter-resting-row")).toBeInTheDocument();
        });

        it("hides the watching band when the name search only matches resting filters", async () => {
            setMock({
                filters: [
                    buildFilter({ id: "f1", name: "Antike Vasen" }),
                    buildFilter({ id: "f2", name: "Moderne Münzen", state: "INACTIVE_BY_USER" }),
                ],
            });
            renderWithQueryClient(<SearchFiltersPage />);

            await userEvent.type(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), "münzen");

            expect(screen.queryByRole("region", { name: "Im Einsatz." })).not.toBeInTheDocument();
            expect(screen.getByTestId("search-filter-resting-row")).toBeInTheDocument();
        });

        it("opens the wizard in edit mode for a card", async () => {
            setMock({ filters: [buildFilter({ name: "Antike Vasen" })] });
            renderWithQueryClient(<SearchFiltersPage />);
            await userEvent.click(screen.getByRole("button", { name: "edit Antike Vasen" }));
            expect(screen.getByTestId("wizard")).toHaveAttribute("data-mode", "edit");
            expect(screen.getByTestId("wizard")).toHaveTextContent("Antike Vasen");
        });

        it("opens the wizard in duplicate mode for a card", async () => {
            setMock({ filters: [buildFilter({ name: "Antike Vasen" })] });
            renderWithQueryClient(<SearchFiltersPage />);
            await userEvent.click(screen.getByRole("button", { name: "duplicate Antike Vasen" }));
            expect(screen.getByTestId("wizard")).toHaveAttribute("data-mode", "duplicate");
        });
    });

    describe("Create button", () => {
        it("opens the wizard in create mode", async () => {
            setMock({ filters: [buildFilter()], subscriptionType: "pro" });
            renderWithQueryClient(<SearchFiltersPage />);
            const button = screen.getByRole("button", { name: "Suchauftrag anlegen" });
            expect(button).toBeEnabled();
            await userEvent.click(button);
            expect(screen.getByTestId("wizard")).toHaveAttribute("data-mode", "create");
        });

        it("disables creating and duplicating when the quota is reached", () => {
            setMock({ filters: [buildFilter()], total: 1, subscriptionType: "free" });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(screen.getByRole("button", { name: "Suchauftrag anlegen" })).toBeDisabled();
            expect(screen.getByTestId("search-filter-card")).toHaveAttribute(
                "data-can-duplicate",
                "false",
            );
        });

        it("allows duplicating below the quota", () => {
            setMock({ filters: [buildFilter()], total: 1, subscriptionType: "pro" });
            renderWithQueryClient(<SearchFiltersPage />);
            expect(screen.getByTestId("search-filter-card")).toHaveAttribute(
                "data-can-duplicate",
                "true",
            );
        });
    });
});
