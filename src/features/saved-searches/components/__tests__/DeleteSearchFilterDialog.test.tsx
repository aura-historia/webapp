import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteSearchFilterDialog } from "../DeleteSearchFilterDialog.tsx";

const mockDeleteMutate = vi.fn();
const mockDeleteState = vi.hoisted(() => ({ isPending: false }));
const mockToast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("@/features/saved-searches/api/useDeleteUserSearchFilter.ts", () => ({
    useDeleteUserSearchFilter: () => ({
        mutate: mockDeleteMutate,
        isPending: mockDeleteState.isPending,
    }),
}));

vi.mock("sonner", () => ({ toast: mockToast }));

function renderDialog(props: Partial<Parameters<typeof DeleteSearchFilterDialog>[0]> = {}) {
    const onOpenChange = vi.fn();
    const onDeleted = vi.fn();
    render(
        <DeleteSearchFilterDialog
            filterId="filter-1"
            filterName="Barock Möbel"
            open={true}
            onOpenChange={onOpenChange}
            onDeleted={onDeleted}
            {...props}
        />,
    );
    return { onOpenChange, onDeleted };
}

describe("DeleteSearchFilterDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockDeleteState.isPending = false;
    });

    it("renders the title with the filter name and the description", () => {
        renderDialog();
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
        expect(screen.getByText('Suchauftrag "Barock Möbel" löschen?')).toBeInTheDocument();
        expect(
            screen.getByText(
                "Der Suchauftrag wird dauerhaft entfernt und kann nicht wiederhergestellt werden.",
            ),
        ).toBeInTheDocument();
    });

    it("closes on cancel without deleting", () => {
        const { onOpenChange } = renderDialog();
        fireEvent.click(screen.getByRole("button", { name: "Abbrechen" }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(mockDeleteMutate).not.toHaveBeenCalled();
    });

    it("closes with a toast and calls onDeleted once the delete succeeds", () => {
        mockDeleteMutate.mockImplementation((_id, options) => options.onSuccess());
        const { onOpenChange, onDeleted } = renderDialog();
        fireEvent.click(screen.getByRole("button", { name: "Endgültig löschen" }));
        expect(mockDeleteMutate).toHaveBeenCalledWith("filter-1", expect.any(Object));
        expect(mockToast.success).toHaveBeenCalledWith("Suchauftrag wurde gelöscht.");
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(onDeleted).toHaveBeenCalledTimes(1);
    });

    it("stays open and shows the error when the delete fails", () => {
        mockDeleteMutate.mockImplementation((_id, options) =>
            options.onError(new Error("Fehlgeschlagen")),
        );
        const { onOpenChange, onDeleted } = renderDialog();
        fireEvent.click(screen.getByRole("button", { name: "Endgültig löschen" }));
        expect(mockToast.error).toHaveBeenCalledWith("Fehlgeschlagen");
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(onDeleted).not.toHaveBeenCalled();
    });

    it("locks both buttons and ignores dismissal while the delete is pending", () => {
        mockDeleteState.isPending = true;
        const { onOpenChange } = renderDialog();
        expect(screen.getByRole("button", { name: "Abbrechen" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Endgültig löschen" })).toBeDisabled();
        fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
        expect(onOpenChange).not.toHaveBeenCalled();
    });
});
