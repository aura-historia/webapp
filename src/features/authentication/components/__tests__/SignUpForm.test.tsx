import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignUp = vi.hoisted(() => vi.fn());
const mockSignInWithRedirect = vi.hoisted(() => vi.fn());
const mockSubscribe = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify/auth", () => ({
    signUp: mockSignUp,
    signInWithRedirect: mockSignInWithRedirect,
}));

vi.mock("@/features/newsletter/api/useNewsletterSubscription.ts", () => ({
    useNewsletterSubscription: () => ({ mutateAsync: mockSubscribe, isPending: false }),
}));

import { SignUpForm } from "../SignUpForm";
import { renderWithRouter } from "@/test/utils";

describe("SignUpForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSignUp.mockResolvedValue(undefined);
    });

    const marketingCheckboxName = /Ich möchte E-Mails von Aura Historia/;

    async function renderSignUpForm(onSuccess = vi.fn()) {
        await act(async () => {
            renderWithRouter(
                <SignUpForm onSuccess={onSuccess} onSwitchToSignIn={vi.fn()} locale="de" />,
            );
        });
    }

    async function fillCredentials(user: ReturnType<typeof userEvent.setup>) {
        await user.type(screen.getByLabelText("E-Mail"), " user@example.com ");
        await user.type(screen.getByLabelText("Passwort*"), "Password1!");
        await user.type(screen.getByLabelText("Passwort bestätigen*"), "Password1!");
    }

    it("renders the optional marketing checkbox unchecked with the purpose and privacy link", async () => {
        await renderSignUpForm();

        const checkbox = screen.getByRole("checkbox", { name: marketingCheckboxName });
        expect(checkbox).not.toBeChecked();
        expect(checkbox).toHaveAccessibleName(
            "Ich möchte E-Mails von Aura Historia mit Newslettern, personalisierten Produktempfehlungen sowie Informationen zu Funktionen und Tarifen von Aura Historia erhalten. Ich kann mich jederzeit abmelden.",
        );
        expect(checkbox).toHaveAccessibleDescription(/Datenschutzerklärung/);
        expect(screen.getByRole("link", { name: "Datenschutzerklärung" })).toHaveAttribute(
            "href",
            "/de/privacy",
        );
    });

    it("signs up without marketing consent when the checkbox stays unchecked", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        await renderSignUpForm(onSuccess);

        await fillCredentials(user);
        await user.click(screen.getByRole("button", { name: "Konto erstellen" }));

        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith({
                username: "user@example.com",
                password: "Password1!",
                options: {
                    userAttributes: {
                        email: "user@example.com",
                        "custom:marketing_consent": "false",
                    },
                },
            });
        });

        expect(onSuccess).toHaveBeenCalledWith("user@example.com", "Password1!");
        expect(mockSubscribe).not.toHaveBeenCalled();
    });

    it("sends only the immutable consent attribute when the checkbox is checked", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        await renderSignUpForm(onSuccess);

        await fillCredentials(user);
        await user.click(screen.getByRole("checkbox", { name: marketingCheckboxName }));
        await user.click(screen.getByRole("button", { name: "Konto erstellen" }));

        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledTimes(1);
        });

        const input = mockSignUp.mock.calls[0][0];
        expect(input).toStrictEqual({
            username: "user@example.com",
            password: "Password1!",
            options: {
                userAttributes: {
                    email: "user@example.com",
                    "custom:marketing_consent": "true",
                },
            },
        });
        expect(onSuccess).toHaveBeenCalledWith("user@example.com", "Password1!");
        expect(mockSubscribe).not.toHaveBeenCalled();
        expect(window.location.search).toBe("");
        for (const storage of [localStorage, sessionStorage]) {
            for (let index = 0; index < storage.length; index++) {
                const key = storage.key(index) ?? "";
                expect(`${key}=${storage.getItem(key)}`).not.toMatch(/marketing|Password1!/);
            }
        }
    });

    it("does not sign up or request a newsletter when the form is invalid", async () => {
        const user = userEvent.setup();
        await renderSignUpForm();

        await user.click(screen.getByRole("checkbox", { name: marketingCheckboxName }));
        await user.click(screen.getByRole("button", { name: "Konto erstellen" }));

        await waitFor(() => {
            expect(screen.getByLabelText("E-Mail")).toHaveAttribute("aria-invalid", "true");
        });
        expect(mockSignUp).not.toHaveBeenCalled();
        expect(mockSubscribe).not.toHaveBeenCalled();
    });

    it("shows the error and does not request a newsletter when signup fails", async () => {
        mockSignUp.mockRejectedValue(new Error("Signup failed"));
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        await renderSignUpForm(onSuccess);

        await fillCredentials(user);
        await user.click(screen.getByRole("checkbox", { name: marketingCheckboxName }));
        await user.click(screen.getByRole("button", { name: "Konto erstellen" }));

        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledTimes(1);
        });
        expect(onSuccess).not.toHaveBeenCalled();
        expect(mockSubscribe).not.toHaveBeenCalled();
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
        expect(mockSubscribe).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
