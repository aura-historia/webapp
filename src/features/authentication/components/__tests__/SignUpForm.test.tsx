import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignUp = vi.hoisted(() => vi.fn());
const mockSignInWithRedirect = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify/auth", () => ({
    signUp: mockSignUp,
    signInWithRedirect: mockSignInWithRedirect,
}));

import { SignUpForm } from "../SignUpForm";
import { renderWithRouter } from "@/test/utils";

describe("SignUpForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSignUp.mockResolvedValue(undefined);
    });

    it("does not render the newsletter opt-in checkbox", async () => {
        await act(async () => {
            renderWithRouter(
                <SignUpForm onSuccess={vi.fn()} onSwitchToSignIn={vi.fn()} locale="de" />,
            );
        });

        expect(
            screen.queryByRole("checkbox", {
                name: "Für den Aura Historia Newsletter anmelden",
            }),
        ).not.toBeInTheDocument();
    });

    it("submits signup credentials and forwards them to onSuccess", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();

        await act(async () => {
            renderWithRouter(
                <SignUpForm onSuccess={onSuccess} onSwitchToSignIn={vi.fn()} locale="de" />,
            );
        });

        await user.type(screen.getByLabelText("E-Mail"), "user@example.com");
        await user.type(screen.getByLabelText("Passwort*"), "Password1!");
        await user.type(screen.getByLabelText("Passwort bestätigen*"), "Password1!");
        await user.click(screen.getByRole("button", { name: "Konto erstellen" }));

        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith({
                username: "user@example.com",
                password: "Password1!",
                options: {
                    userAttributes: {
                        email: "user@example.com",
                    },
                },
            });
        });

        expect(onSuccess).toHaveBeenCalledWith("user@example.com", "Password1!");
    });

    it("starts the Google redirect with sign-up intent without calling native signUp", async () => {
        mockSignInWithRedirect.mockResolvedValue(undefined);
        const user = userEvent.setup();
        const onSuccess = vi.fn();

        await act(async () => {
            renderWithRouter(
                <SignUpForm onSuccess={onSuccess} onSwitchToSignIn={vi.fn()} locale="de" />,
            );
        });
        await user.click(screen.getByRole("button", { name: "Mit Google fortfahren" }));

        await waitFor(() => {
            expect(mockSignInWithRedirect).toHaveBeenCalledTimes(1);
        });
        expect(JSON.parse(mockSignInWithRedirect.mock.calls[0][0].customState)).toMatchObject({
            intent: "sign-up",
        });
        expect(mockSignUp).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
