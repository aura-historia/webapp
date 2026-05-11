import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUpdateAccount = vi.hoisted(() => vi.fn());
const mockSubscribe = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/account/usePatchUserAccount", () => ({
    useUpdateUserAccount: () => ({
        mutateAsync: mockUpdateAccount,
        isPending: false,
    }),
}));

vi.mock("@/hooks/newsletter/useNewsletterSubscription.ts", () => ({
    useNewsletterSubscription: () => ({
        mutateAsync: mockSubscribe,
        isPending: false,
    }),
}));

import { UserDetailsForm } from "../UserDetailsForm";
import { renderWithRouter } from "@/test/utils";

describe("UserDetailsForm", () => {
    const newsletterCheckboxName = /Ich möchte den Aura Historia Newsletter/i;

    beforeEach(() => {
        vi.clearAllMocks();
        mockUpdateAccount.mockResolvedValue(undefined);
        mockSubscribe.mockResolvedValue(undefined);
    });

    it("renders the newsletter consent checkbox checked by default on the personal details step", async () => {
        await act(async () => {
            renderWithRouter(<UserDetailsForm email="user@example.com" onSuccess={vi.fn()} />);
        });

        const checkbox = screen.getByRole("checkbox", {
            name: newsletterCheckboxName,
        });
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeChecked();
        expect(screen.getByRole("link", { name: "Datenschutzerklärung" })).toHaveAttribute(
            "href",
            "/privacy",
        );
    });

    it("subscribes to the newsletter with the default consent when the form is submitted", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();

        await act(async () => {
            renderWithRouter(<UserDetailsForm email="user@example.com" onSuccess={onSuccess} />);
        });

        await user.type(screen.getByLabelText("Vorname"), "Max");
        await user.type(screen.getByLabelText("Nachname"), "Mustermann");
        await user.click(screen.getByRole("button", { name: "Speichern und fortfahren" }));

        await waitFor(() => {
            expect(mockUpdateAccount).toHaveBeenCalledWith({
                firstName: "Max",
                lastName: "Mustermann",
                language: undefined,
                currency: undefined,
                prohibitedContentConsent: false,
            });
        });

        expect(mockSubscribe).toHaveBeenCalledWith(
            expect.objectContaining({
                email: "user@example.com",
                firstName: "Max",
                lastName: "Mustermann",
            }),
        );
        expect(onSuccess).toHaveBeenCalled();
    });

    it("doesnt subscribe to the newsletter when the user skips the personal details step with default consent enabled", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();

        await act(async () => {
            renderWithRouter(<UserDetailsForm email="user@example.com" onSuccess={onSuccess} />);
        });

        await user.click(screen.getByRole("button", { name: "Vorerst überspringen" }));

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });

        expect(mockSubscribe).not.toHaveBeenCalled();
    });

    it("does not subscribe when the user opts out before continuing", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();

        await act(async () => {
            renderWithRouter(<UserDetailsForm email="user@example.com" onSuccess={onSuccess} />);
        });

        await user.click(
            screen.getByRole("checkbox", {
                name: newsletterCheckboxName,
            }),
        );
        await user.click(screen.getByRole("button", { name: "Speichern und fortfahren" }));

        await waitFor(() => {
            expect(mockUpdateAccount).toHaveBeenCalled();
        });

        expect(mockSubscribe).not.toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
    });
});
