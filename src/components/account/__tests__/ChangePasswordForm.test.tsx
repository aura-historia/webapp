import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ChangePasswordForm } from "../ChangePasswordForm";
import { renderWithRouter } from "@/test/utils";

const mockMutate = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/account/useChangePassword", () => ({
    useChangePassword: () => ({
        mutate: mockMutate,
        isPending: false,
    }),
}));

describe("ChangePasswordForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders field-level password policy hints", async () => {
        await act(async () => renderWithRouter(<ChangePasswordForm />));

        expect(
            screen.getByText("Passwort muss mindestens 8 Zeichen enthalten."),
        ).toBeInTheDocument();
        expect(screen.getByText("Passwort muss Großbuchstaben enthalten.")).toBeInTheDocument();
        expect(screen.getByText("Passwort muss Kleinbuchstaben enthalten.")).toBeInTheDocument();
        expect(screen.getByText("Passwort muss Zahlen enthalten.")).toBeInTheDocument();
        expect(screen.getByText("Passwort muss Sonderzeichen enthalten.")).toBeInTheDocument();
    });

    it("validates password confirmation", async () => {
        const user = userEvent.setup();
        await act(async () => renderWithRouter(<ChangePasswordForm />));

        await user.type(screen.getByLabelText("Aktuelles Passwort"), "OldPassword1!");
        await user.type(screen.getByLabelText("Neues Passwort"), "NewPassword1!");
        await user.type(screen.getByLabelText("Neues Passwort bestätigen"), "DifferentPassword1!");
        await user.click(screen.getByRole("button", { name: "Passwort speichern" }));

        await waitFor(() => {
            expect(screen.getByText("Ihre Passwörter müssen übereinstimmen.")).toBeInTheDocument();
        });

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("submits old and new password", async () => {
        const user = userEvent.setup();
        await act(async () => renderWithRouter(<ChangePasswordForm />));

        await user.type(screen.getByLabelText("Aktuelles Passwort"), "OldPassword1!");
        await user.type(screen.getByLabelText("Neues Passwort"), "NewPassword1!");
        await user.type(screen.getByLabelText("Neues Passwort bestätigen"), "NewPassword1!");
        await user.click(screen.getByRole("button", { name: "Passwort speichern" }));

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith(
                {
                    oldPassword: "OldPassword1!",
                    newPassword: "NewPassword1!",
                },
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                    onError: expect.any(Function),
                }),
            );
        });
    });
});
