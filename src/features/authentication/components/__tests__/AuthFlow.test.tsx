import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const confirmationSpy = vi.hoisted(() => vi.fn());

vi.mock("@/features/authentication/components/SignInForm.tsx", () => ({
    SignInForm: ({
        onConfirmationRequired,
    }: {
        onConfirmationRequired: (email: string, password: string) => void;
    }) => (
        <Button onClick={() => onConfirmationRequired("user@example.com", "Password1!")}>
            sign-in
        </Button>
    ),
}));

vi.mock("@/features/authentication/components/SignUpForm.tsx", () => ({
    SignUpForm: ({ onSuccess }: { onSuccess: (email: string, password: string) => void }) => (
        <Button onClick={() => onSuccess("user@example.com", "Password1!")}>sign-up</Button>
    ),
}));

vi.mock("@/features/authentication/components/ConfirmSignUpForm.tsx", () => ({
    ConfirmSignUpForm: ({ email, password }: { email: string; password: string }) => {
        confirmationSpy(email, password);
        return <div>confirm</div>;
    },
}));

vi.mock("@/features/authentication/components/UserDetailsForm.tsx", () => ({
    UserDetailsForm: ({ onSuccess }: { onSuccess: () => void }) => (
        <Button onClick={onSuccess}>user-details</Button>
    ),
}));

vi.mock("@/features/authentication/components/ResetPasswordForm.tsx", () => ({
    ResetPasswordForm: () => <div>reset-password</div>,
}));

import { AuthFlow } from "../AuthFlow";
import { renderWithRouter } from "@/test/utils";
import { Button } from "@/components/ui/button.tsx";

describe("AuthFlow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.sessionStorage.clear();
    });

    it("restores only the pending signup email after remounting on the confirm step", async () => {
        const user = userEvent.setup();

        const { unmount } = await act(async () =>
            renderWithRouter(
                <AuthFlow step="sign-up" locale="de" onStepChange={vi.fn()} onComplete={vi.fn()} />,
            ),
        );

        await user.click(screen.getByRole("button", { name: "sign-up" }));

        expect(window.sessionStorage.getItem("auth.signUp.pendingEmail")).toBe("user@example.com");
        expect(window.sessionStorage).toHaveLength(1);
        expect(window.localStorage.getItem("auth.signUp.pendingEmail")).toBeNull();

        unmount();
        confirmationSpy.mockClear();

        await act(async () =>
            renderWithRouter(
                <AuthFlow step="confirm" locale="de" onStepChange={vi.fn()} onComplete={vi.fn()} />,
            ),
        );

        expect(confirmationSpy).toHaveBeenCalledWith("user@example.com", "");
    });

    it("clears the pending signup email when user details are completed", async () => {
        const user = userEvent.setup();
        const onComplete = vi.fn();
        window.sessionStorage.setItem("auth.signUp.pendingEmail", "user@example.com");

        await act(async () =>
            renderWithRouter(
                <AuthFlow
                    step="user-details"
                    locale="de"
                    onStepChange={vi.fn()}
                    onComplete={onComplete}
                />,
            ),
        );

        await user.click(screen.getByRole("button", { name: "user-details" }));

        expect(onComplete).toHaveBeenCalled();
        expect(window.sessionStorage.getItem("auth.signUp.pendingEmail")).toBeNull();
    });

    it("moves an unconfirmed sign-in to email confirmation with its credentials", async () => {
        const user = userEvent.setup();

        function TestAuthFlow() {
            const [step, setStep] = useState<"sign-in" | "confirm">("sign-in");

            return (
                <AuthFlow
                    step={step}
                    locale="de"
                    onStepChange={(newStep) => {
                        if (newStep === "sign-in" || newStep === "confirm") {
                            setStep(newStep);
                        }
                    }}
                    onComplete={vi.fn()}
                />
            );
        }

        await act(async () => renderWithRouter(<TestAuthFlow />));

        await user.click(screen.getByRole("button", { name: "sign-in" }));

        expect(window.sessionStorage.getItem("auth.signUp.pendingEmail")).toBe("user@example.com");
        expect(confirmationSpy).toHaveBeenCalledWith("user@example.com", "Password1!");
    });
});
