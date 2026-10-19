import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ChangePasswordForm } from "../ChangePasswordForm";
import { renderWithRouter } from "@/test/utils";

const mockMutate = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("sonner", () => ({ toast: mockToast }));

vi.mock("@/features/account-management/hooks/useChangePassword.ts", () => ({
    useChangePassword: () => ({
        mutate: mockMutate,
        isPending: false,
    }),
}));

describe("ChangePasswordForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the password policy checklist", async () => {
        await act(async () => renderWithRouter(<ChangePasswordForm />));

        expect(screen.getByText("Mindestens 8 Zeichen")).toBeInTheDocument();
        expect(screen.getByText("Ein Großbuchstabe")).toBeInTheDocument();
        expect(screen.getByText("Ein Kleinbuchstabe")).toBeInTheDocument();
        expect(screen.getByText("Eine Zahl")).toBeInTheDocument();
        expect(screen.getByText("Ein Sonderzeichen")).toBeInTheDocument();
        expect(screen.getByText("0 von 5")).toBeInTheDocument();
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

    const submitValidForm = async () => {
        const user = userEvent.setup();
        await act(async () => renderWithRouter(<ChangePasswordForm />));
        await user.type(screen.getByLabelText("Aktuelles Passwort"), "WrongPassword1!");
        await user.type(screen.getByLabelText("Neues Passwort"), "NewPassword1!");
        await user.type(screen.getByLabelText("Neues Passwort bestätigen"), "NewPassword1!");
        await user.click(screen.getByRole("button", { name: "Passwort speichern" }));
    };

    const failWith = (name: string, message: string) => {
        mockMutate.mockImplementation((_data, options) => {
            const error = new Error(message);
            error.name = name;
            options?.onError?.(error);
        });
    };

    it("shows a translated field error when the current password is wrong", async () => {
        failWith("NotAuthorizedException", "Incorrect username or password.");
        await submitValidForm();

        await waitFor(() => {
            expect(
                screen.getByText("Ihr aktuelles Passwort ist nicht korrekt."),
            ).toBeInTheDocument();
        });
        expect(screen.getByLabelText("Aktuelles Passwort")).toHaveAttribute("aria-invalid", "true");
        expect(screen.queryByText("Incorrect username or password.")).not.toBeInTheDocument();
        expect(mockToast.error).not.toHaveBeenCalled();
    });

    it("translates other Cognito errors in a toast", async () => {
        failWith("LimitExceededException", "Attempt limit exceeded, please try after some time.");
        await submitValidForm();

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith(
                "Versuchslimit überschritten, bitte versuchen Sie es später erneut.",
            );
        });
    });

    it("falls back to the generic message for unmapped errors", async () => {
        failWith("SomethingElse", "Untranslated server text");
        await submitValidForm();

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith("Fehler beim Ändern des Passworts.");
        });
    });
});
