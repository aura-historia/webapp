import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountPage } from "../AccountPage.tsx";

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
    it("renders account sections and custom forms", () => {
        render(<AccountPage />);

        expect(screen.getByText("Mein Account")).toBeInTheDocument();
        expect(screen.getByText("Persönliche Daten")).toBeInTheDocument();
        expect(screen.getByText("Passwort ändern")).toBeInTheDocument();
        expect(screen.getByText("Account löschen")).toBeInTheDocument();

        expect(screen.getByText("Personal Data Form")).toBeInTheDocument();
        expect(screen.getByText("Change Password Form")).toBeInTheDocument();
        expect(screen.getByText("Delete Account Form")).toBeInTheDocument();
        expect(screen.getByText("Subscription Plan Section")).toBeInTheDocument();
    });
});
