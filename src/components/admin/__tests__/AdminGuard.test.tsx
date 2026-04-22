import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { UserAccountData } from "@/data/internal/account/UserAccountData.ts";
import { AdminGuard } from "../AdminGuard.tsx";

const mockUseUserAccount = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/account/useUserAccount.ts", () => ({
    useUserAccount: mockUseUserAccount,
}));

const baseUser: UserAccountData = {
    userId: "u-1",
    email: "user@example.com",
    prohibitedContentConsent: false,
    role: "USER",
    created: new Date("2024-01-01T00:00:00Z"),
    updated: new Date("2024-01-01T00:00:00Z"),
};

describe("AdminGuard", () => {
    it("shows a loading indicator while the role is being fetched", () => {
        mockUseUserAccount.mockReturnValue({ data: undefined, isLoading: true, isError: false });

        render(
            <AdminGuard>
                <span>secret-content</span>
            </AdminGuard>,
        );

        expect(screen.queryByText("secret-content")).not.toBeInTheDocument();
        expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
    });

    it("denies access and hides children when no user is loaded", () => {
        mockUseUserAccount.mockReturnValue({ data: undefined, isLoading: false, isError: false });

        render(
            <AdminGuard>
                <span>secret-content</span>
            </AdminGuard>,
        );

        expect(screen.queryByText("secret-content")).not.toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("denies access and hides children when the role is USER", () => {
        mockUseUserAccount.mockReturnValue({
            data: { ...baseUser, role: "USER" },
            isLoading: false,
            isError: false,
        });

        render(
            <AdminGuard>
                <span>secret-content</span>
            </AdminGuard>,
        );

        expect(screen.queryByText("secret-content")).not.toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("denies access and hides children when the account request errors", () => {
        mockUseUserAccount.mockReturnValue({
            data: { ...baseUser, role: "ADMIN" },
            isLoading: false,
            isError: true,
        });

        render(
            <AdminGuard>
                <span>secret-content</span>
            </AdminGuard>,
        );

        expect(screen.queryByText("secret-content")).not.toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("renders children only when the role is ADMIN", () => {
        mockUseUserAccount.mockReturnValue({
            data: { ...baseUser, role: "ADMIN" },
            isLoading: false,
            isError: false,
        });

        render(
            <AdminGuard>
                <span>secret-content</span>
            </AdminGuard>,
        );

        expect(screen.getByText("secret-content")).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
});
