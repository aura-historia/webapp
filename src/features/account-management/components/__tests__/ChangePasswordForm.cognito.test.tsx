import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthError } from "aws-amplify/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "@/test/utils";
import { ChangePasswordForm } from "../ChangePasswordForm";

const mockUpdatePassword = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("aws-amplify/auth", async () => {
    const actual = await vi.importActual<typeof import("aws-amplify/auth")>("aws-amplify/auth");
    return { ...actual, updatePassword: mockUpdatePassword };
});

vi.mock("sonner", () => ({ toast: mockToast }));

/** Runs the real useChangePassword hook against Amplify's AuthError, as Cognito returns it. */
describe("ChangePasswordForm with Cognito errors", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    const submit = async () => {
        const user = userEvent.setup();
        await act(async () => renderWithRouter(<ChangePasswordForm />));
        await user.type(screen.getByLabelText("Aktuelles Passwort"), "WrongPassword1!");
        await user.type(screen.getByLabelText("Neues Passwort"), "NewPassword1!");
        await user.type(screen.getByLabelText("Neues Passwort bestätigen"), "NewPassword1!");
        await user.click(screen.getByRole("button", { name: "Passwort speichern" }));
    };

    it("translates a wrong current password", async () => {
        mockUpdatePassword.mockRejectedValue(
            new AuthError({
                name: "NotAuthorizedException",
                message: "Incorrect username or password.",
            }),
        );
        await submit();

        await waitFor(() => {
            expect(
                screen.getByText("Ihr aktuelles Passwort ist nicht korrekt."),
            ).toBeInTheDocument();
        });
        expect(screen.queryByText("Incorrect username or password.")).not.toBeInTheDocument();
        expect(mockToast.error).not.toHaveBeenCalled();
    });

    it("translates the attempt limit", async () => {
        mockUpdatePassword.mockRejectedValue(
            new AuthError({
                name: "LimitExceededException",
                message: "Attempt limit exceeded, please try after some time.",
            }),
        );
        await submit();

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith(
                "Zu viele Versuche. Bitte warten Sie einige Minuten und versuchen Sie es dann erneut.",
            );
        });
    });
});
