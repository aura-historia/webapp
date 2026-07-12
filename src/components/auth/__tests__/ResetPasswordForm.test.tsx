import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResetPassword = vi.hoisted(() => vi.fn());
const mockConfirmResetPassword = vi.hoisted(() => vi.fn());
const mockConfirmSignUp = vi.hoisted(() => vi.fn());
const mockResendSignUpCode = vi.hoisted(() => vi.fn());
const mockSignIn = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify/auth", () => ({
    resetPassword: mockResetPassword,
    confirmResetPassword: mockConfirmResetPassword,
    confirmSignUp: mockConfirmSignUp,
    resendSignUpCode: mockResendSignUpCode,
    signIn: mockSignIn,
}));

import { ResetPasswordForm } from "../ResetPasswordForm";
import { ConfirmSignUpForm } from "../ConfirmSignUpForm";
import { renderWithRouter } from "@/test/utils";

describe("ResetPasswordForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResetPassword.mockResolvedValue(undefined);
        mockConfirmResetPassword.mockResolvedValue(undefined);
        mockConfirmSignUp.mockResolvedValue(undefined);
        mockResendSignUpCode.mockResolvedValue(undefined);
        mockSignIn.mockResolvedValue(undefined);
    });

    it("allows typing into the request email field", async () => {
        const user = userEvent.setup();
        await act(async () =>
            renderWithRouter(<ResetPasswordForm onSwitchToSignIn={vi.fn()} onSuccess={vi.fn()} />),
        );

        const emailInput = screen.getByLabelText("E-Mail");
        await user.type(emailInput, "user@example.com");

        expect(emailInput).toHaveValue("user@example.com");
    });

    it("allows typing into the confirmation code field after request step succeeds", async () => {
        const user = userEvent.setup();
        await act(async () =>
            renderWithRouter(<ResetPasswordForm onSwitchToSignIn={vi.fn()} onSuccess={vi.fn()} />),
        );

        await user.type(screen.getByLabelText("E-Mail"), "user@example.com");
        await user.click(screen.getByRole("button", { name: "Code senden" }));

        await waitFor(() => {
            expect(screen.getByLabelText("Zurücksetzungscode")).toBeInTheDocument();
        });

        const codeInput = screen.getByLabelText("Zurücksetzungscode");
        await user.type(codeInput, "123456");

        expect(codeInput).toHaveValue("123456");
    });

    it("keeps the sign-up confirmation code field idle until six digits are entered", async () => {
        const user = userEvent.setup();

        await act(async () =>
            renderWithRouter(
                <ConfirmSignUpForm
                    email="user@example.com"
                    password="Password1!"
                    onSuccess={vi.fn()}
                />,
            ),
        );

        const codeInput = screen.getByRole("textbox", { name: "Bestätigungscode" });
        await user.type(codeInput, "12345");

        expect(codeInput).toHaveValue("12345");
        expect(mockConfirmSignUp).not.toHaveBeenCalled();
    });

    it("ignores non-digit sign-up confirmation code characters", async () => {
        const user = userEvent.setup();

        await act(async () =>
            renderWithRouter(
                <ConfirmSignUpForm
                    email="user@example.com"
                    password="Password1!"
                    onSuccess={vi.fn()}
                />,
            ),
        );

        const codeInput = screen.getByRole("textbox", { name: "Bestätigungscode" });
        await user.type(codeInput, "12a");

        expect(codeInput).toHaveValue("12");
        expect(mockConfirmSignUp).not.toHaveBeenCalled();
    });

    it("automatically confirms sign up after six digits are entered", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();

        await act(async () =>
            renderWithRouter(
                <ConfirmSignUpForm
                    email="user@example.com"
                    password="Password1!"
                    onSuccess={onSuccess}
                />,
            ),
        );

        const codeInput = screen.getByRole("textbox", { name: "Bestätigungscode" });
        await user.type(codeInput, "123456");

        expect(codeInput).toHaveValue("123456");
        await waitFor(() => {
            expect(mockConfirmSignUp).toHaveBeenCalledWith({
                username: "user@example.com",
                confirmationCode: "123456",
            });
        });
        expect(mockSignIn).toHaveBeenCalledWith({
            username: "user@example.com",
            password: "Password1!",
        });
        expect(onSuccess).toHaveBeenCalledOnce();
    });

    it("resends the sign-up confirmation code", async () => {
        const user = userEvent.setup();

        await act(async () =>
            renderWithRouter(
                <ConfirmSignUpForm
                    email="user@example.com"
                    password="Password1!"
                    onSuccess={vi.fn()}
                />,
            ),
        );

        await user.click(screen.getByRole("button", { name: "Code erneut senden" }));

        await waitFor(() => {
            expect(mockResendSignUpCode).toHaveBeenCalledWith({ username: "user@example.com" });
        });
        expect(screen.getByRole("button", { name: "Code gesendet!" })).toBeDisabled();
    });

    it("shows an error and allows retrying when resending the sign-up code fails", async () => {
        const user = userEvent.setup();
        mockResendSignUpCode
            .mockRejectedValueOnce(new Error("LimitExceededException"))
            .mockResolvedValueOnce(undefined);

        await act(async () =>
            renderWithRouter(
                <ConfirmSignUpForm
                    email="user@example.com"
                    password="Password1!"
                    onSuccess={vi.fn()}
                />,
            ),
        );

        await user.click(screen.getByRole("button", { name: "Code erneut senden" }));

        await waitFor(() => {
            expect(screen.getByText("LimitExceededException")).toBeInTheDocument();
        });
        const resendButton = screen.getByRole("button", { name: "Code erneut senden" });
        expect(resendButton).toBeEnabled();

        await user.click(resendButton);

        await waitFor(() => {
            expect(mockResendSignUpCode).toHaveBeenCalledTimes(2);
        });
        expect(screen.getByRole("button", { name: "Code gesendet!" })).toBeDisabled();
    });

    it("allows manually retrying sign-up confirmation after an automatic failure", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        mockConfirmSignUp.mockRejectedValueOnce(new Error("CodeMismatchException"));

        await act(async () =>
            renderWithRouter(
                <ConfirmSignUpForm
                    email="user@example.com"
                    password="Password1!"
                    onSuccess={onSuccess}
                />,
            ),
        );

        const codeInput = screen.getByRole("textbox", { name: "Bestätigungscode" });
        await user.type(codeInput, "123456");

        await waitFor(() => {
            expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
        });
        expect(onSuccess).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", { name: "E-Mail bestätigen" }));

        await waitFor(() => {
            expect(mockConfirmSignUp).toHaveBeenCalledTimes(2);
        });
        expect(mockConfirmSignUp).toHaveBeenLastCalledWith({
            username: "user@example.com",
            confirmationCode: "123456",
        });
        expect(mockSignIn).toHaveBeenCalledWith({
            username: "user@example.com",
            password: "Password1!",
        });
        expect(onSuccess).toHaveBeenCalledOnce();
    });
});
