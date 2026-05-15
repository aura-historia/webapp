import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SaveSearchFilterDialog } from "../SaveSearchFilterDialog.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

const mockCreateMutate = vi.fn();

vi.mock("@/hooks/search-filters/useCreateUserSearchFilter.ts", () => ({
    useCreateUserSearchFilter: () => ({ mutate: mockCreateMutate, isPending: false }),
}));

vi.mock("@/hooks/account/useUserAccount.ts", () => ({
    useUserAccount: () => ({ data: { subscriptionType: "ultimate" } }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("SaveSearchFilterDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("opens dialog when trigger is clicked", async () => {
        const user = userEvent.setup();
        await act(() =>
            renderWithRouter(
                <SaveSearchFilterDialog searchArgs={{ q: "Tisch" }}>
                    <button type="button">Speichern</button>
                </SaveSearchFilterDialog>,
            ),
        );

        await user.click(screen.getByRole("button", { name: /Speichern/i }));
        expect(screen.getByRole("textbox", { name: /Name/i })).toBeInTheDocument();
    });

    it("shows validation error when name is empty", async () => {
        const user = userEvent.setup();
        await act(() =>
            renderWithRouter(
                <SaveSearchFilterDialog searchArgs={{ q: "Tisch" }}>
                    <button type="button">Speichern</button>
                </SaveSearchFilterDialog>,
            ),
        );

        await user.click(screen.getByRole("button", { name: /Speichern/i }));
        // Submit button inside dialog – translation key: searchFilter.saveDialog.saveButton = "Speichern"
        const submitButtons = screen.getAllByRole("button", { name: /Speichern/i });
        await user.click(submitButtons[submitButtons.length - 1]);

        expect(screen.getByRole("textbox", { name: /Name/i })).toBeInTheDocument();
        expect(mockCreateMutate).not.toHaveBeenCalled();
    });

    it("calls createFilter with name and searchArgs on valid submit", async () => {
        const user = userEvent.setup();
        mockCreateMutate.mockImplementation((_data: unknown, opts: { onSuccess: () => void }) =>
            opts?.onSuccess?.(),
        );

        await act(() =>
            renderWithRouter(
                <SaveSearchFilterDialog searchArgs={{ q: "Tisch" }}>
                    <button type="button">Speichern</button>
                </SaveSearchFilterDialog>,
            ),
        );

        await user.click(screen.getByRole("button", { name: /Speichern/i }));
        await user.type(screen.getByRole("textbox", { name: /Name/i }), "Mein Filter");
        const submitButtons = screen.getAllByRole("button", { name: /Speichern/i });
        await user.click(submitButtons[submitButtons.length - 1]);

        expect(mockCreateMutate).toHaveBeenCalledWith(
            expect.objectContaining({ name: "Mein Filter" }),
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });
});
