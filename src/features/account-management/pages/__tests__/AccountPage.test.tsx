import { render, screen } from "@testing-library/react";
import type { UseQueryResult } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { UserAccountData } from "@/data/internal/account/UserAccountData.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { AccountPage } from "../AccountPage.tsx";

vi.mock("@/features/account-management/hooks/useUserAccount.ts");

vi.mock("@/features/account-management/components/PersonalDataForm.tsx", () => ({
    PersonalDataForm: () => <div>Personal Data Form</div>,
}));

vi.mock("@/features/account-management/components/ChangePasswordForm.tsx", () => ({
    ChangePasswordForm: () => <div>Change Password Form</div>,
}));

vi.mock("@/features/account-management/components/DeleteAccountForm.tsx", () => ({
    DeleteAccountForm: () => <div>Delete Account Form</div>,
}));

vi.mock("@/features/account-management/components/SubscriptionPlanSection.tsx", () => ({
    SubscriptionPlanSection: () => <div>Subscription Plan Section</div>,
}));

describe("AccountPage", () => {
    it("renders the header, section navigation and every section", () => {
        vi.mocked(useUserAccount).mockReturnValue({
            data: { email: "test@example.com" } as UserAccountData,
        } as UseQueryResult<UserAccountData>);

        render(<AccountPage />);

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mein Account.");
        expect(screen.getByText("test@example.com")).toBeInTheDocument();

        const nav = screen.getByRole("navigation", { name: "Account-Bereiche" });
        expect(nav.querySelectorAll("a")).toHaveLength(4);
        expect(screen.getByRole("link", { name: /Passwort ändern/ })).toHaveAttribute(
            "href",
            "#change-password",
        );

        for (const title of [
            "Persönliche Daten",
            "Passwort ändern",
            "Abonnement",
            "Account löschen",
        ]) {
            expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument();
        }

        expect(screen.getByText("Personal Data Form")).toBeInTheDocument();
        expect(screen.getByText("Change Password Form")).toBeInTheDocument();
        expect(screen.getByText("Delete Account Form")).toBeInTheDocument();
        expect(screen.getByText("Subscription Plan Section")).toBeInTheDocument();
    });
});
