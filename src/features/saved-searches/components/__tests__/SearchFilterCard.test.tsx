import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchFilterCard, SearchFilterRestingRow } from "../SearchFilterCard.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import { useUpdateUserSearchFilter } from "@/features/saved-searches/api/useUpdateUserSearchFilter.ts";

const mockUpdateMutate = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock("@/features/saved-searches/api/useUpdateUserSearchFilter.ts", () => ({
    useUpdateUserSearchFilter: vi.fn(() => ({
        mutate: mockUpdateMutate,
        isPending: false,
    })),
}));

vi.mock("@/features/saved-searches/api/useDeleteUserSearchFilter.ts", () => ({
    useDeleteUserSearchFilter: () => ({ mutate: mockDeleteMutate, isPending: false }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>();
    return {
        ...actual,
        useQuery: vi.fn(() => ({ data: undefined })),
    };
});

const mockFilter: UserSearchFilter = {
    userId: "user-1",
    id: "filter-1",
    name: "Barock Möbel",
    notifications: false,
    state: "ACTIVE",
    search: { q: "Tisch" },
    created: new Date("2024-01-01T00:00:00Z"),
    updated: new Date("2024-03-01T00:00:00Z"),
};

const defaultProps = {
    filter: mockFilter,
    canDuplicate: true,
    onEdit: vi.fn(),
    onDuplicate: vi.fn(),
};

async function renderCard(props: Partial<typeof defaultProps> = {}) {
    await act(() => {
        renderWithRouter(<SearchFilterCard {...defaultProps} {...props} />);
    });
}

async function renderRow(props: Partial<typeof defaultProps> = {}) {
    await act(() => {
        renderWithRouter(<SearchFilterRestingRow {...defaultProps} {...props} />);
    });
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Weitere Aktionen" }));
    return screen.findByRole("menu");
}

describe("SearchFilterCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the live label and a name link to the filter's detail page", async () => {
        await renderCard();
        expect(screen.getByText("Live")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Barock Möbel" })).toHaveAttribute(
            "href",
            "/de/me/search-filter/filter-1",
        );
    });

    it("renders the quoted search terms", async () => {
        await renderCard({
            filter: { ...mockFilter, search: { q: "Tisch", queryTerms: ["Tisch", "Stuhl"] } },
        });
        expect(screen.getByText("“Tisch” · “Stuhl”")).toBeInTheDocument();
    });

    it("renders the optional AI description", async () => {
        await renderCard({
            filter: { ...mockFilter, enhancedSearchDescription: "KI-Beschreibung Text" },
        });
        expect(screen.getByText("KI")).toBeInTheDocument();
        expect(screen.getByText("KI-Beschreibung Text")).toBeInTheDocument();
    });

    it("renders the criteria line with the availability fallback", async () => {
        await renderCard();
        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("links to the matches and details", async () => {
        await renderCard();
        expect(screen.getByRole("link", { name: /Treffer & Details/ })).toHaveAttribute(
            "href",
            "/de/me/search-filter/filter-1",
        );
    });

    it("pauses the filter", async () => {
        await renderCard();
        fireEvent.click(screen.getByRole("button", { name: "Barock Möbel pausieren" }));
        expect(mockUpdateMutate).toHaveBeenCalledWith({
            id: "filter-1",
            patch: { state: "INACTIVE_BY_USER" },
        });
    });

    it("toggles email alerts", async () => {
        await renderCard();
        const toggle = screen.getByRole("button", { name: "E-Mail-Hinweise aus" });
        expect(toggle).toHaveAttribute("aria-pressed", "false");
        fireEvent.click(toggle);
        expect(mockUpdateMutate).toHaveBeenCalledWith({
            id: "filter-1",
            patch: { notifications: true },
        });
    });

    it("shows email alerts as on when notifications are enabled", async () => {
        await renderCard({ filter: { ...mockFilter, notifications: true } });
        expect(screen.getByRole("button", { name: "E-Mail-Hinweise an" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    it("disables pause and email alerts while an update is pending", async () => {
        vi.mocked(useUpdateUserSearchFilter).mockReturnValueOnce({
            mutate: mockUpdateMutate,
            isPending: true,
        } as unknown as ReturnType<typeof useUpdateUserSearchFilter>);
        await renderCard();
        expect(screen.getByRole("button", { name: "Barock Möbel pausieren" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "E-Mail-Hinweise aus" })).toBeDisabled();
    });

    describe("actions menu", () => {
        it("calls onEdit from the menu", async () => {
            const user = userEvent.setup();
            const onEdit = vi.fn();
            await renderCard({ onEdit });
            await openMenu(user);
            await user.click(screen.getByRole("menuitem", { name: "Suchauftrag bearbeiten" }));
            expect(onEdit).toHaveBeenCalledWith(mockFilter);
        });

        it("calls onDuplicate from the menu", async () => {
            const user = userEvent.setup();
            const onDuplicate = vi.fn();
            await renderCard({ onDuplicate });
            await openMenu(user);
            await user.click(screen.getByRole("menuitem", { name: "Suchauftrag duplizieren" }));
            expect(onDuplicate).toHaveBeenCalledWith(mockFilter);
        });

        it("disables duplicate with an upgrade hint when canDuplicate is false", async () => {
            const user = userEvent.setup();
            const onDuplicate = vi.fn();
            await renderCard({ canDuplicate: false, onDuplicate });
            await openMenu(user);
            const item = screen.getByRole("menuitem", { name: "Suchauftrag duplizieren" });
            expect(item).toHaveAttribute("aria-disabled", "true");
            expect(
                screen.getByText("Upgraden Sie Ihr Konto, um mehr Suchaufträge zu erstellen"),
            ).toBeInTheDocument();
            await user.click(item);
            expect(onDuplicate).not.toHaveBeenCalled();
        });

        it("opens the delete dialog and deletes the filter when confirmed", async () => {
            const user = userEvent.setup();
            await renderCard();
            await openMenu(user);
            await user.click(screen.getByRole("menuitem", { name: "Suchauftrag löschen" }));
            expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
            expect(screen.getByText('Suchauftrag "Barock Möbel" löschen?')).toBeInTheDocument();
            await user.click(screen.getByRole("button", { name: "Endgültig löschen" }));
            expect(mockDeleteMutate).toHaveBeenCalledWith("filter-1", expect.any(Object));
        });
    });
});

describe("SearchFilterRestingRow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("paused", () => {
        const paused = { ...mockFilter, state: "INACTIVE_BY_USER" as const };

        it("renders the paused state, name and note", async () => {
            await renderRow({ filter: paused });
            expect(screen.getByText("Von Ihnen pausiert")).toBeInTheDocument();
            expect(screen.getByRole("link", { name: "Barock Möbel" })).toHaveAttribute(
                "href",
                "/de/me/search-filter/filter-1",
            );
            expect(
                screen.getByText("Treffer von vor der Pause bleiben auf der Detailseite."),
            ).toBeInTheDocument();
        });

        it("resumes the filter", async () => {
            await renderRow({ filter: paused });
            fireEvent.click(screen.getByRole("button", { name: "Fortsetzen" }));
            expect(mockUpdateMutate).toHaveBeenCalledWith({
                id: "filter-1",
                patch: { state: "ACTIVE" },
            });
        });

        it("does not offer an upgrade", async () => {
            await renderRow({ filter: paused });
            expect(
                screen.queryByRole("link", { name: "Upgraden zum Fortsetzen" }),
            ).not.toBeInTheDocument();
        });
    });

    describe("locked by plan", () => {
        const locked = { ...mockFilter, state: "INACTIVE_BY_RESTRICTED_PLAN" as const };

        it("renders the locked state and note", async () => {
            await renderRow({ filter: locked });
            expect(screen.getByText("Durch Tarif gesperrt")).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Ihr Tarif umfasst diesen Suchauftrag nicht, daher sucht er keine Treffer mehr.",
                ),
            ).toBeInTheDocument();
        });

        it("links to pricing instead of resuming", async () => {
            await renderRow({ filter: locked });
            expect(screen.getByRole("link", { name: "Upgraden zum Fortsetzen" })).toHaveAttribute(
                "href",
                "/de#pricing",
            );
            expect(screen.queryByRole("button", { name: "Fortsetzen" })).not.toBeInTheDocument();
        });
    });

    it("opens the actions menu", async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn();
        await renderRow({ filter: { ...mockFilter, state: "INACTIVE_BY_USER" }, onEdit });
        await openMenu(user);
        await user.click(screen.getByRole("menuitem", { name: "Suchauftrag bearbeiten" }));
        expect(onEdit).toHaveBeenCalledWith({ ...mockFilter, state: "INACTIVE_BY_USER" });
    });
});
