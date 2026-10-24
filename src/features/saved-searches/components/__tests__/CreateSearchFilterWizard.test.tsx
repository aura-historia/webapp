import { act, screen, within } from "@testing-library/react";
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

vi.mock("@/features/saved-searches/api/useCreateUserSearchFilter.ts", () => ({
    useCreateUserSearchFilter: () => ({ mutate: mockCreateMutate, isPending: false }),
}));

vi.mock("@/features/saved-searches/api/useUpdateUserSearchFilter.ts", () => ({
    useUpdateUserSearchFilter: () => ({ mutate: mockUpdateMutate, isPending: false }),
}));

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: () => ({ data: { subscriptionType: "ultimate" }, isPending: false }),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>();
    return { ...actual, useQuery: vi.fn(() => ({ data: undefined })) };
});

vi.mock("sonner", () => ({ toast: mockToast }));

vi.mock("@/features/saved-searches/components/SearchFilterWizardConfirmStep.tsx", () => ({
    SearchFilterWizardConfirmStep: () => (
        <div data-testid="confirm-step">
            Zusammenfassung
            <button type="button">Preview listing action</button>
        </div>
    ),
}));
vi.mock("@/features/search/products/components/filters/PriceSpanFilter.tsx", () => ({
    PriceSpanFilter: () => <div data-testid="price-filter" />,
}));
vi.mock("@/features/search/products/components/filters/ProductStateFilter.tsx", () => ({
    ProductStateFilter: () => <div data-testid="state-filter" />,
}));
vi.mock("@/features/search/common/components/SearchFilterFormProvider.tsx", () => ({
    SearchFilterFormProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/features/search/products/components/filters/MerchantFilters.tsx", () => ({
    MerchantFilters: () => <div data-testid="merchant-filter" />,
}));
vi.mock("@/features/search/products/components/filters/DateSpanFilter.tsx", () => ({
    AuctionDateSpanFilter: () => <div data-testid="auction-date-filter" />,
    CreationDateSpanFilter: () => <div data-testid="creation-date-filter" />,
    UpdateDateSpanFilter: () => <div data-testid="update-date-filter" />,
}));

const mockFilter: UserSearchFilter = {
    userId: "user-1",
    id: "filter-1",
    name: "Barock Möbel",
    notifications: false,
    state: "ACTIVE",
    search: { q: "Tisch" },
    created: new Date("2024-01-01"),
    updated: new Date("2024-03-01"),
};

const TOTAL_STEPS = 5;

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
            expect(screen.getByRole("dialog", { name: "Suchauftrag anlegen" })).toBeInTheDocument();
        });

        it("renders edit title in edit mode", async () => {
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
            expect(
                screen.getByRole("dialog", { name: "Suchauftrag bearbeiten" }),
            ).toBeInTheDocument();
        });

        it("renders duplicate title in duplicate mode", async () => {
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
            expect(
                screen.getByRole("dialog", { name: "Suchauftrag duplizieren" }),
            ).toBeInTheDocument();
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
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });

        it("renders the step header with the step count, title and description", async () => {
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );
            expect(screen.getAllByText(/Schritt 1 von 5/).length).toBeGreaterThan(0);
            expect(
                screen.getByRole("heading", { level: 3, name: "Suchbegriff & Name" }),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Geben Sie Ihrem Suchauftrag einen Namen und die Begriffe, nach denen er suchen soll.",
                ),
            ).toBeInTheDocument();
        });

        it("renders a stepper with all five steps, marking the current one", async () => {
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );
            const stepper = screen.getByRole("list", { name: "Schritte" });
            const steps = within(stepper).getAllByRole("button");
            expect(steps).toHaveLength(5);
            expect(steps[0]).toHaveAttribute("aria-current", "step");
            expect(steps[0]).toHaveTextContent("Suchbegriff & Name");
            expect(steps[4]).toHaveTextContent("Zusammenfassung");
        });

        it("reports the progress of the current step", async () => {
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
            const progress = screen.getByRole("progressbar", { name: "Fortschritt" });
            expect(progress).toHaveAttribute("aria-valuenow", "1");
            await user.click(screen.getByRole("button", { name: /^Weiter$/i }));
            expect(progress).toHaveAttribute("aria-valuenow", "2");
        });

        it("jumps to a step from the stepper", async () => {
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
            const stepper = screen.getByRole("list", { name: "Schritte" });
            await user.click(within(stepper).getByRole("button", { name: /Zusammenfassung/ }));
            expect(screen.getByTestId("confirm-step")).toBeInTheDocument();
            expect(within(stepper).getAllByRole("button")[4]).toHaveAttribute(
                "aria-current",
                "step",
            );
        });

        it("does not jump past step 1 from the stepper while step 1 is invalid", async () => {
            const user = userEvent.setup();
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );
            const stepper = screen.getByRole("list", { name: "Schritte" });
            await user.click(within(stepper).getByRole("button", { name: /Zusammenfassung/ }));
            expect(screen.queryByTestId("confirm-step")).not.toBeInTheDocument();
        });

        it("closes from the close buttons", async () => {
            const user = userEvent.setup();
            const onOpenChange = vi.fn();
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={onOpenChange} mode="create" />,
                ),
            );
            const closeButtons = screen.getAllByRole("button", { name: "Schließen" });
            expect(closeButtons).toHaveLength(2);
            await user.click(closeButtons[0]);
            expect(onOpenChange).toHaveBeenCalledWith(false);
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

        it("pressing Enter in the query field adds a tag instead of advancing the step", async () => {
            const user = userEvent.setup();
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );

            await user.type(screen.getByRole("textbox", { name: /Suchbegriff/i }), "Tisch{Enter}");

            expect(screen.getByText("Tisch")).toBeInTheDocument();
            expect(
                screen.getByRole("textbox", { name: /Name des Suchauftrags/i }),
            ).toBeInTheDocument();
        });

        it("does not add a query term shorter than 3 characters as a tag", async () => {
            const user = userEvent.setup();
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );

            const queryInput = screen.getByRole("textbox", { name: /Suchbegriff/i });
            await user.type(queryInput, "ab{Enter}");

            expect(screen.queryByText("ab")).not.toBeInTheDocument();
            expect(queryInput).toHaveValue("ab");
            expect(
                screen.getByText("Jeder Suchbegriff muss mindestens 3 Zeichen lang sein."),
            ).toBeInTheDocument();
        });

        it("shows a validation error and does not advance when no query term was added", async () => {
            const user = userEvent.setup();
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );

            await user.type(
                screen.getByRole("textbox", { name: /Name des Suchauftrags/i }),
                "Kurzer Filter",
            );
            await user.click(screen.getByRole("button", { name: /^Weiter$/i }));

            expect(
                screen.getByText("Bitte geben Sie mindestens einen Suchbegriff ein."),
            ).toBeInTheDocument();
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
            expect(screen.getByText("Tisch")).toBeInTheDocument();
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
            expect(screen.getByText("Tisch")).toBeInTheDocument();
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

    describe("save directly", () => {
        it("renders the save-directly button on step 1", async () => {
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );
            expect(screen.getByRole("button", { name: /Speichern/i })).toBeInTheDocument();
        });

        it("renders the save-directly button on a filter step", async () => {
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
            expect(screen.getByRole("button", { name: /Speichern/i })).toBeInTheDocument();
        });

        it("does not render the save-directly button on the confirm step", async () => {
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
            expect(screen.queryByRole("button", { name: /^Weiter$/i })).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /^Speichern$/i })).not.toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "Suchauftrag speichern" }),
            ).toBeInTheDocument();
        });

        it("does not save when form is invalid on step 1", async () => {
            const user = userEvent.setup();
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );
            await user.click(screen.getByRole("button", { name: /Speichern/i }));
            expect(mockCreateMutate).not.toHaveBeenCalled();
        });

        it("calls createFilter directly from step 1 with valid form data", async () => {
            const user = userEvent.setup();
            await act(() =>
                renderWithRouter(
                    <CreateSearchFilterWizard open onOpenChange={vi.fn()} mode="create" />,
                ),
            );
            await user.type(
                screen.getByRole("textbox", { name: /Name des Suchauftrags/i }),
                "Schnellfilter",
            );
            await user.type(screen.getByRole("textbox", { name: /Suchbegriff/i }), "Stuhl");
            await user.click(screen.getByRole("button", { name: /Speichern/i }));
            expect(mockCreateMutate).toHaveBeenCalledWith(
                expect.objectContaining({ name: "Schnellfilter" }),
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            );
        });

        it("calls createFilter directly from a filter step", async () => {
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
            await user.click(screen.getByRole("button", { name: /Speichern/i }));
            expect(mockUpdateMutate).toHaveBeenCalledWith(
                expect.objectContaining({ id: "filter-1" }),
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            );
        });

        it("calls updateFilter directly in edit mode from step 1", async () => {
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
            await user.click(screen.getByRole("button", { name: /Speichern/i }));
            expect(mockUpdateMutate).toHaveBeenCalledWith(
                expect.objectContaining({ id: "filter-1" }),
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            );
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

        it("saves when Enter is pressed on the confirm step", async () => {
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
            await user.keyboard("{Enter}");

            expect(mockUpdateMutate).toHaveBeenCalledWith(
                expect.objectContaining({ id: "filter-1" }),
                expect.objectContaining({ onSuccess: expect.any(Function) }),
            );
        });

        it("does not save when Enter activates an interactive preview control", async () => {
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
            screen.getByRole("button", { name: "Preview listing action" }).focus();
            await user.keyboard("{Enter}");

            expect(mockUpdateMutate).not.toHaveBeenCalled();
        });
    });
});
