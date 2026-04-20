import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DeleteAccountForm } from "../DeleteAccountForm";
import { renderWithRouter } from "@/test/utils";

const mockMutate = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock("@/hooks/account/useDeleteUserAccount", () => ({
    useDeleteUserAccount: () => ({
        mutate: mockMutate,
        isPending: false,
    }),
}));

vi.mock("@aws-amplify/ui-react", () => ({
    useAuthenticator: () => ({
        signOut: mockSignOut,
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
    toast: mockToast,
}));

describe("DeleteAccountForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockResolvedValue(undefined);
    });

    it("opens a confirmation dialog before deleting", async () => {
        const user = userEvent.setup();
        await act(async () => renderWithRouter(<DeleteAccountForm />));

        await user.click(screen.getByRole("button", { name: "Account löschen" }));

        expect(
            screen.getByText("Sind Sie sicher, dass Sie Ihren Account löschen möchten?"),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Abbrechen" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Ja, Account löschen" })).toBeInTheDocument();
    });

    it("deletes account via API mutation and signs out on success", async () => {
        const user = userEvent.setup();
        mockMutate.mockImplementation((_value, options) => {
            options?.onSuccess?.();
        });

        await act(async () => renderWithRouter(<DeleteAccountForm />));

        await user.click(screen.getByRole("button", { name: "Account löschen" }));
        await user.click(screen.getByRole("button", { name: "Ja, Account löschen" }));

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                    onError: expect.any(Function),
                }),
            );
            expect(mockSignOut).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
            expect(mockToast.success).toHaveBeenCalledWith("Account wurde erfolgreich gelöscht!");
        });
    });
});
