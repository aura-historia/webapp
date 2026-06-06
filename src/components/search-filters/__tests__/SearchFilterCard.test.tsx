import { screen, act, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchFilterCard } from "../SearchFilterCard.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";

const mockUpdateMutate = vi.fn();

vi.mock("@/hooks/search-filters/useUpdateUserSearchFilter.ts", () => ({
    useUpdateUserSearchFilter: vi.fn(() => ({
        mutate: mockUpdateMutate,
        isPending: false,
    })),
}));

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
    isDeleting: false,
    canDuplicate: true,
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onDuplicate: vi.fn(),
};

describe("SearchFilterCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the filter name", async () => {
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} />);
        });
        expect(screen.getByText("Barock Möbel")).toBeInTheDocument();
    });

    it("renders the search query", async () => {
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} />);
        });
        expect(screen.getByText(/Tisch/)).toBeInTheDocument();
    });

    it("renders edit button", async () => {
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} />);
        });
        expect(screen.getByRole("button", { name: /Suchauftrag bearbeiten/i })).toBeInTheDocument();
    });

    it("renders delete button", async () => {
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} />);
        });
        expect(screen.getByRole("button", { name: /Suchauftrag l.schen/i })).toBeInTheDocument();
    });

    it("renders duplicate button", async () => {
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} />);
        });
        expect(
            screen.getByRole("button", { name: /Suchauftrag duplizieren/i }),
        ).toBeInTheDocument();
    });

    it("duplicate button is enabled when canDuplicate is true", async () => {
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} canDuplicate={true} />);
        });
        expect(screen.getByRole("button", { name: /Suchauftrag duplizieren/i })).not.toBeDisabled();
    });

    it("duplicate button is disabled when canDuplicate is false", async () => {
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} canDuplicate={false} />);
        });
        expect(screen.getByRole("button", { name: /Suchauftrag duplizieren/i })).toBeDisabled();
    });

    it("calls onEdit when edit button is clicked", async () => {
        const onEdit = vi.fn();
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} onEdit={onEdit} />);
        });
        await act(() => {
            fireEvent.click(screen.getByRole("button", { name: /Suchauftrag bearbeiten/i }));
        });
        expect(onEdit).toHaveBeenCalledWith(mockFilter);
    });

    it("calls onDuplicate when duplicate button is clicked", async () => {
        const onDuplicate = vi.fn();
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} onDuplicate={onDuplicate} />);
        });
        await act(() => {
            fireEvent.click(screen.getByRole("button", { name: /Suchauftrag duplizieren/i }));
        });
        expect(onDuplicate).toHaveBeenCalledWith(mockFilter);
    });

    it("delete button is disabled when isDeleting is true", async () => {
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} isDeleting={true} />);
        });
        expect(screen.getByRole("button", { name: /Suchauftrag l.schen/i })).toBeDisabled();
    });

    it("renders optional enhancedSearchDescription", async () => {
        const filter = { ...mockFilter, enhancedSearchDescription: "KI-Beschreibung Text" };
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} filter={filter} />);
        });
        expect(screen.getByText("KI-Beschreibung Text")).toBeInTheDocument();
    });

    it("renders notification bell button", async () => {
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} />);
        });
        expect(
            screen.getByRole("button", { name: /Keine Benachrichtigungen/i }),
        ).toBeInTheDocument();
    });

    it("toggles notifications on bell click", async () => {
        await act(() => {
            renderWithRouter(<SearchFilterCard {...defaultProps} />);
        });
        const bellBtn = screen.getByRole("button", { name: /Keine Benachrichtigungen/i });
        await act(() => {
            fireEvent.click(bellBtn);
        });
        expect(mockUpdateMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "filter-1",
                patch: { notifications: true },
            }),
        );
    });

    describe("resource state", () => {
        it("renders pause button when filter is ACTIVE", async () => {
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} />);
            });
            expect(screen.getByRole("button", { name: /Pausieren/i })).toBeInTheDocument();
        });

        it("renders activate button when filter is INACTIVE_BY_USER", async () => {
            const filter = { ...mockFilter, state: "INACTIVE_BY_USER" as const };
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} filter={filter} />);
            });
            expect(screen.getByRole("button", { name: /Aktivieren/i })).toBeInTheDocument();
        });

        it("shows Pausiert badge when filter is INACTIVE_BY_USER", async () => {
            const filter = { ...mockFilter, state: "INACTIVE_BY_USER" as const };
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} filter={filter} />);
            });
            expect(screen.getByText("Pausiert")).toBeInTheDocument();
        });

        it("shows Gesperrt badge when filter is INACTIVE_BY_RESTRICTED_PLAN", async () => {
            const filter = { ...mockFilter, state: "INACTIVE_BY_RESTRICTED_PLAN" as const };
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} filter={filter} />);
            });
            expect(screen.getByText("Gesperrt")).toBeInTheDocument();
        });

        it("enables state toggle when INACTIVE_BY_RESTRICTED_PLAN", async () => {
            const filter = { ...mockFilter, state: "INACTIVE_BY_RESTRICTED_PLAN" as const };
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} filter={filter} />);
            });
            expect(screen.getByRole("button", { name: /Aktivieren/i })).not.toBeDisabled();
        });

        it("calls mutate with ACTIVE when activating an INACTIVE_BY_RESTRICTED_PLAN filter", async () => {
            const filter = { ...mockFilter, state: "INACTIVE_BY_RESTRICTED_PLAN" as const };
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} filter={filter} />);
            });
            await act(() => {
                fireEvent.click(screen.getByRole("button", { name: /Aktivieren/i }));
            });
            expect(mockUpdateMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "filter-1",
                    patch: { state: "ACTIVE" },
                }),
            );
        });

        it("calls mutate with INACTIVE_BY_USER when pausing an ACTIVE filter", async () => {
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} />);
            });
            const pauseBtn = screen.getByRole("button", { name: /Pausieren/i });
            await act(() => {
                fireEvent.click(pauseBtn);
            });
            expect(mockUpdateMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "filter-1",
                    patch: { state: "INACTIVE_BY_USER" },
                }),
            );
        });

        it("calls mutate with ACTIVE when activating an INACTIVE_BY_USER filter", async () => {
            const filter = { ...mockFilter, state: "INACTIVE_BY_USER" as const };
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} filter={filter} />);
            });
            const activateBtn = screen.getByRole("button", { name: /Aktivieren/i });
            await act(() => {
                fireEvent.click(activateBtn);
            });
            expect(mockUpdateMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "filter-1",
                    patch: { state: "ACTIVE" },
                }),
            );
        });

        it("shows no state badge when filter is ACTIVE", async () => {
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} />);
            });
            expect(screen.queryByText("Pausiert")).not.toBeInTheDocument();
            expect(screen.queryByText("Gesperrt")).not.toBeInTheDocument();
        });

        it("enables matching products button when filter is INACTIVE_BY_USER", async () => {
            const filter = { ...mockFilter, state: "INACTIVE_BY_USER" as const };
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} filter={filter} />);
            });
            expect(
                screen.getByRole("link", { name: /Alle Suchtreffer anzeigen/i }),
            ).toBeInTheDocument();
        });

        it("shows matching products link when filter is INACTIVE_BY_RESTRICTED_PLAN", async () => {
            const filter = { ...mockFilter, state: "INACTIVE_BY_RESTRICTED_PLAN" as const };
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} filter={filter} />);
            });
            expect(
                screen.getByRole("link", { name: /Alle Suchtreffer anzeigen/i }),
            ).toBeInTheDocument();
        });

        it("disables bell button when filter is INACTIVE_BY_USER", async () => {
            const filter = { ...mockFilter, state: "INACTIVE_BY_USER" as const };
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} filter={filter} />);
            });
            expect(
                screen.getByRole("button", { name: /Keine Benachrichtigungen/i }),
            ).toBeDisabled();
        });

        it("enables matching products button when filter is ACTIVE", async () => {
            await act(() => {
                renderWithRouter(<SearchFilterCard {...defaultProps} />);
            });
            expect(
                screen.getByRole("link", { name: /Alle Suchtreffer anzeigen/i }),
            ).toBeInTheDocument();
        });
    });
});
