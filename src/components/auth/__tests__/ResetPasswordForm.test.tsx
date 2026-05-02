import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResetPassword = vi.hoisted(() => vi.fn());
const mockConfirmResetPassword = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify/auth", () => ({
    resetPassword: mockResetPassword,
    confirmResetPassword: mockConfirmResetPassword,
}));

import { ResetPasswordForm } from "../ResetPasswordForm";
import { ConfirmSignUpForm } from "../ConfirmSignUpForm";
import { renderWithRouter } from "@/test/utils";

describe("ResetPasswordForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResetPassword.mockResolvedValue(undefined);
        mockConfirmResetPassword.mockResolvedValue(undefined);
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

    it("still allows typing into the confirm sign up code field", async () => {
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
        await user.type(codeInput, "123456");

        expect(codeInput).toHaveValue("123456");
    });
});
