import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateSearchFilterWizard } from "../CreateSearchFilterWizard.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";

const mockCreateMutate = vi.hoisted(() => vi.fn());
const mockUpdateMutate = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("motion/react", () => ({
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
        div: ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => (
            <div className={className}>{children}</div>
        ),
    },
}));

vi.mock("@/hooks/search-filters/useCreateUserSearchFilter.ts", () => ({
    useCreateUserSearchFilter: () => ({ mutate: mockCreateMutate, isPending: false }),
}));

vi.mock("@/hooks/search-filters/useUpdateUserSearchFilter.ts", () => ({
    useUpdateUserSearchFilter: () => ({ mutate: mockUpdateMutate, isPending: false }),
}));

vi.mock("@/hooks/account/useUserAccount.ts", () => ({
    useUserAccount: () => ({ data: { subscriptionType: "ultimate" }, isPending: false }),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>();
    return { ...actual, useQuery: vi.fn(() => ({ data: undefined })) };
});

vi.mock("sonner", () => ({ toast: mockToast }));

vi.mock("@/components/search-filters/SearchFilterWizardConfirmStep.tsx", () => ({
    SearchFilterWizardConfirmStep: () => <div data-testid="confirm-step">Zusammenfassung</div>,
}));
vi.mock("@/components/search/filters/PriceSpanFilter.tsx", () => ({
    PriceSpanFilter: () => <div data-testid="price-filter" />,
}));
vi.mock("@/components/search/filters/ProductStateFilter.tsx", () => ({
    ProductStateFilter: () => <div data-testid="state-filter" />,
}));
vi.mock("@/components/search/filters/PeriodFilter.tsx", () => ({
    PeriodFilter: () => <div data-testid="period-filter" />,
}));
vi.mock("@/components/search/filters/CategoryFilter.tsx", () => ({
    CategoryFilter: () => <div data-testid="category-filter" />,
}));
vi.mock("@/components/search/filters/QualityIndicatorsFilter.tsx", () => ({
    QualityIndicatorsFilter: () => <div data-testid="quality-filter" />,
}));
vi.mock("@/components/search/filters/ShopTypeFilter.tsx", () => ({
    ShopTypeFilter: () => <div data-testid="shop-type-filter" />,
}));
vi.mock("@/components/search/filters/MerchantFilters.tsx", () => ({
    MerchantFilters: () => <div data-testid="merchant-filter" />,
}));
vi.mock("@/components/search/filters/AuctionDateSpanFilter.tsx", () => ({
    AuctionDateSpanFilter: () => <div data-testid="auction-date-filter" />,
}));
vi.mock("@/components/search/filters/CreationDateSpanFilter.tsx", () => ({
    CreationDateSpanFilter: () => <div data-testid="creation-date-filter" />,
}));
vi.mock("@/components/search/filters/UpdateDateSpanFilter.tsx", () => ({
    UpdateDateSpanFilter: () => <div data-testid="update-date-filter" />,
}));

const mockFilter: UserSearchFilter = {
    userId: "user-1",
    id: "filter-1",
    name: "Barock Möbel",
    notifications: false,
    search: { q: "Tisch" },
    created: new Date("2024-01-01"),
    updated: new Date("2024-03-01"),
};

const TOTAL_STEPS = 7;

async function navigateToConfirmStep(user: ReturnType<typeof userEvent.setup>) {
    for (let i = 1; i < TOTAL_STEPS; i++) {
        await user.click(screen.getByRole("button", { name: /^Weiter$/i }));
    }
}

describe("CreateSearchFilterWizard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("rendering", () => {
        it("renders the dialog title when open", async () => {
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );
            expect(screen.getByText("Neuen Suchauftrag anlegen")).toBeInTheDocument();
        });

        it("renders name and query input fields on step 1", async () => {
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );
            expect(
                screen.getByRole("textbox", { name: /Name des Suchauftrags/i }),
            ).toBeInTheDocument();
            expect(screen.getByRole("textbox", { name: /Suchbegriff/i })).toBeInTheDocument();
        });

        it("does not render the dialog when closed", async () => {
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open={false} onOpenChange={vi.fn()} mode="create" />,
                ),
            );
            expect(screen.queryByText("Neuen Suchauftrag anlegen")).not.toBeInTheDocument();
        });
    });

    describe("mode: create", () => {
        it("starts with empty name and query fields", async () => {
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );
            expect(screen.getByRole("textbox", { name: /Name des Suchauftrags/i })).toHaveValue("");
            expect(screen.getByRole("textbox", { name: /Suchbegriff/i })).toHaveValue("");
        });

        it("does not advance to step 2 when name and query are empty", async () => {
            const user = userEvent.setup();
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );
            await user.click(screen.getByRole("button", { name: /^Weiter$/i }));
            expect(
                screen.getByRole("textbox", { name: /Name des Suchauftrags/i }),
            ).toBeInTheDocument();
        });

        it("calls createFilter on save", async () => {
            const user = userEvent.setup();
            mockCreateMutate.mockImplementation((_data: unknown, opts: { onSuccess: () => void }) =>
                opts?.onSuccess?.(),
            );

            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );

            await user.type(
                screen.getByRole("textbox", { name: /Name des Suchauftrags/i }),
                "Neuer Filter",
            );
            await user.type(screen.getByRole("textbox", { name: /Suchbegriff/i }), "Tisch");

            await navigateToConfirmStep(user);

            await user.click(screen.getByRole("button", { name: /Speichern/i }));

            expect(mockCreateMutate).toHaveBeenCalledWith(
                expect.objectContaining({ name: "Neuer Filter" }),
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            );
            expect(mockUpdateMutate).not.toHaveBeenCalled();
        });
    });

    describe("mode: edit", () => {
        it("pre-fills name and query from the existing filter", async () => {
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard
                        open
                        onOpenChange={vi.fn()}
                        mode="edit"
                        filter={mockFilter}
                    />,
                ),
            );
            expect(screen.getByRole("textbox", { name: /Name des Suchauftrags/i })).toHaveValue(
                "Barock Möbel",
            );
            expect(screen.getByRole("textbox", { name: /Suchbegriff/i })).toHaveValue("Tisch");
        });

        it("calls updateFilter (not createFilter) on save", async () => {
            const user = userEvent.setup();
            mockUpdateMutate.mockImplementation((_data: unknown, opts: { onSuccess: () => void }) =>
                opts?.onSuccess?.(),
            );

            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard
                        open
                        onOpenChange={vi.fn()}
                        mode="edit"
                        filter={mockFilter}
                    />,
                ),
            );

            await navigateToConfirmStep(user);

            await user.click(screen.getByRole("button", { name: /Speichern/i }));

            expect(mockUpdateMutate).toHaveBeenCalledWith(
                expect.objectContaining({ id: "filter-1" }),
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            );
            expect(mockCreateMutate).not.toHaveBeenCalled();
        });
    });

    describe("mode: duplicate", () => {
        it("pre-fills name with 'Kopie von <name>' prefix", async () => {
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard
                        open
                        onOpenChange={vi.fn()}
                        mode="duplicate"
                        filter={mockFilter}
                    />,
                ),
            );
            expect(screen.getByRole("textbox", { name: /Name des Suchauftrags/i })).toHaveValue(
                "Kopie von Barock Möbel",
            );
        });

        it("pre-fills query from the original filter", async () => {
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard
                        open
                        onOpenChange={vi.fn()}
                        mode="duplicate"
                        filter={mockFilter}
                    />,
                ),
            );
            expect(screen.getByRole("textbox", { name: /Suchbegriff/i })).toHaveValue("Tisch");
        });

        it("calls createFilter (not updateFilter) on save", async () => {
            const user = userEvent.setup();
            mockCreateMutate.mockImplementation((_data: unknown, opts: { onSuccess: () => void }) =>
                opts?.onSuccess?.(),
            );

            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard
                        open
                        onOpenChange={vi.fn()}
                        mode="duplicate"
                        filter={mockFilter}
                    />,
                ),
            );

            await navigateToConfirmStep(user);

            await user.click(screen.getByRole("button", { name: /Speichern/i }));

            expect(mockCreateMutate).toHaveBeenCalledWith(
                expect.objectContaining({ name: "Kopie von Barock Möbel" }),
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            );
            expect(mockUpdateMutate).not.toHaveBeenCalled();
        });
    });

    describe("navigation", () => {
        it("renders the cancel button on step 1", async () => {
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );
            expect(screen.getByRole("button", { name: /Abbrechen/i })).toBeInTheDocument();
        });

        it("calls onOpenChange(false) when cancel is clicked", async () => {
            const user = userEvent.setup();
            const onOpenChange = vi.fn();

            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={onOpenChange} mode="create" />,
                ),
            );

            await user.click(screen.getByRole("button", { name: /Abbrechen/i }));
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it("shows back button on step 2", async () => {
            const user = userEvent.setup();

            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard
                        open
                        onOpenChange={vi.fn()}
                        mode="edit"
                        filter={mockFilter}
                    />,
                ),
            );

            await user.click(screen.getByRole("button", { name: /^Weiter$/i }));
            expect(screen.getByRole("button", { name: /Zurück/i })).toBeInTheDocument();
        });

        it("shows the confirm step content after navigating to last step", async () => {
            const user = userEvent.setup();

            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard
                        open
                        onOpenChange={vi.fn()}
                        mode="edit"
                        filter={mockFilter}
                    />,
                ),
            );

            await navigateToConfirmStep(user);

            expect(screen.getByTestId("confirm-step")).toBeInTheDocument();
        });
    });
});
