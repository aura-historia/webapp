import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const userDetailsSpy = vi.hoisted(() => vi.fn());

vi.mock("@/components/auth/SignInForm.tsx", () => ({
    SignInForm: () => <div>sign-in</div>,
}));

vi.mock("@/components/auth/SignUpForm.tsx", () => ({
    SignUpForm: ({ onSuccess }: { onSuccess: (email: string, password: string) => void }) => (
        <Button onClick={() => onSuccess("user@example.com", "Password1!")}>sign-up</Button>
    ),
}));

vi.mock("@/components/auth/ConfirmSignUpForm.tsx", () => ({
    ConfirmSignUpForm: () => <div>confirm</div>,
}));

vi.mock("@/components/auth/UserDetailsForm.tsx", () => ({
    UserDetailsForm: ({ email }: { email: string }) => {
        userDetailsSpy(email);
        return <div>{email}</div>;
    },
}));

vi.mock("@/components/auth/ResetPasswordForm.tsx", () => ({
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

    it("restores the pending signup email after remounting on the user-details step", async () => {
        const user = userEvent.setup();
        const onStepChange = vi.fn();

        const { unmount } = await act(async () =>
            renderWithRouter(
                <AuthFlow step="sign-up" onStepChange={onStepChange} onComplete={vi.fn()} />,
            ),
        );

        await user.click(screen.getByRole("button", { name: "sign-up" }));

        expect(window.sessionStorage.getItem("auth.signUp.pendingEmail")).toBe("user@example.com");

        unmount();

        await act(async () =>
            renderWithRouter(
                <AuthFlow step="user-details" onStepChange={vi.fn()} onComplete={vi.fn()} />,
            ),
        );

        expect(userDetailsSpy).toHaveBeenCalledWith("user@example.com");
        expect(screen.getByText("user@example.com")).toBeInTheDocument();
    });
});
