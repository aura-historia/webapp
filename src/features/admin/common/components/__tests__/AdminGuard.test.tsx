import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UserAccountData } from "@/data/internal/account/UserAccountData.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { AdminGuard } from "../AdminGuard.tsx";

const mockUseUserAccount = vi.hoisted(() => vi.fn());

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: mockUseUserAccount,
}));

const baseUser: UserAccountData = {
    userId: "usr_01TESTUSER",
    email: "user@example.com",
    showUnassessedOrSensitiveContent: false,
    role: "USER",
    subscriptionType: "free",
};

function renderGuard() {
    return renderWithRouter(
        <AdminGuard>
            <span>secret-content</span>
        </AdminGuard>,
    );
}

describe("AdminGuard", () => {
    it("shows the shell's loading shape while the role is being fetched", async () => {
        mockUseUserAccount.mockReturnValue({ data: undefined, isLoading: true, isError: false });
        renderGuard();

        expect(await screen.findByRole("status", { name: "Wird geladen…" })).toBeInTheDocument();
        expect(screen.queryByText("secret-content")).not.toBeInTheDocument();
    });

    it.each([
        ["no account is loaded", { data: undefined, isError: false }],
        ["the role is USER", { data: { ...baseUser, role: "USER" }, isError: false }],
        ["the account request fails", { data: { ...baseUser, role: "ADMIN" }, isError: true }],
    ])("denies access when %s", async (_case, state) => {
        mockUseUserAccount.mockReturnValue({ ...state, isLoading: false });
        renderGuard();

        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent("Nur für Administratoren");
        expect(screen.getByRole("link", { name: "Zur Startseite" })).toHaveAttribute("href", "/de");
        expect(screen.queryByText("secret-content")).not.toBeInTheDocument();
    });

    it("renders children only when the role is ADMIN", async () => {
        mockUseUserAccount.mockReturnValue({
            data: { ...baseUser, role: "ADMIN" },
            isLoading: false,
            isError: false,
        });
        renderGuard();

        expect(await screen.findByText("secret-content")).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
});
