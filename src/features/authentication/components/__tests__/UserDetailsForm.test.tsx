import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUpdateAccount = vi.hoisted(() => vi.fn());
const mockSubscribe = vi.hoisted(() => vi.fn());

vi.mock("@/features/authentication/hooks/useRegistrationAccount.ts", () => ({
    useRegistrationAccount: () => ({
        mutateAsync: mockUpdateAccount,
        isPending: false,
    }),
}));

vi.mock("@/features/newsletter/api/useNewsletterSubscription.ts", () => ({
    useNewsletterSubscription: () => ({
        mutateAsync: mockSubscribe,
        isPending: false,
    }),
}));

import { UserDetailsForm } from "../UserDetailsForm";
import { renderWithRouter } from "@/test/utils";

describe("UserDetailsForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        mockUpdateAccount.mockResolvedValue(undefined);
        mockSubscribe.mockRejectedValue(new Error("Newsletter provider unavailable"));
    });

    it("does not offer a newsletter or marketing checkbox after registration", async () => {
        await act(async () => {
            renderWithRouter(<UserDetailsForm onSuccess={vi.fn()} />);
        });

        expect(screen.getAllByRole("checkbox")).toHaveLength(1);
        expect(
            screen.getByRole("checkbox", { name: /Ungeprüfte oder sensible Inhalte anzeigen/ }),
        ).not.toBeChecked();
        expect(screen.queryByText(/Newsletter/)).not.toBeInTheDocument();
    });

    it("preselects the inferred language and preferred currency", async () => {
        await act(async () => {
            renderWithRouter(<UserDetailsForm onSuccess={vi.fn()} />);
        });

        expect(screen.getByRole("combobox", { name: "Sprache" })).toHaveTextContent("Deutsch");
        expect(screen.getByRole("button", { name: "Währung" })).toHaveTextContent("EUR - Euro");
    });

    it("saves the profile and completes without requesting a newsletter subscription", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();

        await act(async () => {
            renderWithRouter(<UserDetailsForm onSuccess={onSuccess} />);
        });

        await user.type(screen.getByLabelText("Vorname"), "Max");
        await user.type(screen.getByLabelText("Nachname"), "Mustermann");
        await user.click(screen.getByRole("button", { name: "Speichern und fortfahren" }));

        await waitFor(() => {
            expect(mockUpdateAccount).toHaveBeenCalledWith({
                firstName: "Max",
                lastName: "Mustermann",
                language: "de",
                currency: "EUR",
                unitSystem: "METRIC",
                showUnassessedOrSensitiveContent: false,
            });
        });

        expect(onSuccess).toHaveBeenCalled();
        expect(mockSubscribe).not.toHaveBeenCalled();
    });

    it("completes on skip without saving or requesting a newsletter subscription", async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();

        await act(async () => {
            renderWithRouter(<UserDetailsForm onSuccess={onSuccess} />);
        });

        await user.click(screen.getByRole("button", { name: "Vorerst überspringen" }));

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalled();
        });

        expect(mockUpdateAccount).not.toHaveBeenCalled();
        expect(mockSubscribe).not.toHaveBeenCalled();
    });

    it("shows the profile error without completing when saving fails", async () => {
        mockUpdateAccount.mockRejectedValue(new Error("Profile could not be saved"));
        const user = userEvent.setup();
        const onSuccess = vi.fn();

        await act(async () => {
            renderWithRouter(<UserDetailsForm onSuccess={onSuccess} />);
        });

        await user.click(screen.getByRole("button", { name: "Speichern und fortfahren" }));

        expect(await screen.findByText("Profile could not be saved")).toBeInTheDocument();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(mockSubscribe).not.toHaveBeenCalled();
    });
});
