import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserAccountData } from "@/data/internal/account/UserAccountData.ts";
import type { FederatedIdentity } from "@/features/authentication/lib/federatedIdentity.ts";

const mockUpdateAccount = vi.hoisted(() => vi.fn());
const mockSubscribe = vi.hoisted(() => vi.fn());
const mockToastSuccess = vi.hoisted(() => vi.fn());
const mockAccountQuery = vi.hoisted(() => ({
    current: { data: undefined, isPending: false } as {
        data?: UserAccountData;
        isPending: boolean;
    },
}));
const mockFederatedIdentity = vi.hoisted(() => ({
    current: null as FederatedIdentity | null | undefined,
}));

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

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: () => mockAccountQuery.current,
}));

vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ isResolved: true, isAuthenticated: true }),
}));

vi.mock("@/features/authentication/hooks/useFederatedIdentity.ts", () => ({
    useFederatedIdentity: () => mockFederatedIdentity.current,
}));

vi.mock("sonner", () => ({
    toast: { success: mockToastSuccess, error: vi.fn() },
}));

import { UserDetailsForm } from "../UserDetailsForm";
import { renderWithRouter } from "@/test/utils";

const newsletterCheckboxName = /Ich möchte E-Mails von Aura Historia/;

const storedAccount: UserAccountData = {
    userId: "user-1",
    email: "user@example.com",
    firstName: "François",
    lastName: "Müller",
    language: "fr",
    showUnassessedOrSensitiveContent: false,
    role: "USER",
    subscriptionType: "free",
};

async function renderUserDetailsForm(onSuccess = vi.fn()) {
    await act(async () => {
        renderWithRouter(<UserDetailsForm onSuccess={onSuccess} />);
    });
}

describe("UserDetailsForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        mockAccountQuery.current = { data: undefined, isPending: false };
        mockFederatedIdentity.current = null;
        mockUpdateAccount.mockResolvedValue(undefined);
        mockSubscribe.mockRejectedValue(new Error("Newsletter provider unavailable"));
    });

    describe("after native sign-up", () => {
        it("does not offer a newsletter or marketing checkbox after registration", async () => {
            await renderUserDetailsForm();

            expect(screen.getAllByRole("checkbox")).toHaveLength(1);
            expect(
                screen.getByRole("checkbox", { name: /Ungeprüfte oder sensible Inhalte anzeigen/ }),
            ).not.toBeChecked();
            expect(screen.queryByText(/Newsletter/)).not.toBeInTheDocument();
        });

        it("preselects the inferred language and preferred currency", async () => {
            await renderUserDetailsForm();

            expect(screen.getByRole("combobox", { name: "Sprache" })).toHaveTextContent("Deutsch");
            expect(screen.getByRole("button", { name: "Währung" })).toHaveTextContent("EUR - Euro");
        });

        it("saves the profile and completes without requesting a newsletter subscription", async () => {
            const user = userEvent.setup();
            const onSuccess = vi.fn();
            await renderUserDetailsForm(onSuccess);

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

        it("offers every supported currency and saves a newly supported one", async () => {
            const user = userEvent.setup();
            await renderUserDetailsForm();

            await user.click(screen.getByRole("button", { name: "Währung" }));
            expect(screen.getAllByRole("option")).toHaveLength(29);
            await user.click(screen.getByRole("option", { name: "SEK - Schwedische Krone" }));
            await user.click(screen.getByRole("button", { name: "Speichern und fortfahren" }));

            await waitFor(() => {
                expect(mockUpdateAccount).toHaveBeenCalledWith(
                    expect.objectContaining({ currency: "SEK" }),
                );
            });
        });

        it("completes on skip without saving or requesting a newsletter subscription", async () => {
            const user = userEvent.setup();
            const onSuccess = vi.fn();
            await renderUserDetailsForm(onSuccess);

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
            await renderUserDetailsForm(onSuccess);

            await user.click(screen.getByRole("button", { name: "Speichern und fortfahren" }));

            expect(await screen.findByText("Profile could not be saved")).toBeInTheDocument();
            expect(onSuccess).not.toHaveBeenCalled();
            expect(mockSubscribe).not.toHaveBeenCalled();
        });
    });

    describe("prefilling", () => {
        it("waits for the stored account before showing the form", async () => {
            mockAccountQuery.current = { data: undefined, isPending: true };
            await renderUserDetailsForm();

            expect(screen.queryByLabelText("Vorname")).not.toBeInTheDocument();
        });

        it("waits for the federated identity before showing the form", async () => {
            mockAccountQuery.current = { data: storedAccount, isPending: false };
            mockFederatedIdentity.current = undefined;
            await renderUserDetailsForm();

            expect(screen.queryByLabelText("Vorname")).not.toBeInTheDocument();
        });

        it("prefills the stored profile and accepts names beyond German letters", async () => {
            mockAccountQuery.current = { data: storedAccount, isPending: false };
            const user = userEvent.setup();
            await renderUserDetailsForm();

            expect(screen.getByLabelText("Vorname")).toHaveValue("François");
            expect(screen.getByLabelText("Nachname")).toHaveValue("Müller");
            expect(screen.getByRole("combobox", { name: "Sprache" })).toHaveTextContent(
                "Französisch",
            );
            expect(screen.getByRole("button", { name: "Währung" })).toHaveTextContent("EUR - Euro");

            await user.click(screen.getByRole("button", { name: "Speichern und fortfahren" }));

            await waitFor(() => {
                expect(mockUpdateAccount).toHaveBeenCalledWith(
                    expect.objectContaining({
                        firstName: "François",
                        lastName: "Müller",
                        language: "fr",
                    }),
                );
            });
        });

        it("falls back to the provider names when the account has none", async () => {
            mockAccountQuery.current = {
                data: { ...storedAccount, firstName: undefined, lastName: undefined },
                isPending: false,
            };
            mockFederatedIdentity.current = {
                email: "user@example.com",
                firstName: "José",
                lastName: "García",
                isNewUser: true,
            };
            await renderUserDetailsForm();

            expect(screen.getByLabelText("Vorname")).toHaveValue("José");
            expect(screen.getByLabelText("Nachname")).toHaveValue("García");
        });
    });

    describe("after federated sign-up", () => {
        beforeEach(() => {
            mockAccountQuery.current = { data: storedAccount, isPending: false };
            mockFederatedIdentity.current = {
                email: "user@example.com",
                firstName: "François",
                lastName: "Müller",
                isNewUser: true,
            };
            mockSubscribe.mockResolvedValue(undefined);
        });

        it("offers the unchecked newsletter request with its double opt-in notice", async () => {
            await renderUserDetailsForm();

            const checkbox = screen.getByRole("checkbox", { name: newsletterCheckboxName });
            expect(checkbox).not.toBeChecked();
            expect(checkbox).toHaveAccessibleName(
                "Ich möchte E-Mails von Aura Historia mit Newslettern, personalisierten Produktempfehlungen sowie Informationen zu Funktionen und Tarifen von Aura Historia erhalten. Ich kann mich jederzeit abmelden.",
            );
            expect(checkbox).toHaveAccessibleDescription(
                /Bestätigungslink an user@example.com.*erst, wenn Sie ihn bestätigen.*Datenschutzerklärung/,
            );
            expect(screen.getByRole("link", { name: "Datenschutzerklärung" })).toHaveAttribute(
                "href",
                "/de/privacy",
            );
        });

        it("does not request the newsletter when the checkbox stays unchecked", async () => {
            const user = userEvent.setup();
            const onSuccess = vi.fn();
            await renderUserDetailsForm(onSuccess);

            await user.click(screen.getByRole("button", { name: "Speichern und fortfahren" }));

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalled();
            });
            expect(mockUpdateAccount).toHaveBeenCalled();
            expect(mockSubscribe).not.toHaveBeenCalled();
            expect(mockToastSuccess).not.toHaveBeenCalled();
        });

        it("requests the double opt-in after saving and asks the user to check their inbox", async () => {
            const user = userEvent.setup();
            const onSuccess = vi.fn();
            await renderUserDetailsForm(onSuccess);

            await user.click(screen.getByRole("checkbox", { name: newsletterCheckboxName }));
            await user.click(screen.getByRole("button", { name: "Speichern und fortfahren" }));

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalled();
            });
            expect(mockSubscribe).toHaveBeenCalledWith({
                email: "user@example.com",
                firstName: "François",
                lastName: "Müller",
                language: "fr",
                currency: "EUR",
            });
            expect(mockUpdateAccount.mock.invocationCallOrder[0]).toBeLessThan(
                mockSubscribe.mock.invocationCallOrder[0],
            );
            expect(mockToastSuccess).toHaveBeenCalledWith("Bitte prüfen Sie Ihr Postfach.", {
                description:
                    "Sofern user@example.com unseren Newsletter empfangen kann, senden wir einen Bestätigungslink an diese Adresse. Ihr Abonnement beginnt erst, wenn Sie den Link öffnen und bestätigen.",
                duration: 10_000,
            });
        });

        it("does not request the newsletter when the step is skipped", async () => {
            const user = userEvent.setup();
            const onSuccess = vi.fn();
            await renderUserDetailsForm(onSuccess);

            await user.click(screen.getByRole("checkbox", { name: newsletterCheckboxName }));
            await user.click(screen.getByRole("button", { name: "Vorerst überspringen" }));

            expect(onSuccess).toHaveBeenCalled();
            expect(mockUpdateAccount).not.toHaveBeenCalled();
            expect(mockSubscribe).not.toHaveBeenCalled();
        });

        it("does not request the newsletter when saving the profile fails", async () => {
            mockUpdateAccount.mockRejectedValue(new Error("Profile could not be saved"));
            const user = userEvent.setup();
            const onSuccess = vi.fn();
            await renderUserDetailsForm(onSuccess);

            await user.click(screen.getByRole("checkbox", { name: newsletterCheckboxName }));
            await user.click(screen.getByRole("button", { name: "Speichern und fortfahren" }));

            expect(await screen.findByText("Profile could not be saved")).toBeInTheDocument();
            expect(mockSubscribe).not.toHaveBeenCalled();
            expect(onSuccess).not.toHaveBeenCalled();
        });

        it("keeps the user on the step when the newsletter request fails", async () => {
            mockSubscribe.mockRejectedValue(new Error("Newsletter provider unavailable"));
            const user = userEvent.setup();
            const onSuccess = vi.fn();
            await renderUserDetailsForm(onSuccess);

            await user.click(screen.getByRole("checkbox", { name: newsletterCheckboxName }));
            await user.click(screen.getByRole("button", { name: "Speichern und fortfahren" }));

            expect(await screen.findByRole("alert")).toHaveTextContent(
                "Ihre Angaben wurden gespeichert, die Newsletter-Bestätigung konnte jedoch nicht angefordert werden.",
            );
            expect(onSuccess).not.toHaveBeenCalled();
            expect(mockToastSuccess).not.toHaveBeenCalled();
            expect(screen.getByRole("checkbox", { name: newsletterCheckboxName })).toBeChecked();
        });
    });
});
