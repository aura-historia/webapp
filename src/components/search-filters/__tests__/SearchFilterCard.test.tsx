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
});
