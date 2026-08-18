import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignIn = vi.hoisted(() => vi.fn());
const mockResendSignUpCode = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify/auth", () => ({
    signIn: mockSignIn,
    resendSignUpCode: mockResendSignUpCode,
}));

import { SignInForm } from "../SignInForm";
import { renderWithRouter } from "@/test/utils";

type ConfirmationRequiredCallback = (email: string, password: string) => void;

function createConfirmationRequiredMock() {
    return vi.fn<ConfirmationRequiredCallback>();
}

function renderSignInForm(overrides?: {
    onConfirmationRequired?: ReturnType<typeof createConfirmationRequiredMock>;
}) {
    const onConfirmationRequired =
        overrides?.onConfirmationRequired ?? createConfirmationRequiredMock();
    const onSuccess = vi.fn();

    return {
        onConfirmationRequired,
        onSuccess,
        result: renderWithRouter(
            <SignInForm
                onSwitchToSignUp={vi.fn()}
                onSwitchToResetPassword={vi.fn()}
                onConfirmationRequired={onConfirmationRequired}
                onSuccess={onSuccess}
            />,
        ),
    };
}

async function submitCredentials() {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("E-Mail"), "user@example.com");
    await user.type(screen.getByLabelText("Passwort"), "Password1!");
    await user.click(screen.getByRole("button", { name: "Anmelden" }));
}

describe("SignInForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResendSignUpCode.mockResolvedValue(undefined);
    });

    it("resends the code and requests confirmation for an unconfirmed Amplify user", async () => {
        const error = new Error("User is not confirmed.");
        error.name = "UserNotConfirmedException";
        mockSignIn.mockRejectedValue(error);
        const onConfirmationRequired = createConfirmationRequiredMock();

        await act(async () => {
            renderSignInForm({ onConfirmationRequired });
        });
        await submitCredentials();

        await waitFor(() => {
            expect(mockResendSignUpCode).toHaveBeenCalledWith({
                username: "user@example.com",
            });
        });
        expect(onConfirmationRequired).toHaveBeenCalledWith("user@example.com", "Password1!");
    });

    it("recognizes the raw Cognito UserNotConfirmedException response shape", async () => {
        mockSignIn.mockRejectedValue({
            __type: "UserNotConfirmedException",
            message: "User is not confirmed.",
        });
        const onConfirmationRequired = createConfirmationRequiredMock();

        await act(async () => {
            renderSignInForm({ onConfirmationRequired });
        });
        await submitCredentials();

        await waitFor(() => {
            expect(onConfirmationRequired).toHaveBeenCalledWith("user@example.com", "Password1!");
        });
    });

    it("requests confirmation even when automatically resending the code fails", async () => {
        const error = new Error("User is not confirmed.");
        error.name = "UserNotConfirmedException";
        mockSignIn.mockRejectedValue(error);
        mockResendSignUpCode.mockRejectedValue(
            Object.assign(new Error("Attempt limit exceeded."), {
                name: "LimitExceededException",
            }),
        );
        const onConfirmationRequired = createConfirmationRequiredMock();

        await act(async () => {
            renderSignInForm({ onConfirmationRequired });
        });
        await submitCredentials();

        await waitFor(() => {
            expect(onConfirmationRequired).toHaveBeenCalledWith("user@example.com", "Password1!");
        });
    });

    it("handles the Amplify CONFIRM_SIGN_UP next step", async () => {
        mockSignIn.mockResolvedValue({
            isSignedIn: false,
            nextStep: { signInStep: "CONFIRM_SIGN_UP" },
        });
        const onConfirmationRequired = createConfirmationRequiredMock();

        await act(async () => {
            renderSignInForm({ onConfirmationRequired });
        });
        await submitCredentials();

        await waitFor(() => {
            expect(onConfirmationRequired).toHaveBeenCalledWith("user@example.com", "Password1!");
        });
    });
});
