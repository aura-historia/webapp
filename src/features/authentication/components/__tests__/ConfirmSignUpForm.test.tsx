import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConfirmSignUp = vi.hoisted(() => vi.fn());
const mockResendSignUpCode = vi.hoisted(() => vi.fn());
const mockSignIn = vi.hoisted(() => vi.fn());
const mockSubscribe = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify/auth", () => ({
    confirmSignUp: mockConfirmSignUp,
    resendSignUpCode: mockResendSignUpCode,
    signIn: mockSignIn,
}));

vi.mock("@/features/newsletter/api/useNewsletterSubscription.ts", () => ({
    useNewsletterSubscription: () => ({ mutateAsync: mockSubscribe, isPending: false }),
}));

import { ConfirmSignUpForm } from "../ConfirmSignUpForm";
import { renderWithRouter } from "@/test/utils";

describe("ConfirmSignUpForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockConfirmSignUp.mockResolvedValue(undefined);
        mockResendSignUpCode.mockResolvedValue(undefined);
        mockSignIn.mockResolvedValue(undefined);
    });

    it("confirms with only the Cognito username and code", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();

        await act(async () => {
            renderWithRouter(
                <ConfirmSignUpForm
                    email="user@example.com"
                    password="Password1!"
                    onSuccess={onSuccess}
                    onSignInRequired={vi.fn()}
                />,
            );
        });

        await user.type(screen.getByRole("textbox"), "123456");

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });

        expect(mockConfirmSignUp).toHaveBeenCalledWith({
            username: "user@example.com",
            confirmationCode: "123456",
        });
        expect(mockSignIn).toHaveBeenCalledWith({
            username: "user@example.com",
            password: "Password1!",
        });
        expect(mockSubscribe).not.toHaveBeenCalled();
    });

    it("focuses the code field on arrival so the code can be typed or pasted straight away", async () => {
        const user = userEvent.setup();

        await act(async () => {
            renderWithRouter(
                <ConfirmSignUpForm
                    email="user@example.com"
                    password="Password1!"
                    onSuccess={vi.fn()}
                    onSignInRequired={vi.fn()}
                />,
            );
        });

        expect(screen.getByRole("textbox")).toHaveFocus();

        // No click first: the keyboard lands in the field.
        await user.keyboard("123456");
        expect(screen.getByRole("textbox")).toHaveValue("123456");
    });

    it("resends the code with only the Cognito username", async () => {
        const user = userEvent.setup();

        await act(async () => {
            renderWithRouter(
                <ConfirmSignUpForm
                    email="user@example.com"
                    password=""
                    onSuccess={vi.fn()}
                    onSignInRequired={vi.fn()}
                />,
            );
        });

        await user.click(screen.getByRole("button", { name: "Code erneut senden" }));

        await waitFor(() => {
            expect(mockResendSignUpCode).toHaveBeenCalledWith({ username: "user@example.com" });
        });
        expect(mockSubscribe).not.toHaveBeenCalled();
    });
    it("hands over to sign-in when a remount dropped the password", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        const onSignInRequired = vi.fn();

        await act(async () => {
            renderWithRouter(
                <ConfirmSignUpForm
                    email="user@example.com"
                    password=""
                    onSuccess={onSuccess}
                    onSignInRequired={onSignInRequired}
                />,
            );
        });

        await user.type(screen.getByRole("textbox"), "123456");

        await waitFor(() => {
            expect(onSignInRequired).toHaveBeenCalled();
        });

        expect(mockConfirmSignUp).toHaveBeenCalledWith({
            username: "user@example.com",
            confirmationCode: "123456",
        });
        expect(mockSignIn).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it("hands over to sign-in when the sign-in after confirmation fails", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        const onSignInRequired = vi.fn();
        mockSignIn.mockRejectedValue(new Error("NotAuthorizedException"));

        await act(async () => {
            renderWithRouter(
                <ConfirmSignUpForm
                    email="user@example.com"
                    password="Password1!"
                    onSuccess={onSuccess}
                    onSignInRequired={onSignInRequired}
                />,
            );
        });

        await user.type(screen.getByRole("textbox"), "123456");

        await waitFor(() => {
            expect(onSignInRequired).toHaveBeenCalled();
        });

        expect(onSuccess).not.toHaveBeenCalled();
    });

    it("keeps a rejected code on the confirmation step", async () => {
        const user = userEvent.setup();
        const onSignInRequired = vi.fn();
        mockConfirmSignUp.mockRejectedValue(new Error("CodeMismatchException"));

        await act(async () => {
            renderWithRouter(
                <ConfirmSignUpForm
                    email="user@example.com"
                    password="Password1!"
                    onSuccess={vi.fn()}
                    onSignInRequired={onSignInRequired}
                />,
            );
        });

        await user.type(screen.getByRole("textbox"), "123456");

        await waitFor(() => {
            expect(mockConfirmSignUp).toHaveBeenCalled();
        });

        expect(mockSignIn).not.toHaveBeenCalled();
        expect(onSignInRequired).not.toHaveBeenCalled();
    });
});
