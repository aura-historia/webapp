import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminOverviewPage } from "../AdminOverviewPage.tsx";

const mockUseAdminPartnerApplications = vi.hoisted(() => vi.fn());
const mockUseAdminUsers = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/admin/useAdminPartnerApplications.ts", () => ({
    useAdminPartnerApplications: mockUseAdminPartnerApplications,
}));

vi.mock("@/hooks/admin/useAdminUsers.ts", () => ({
    useAdminUsers: mockUseAdminUsers,
}));

vi.mock("@tanstack/react-router", () => ({
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
}));

describe("AdminOverviewPage", () => {
    it("renders overview cards and summary counts", () => {
        mockUseAdminPartnerApplications.mockReturnValue({
            data: [
                { businessState: "SUBMITTED" },
                { businessState: "IN_REVIEW" },
                { businessState: "APPROVED" },
            ],
        });
        mockUseAdminUsers.mockReturnValue({
            data: {
                pages: [{ total: 42 }],
            },
        });

        render(<AdminOverviewPage />);

        expect(screen.getByRole("link", { name: /Shops/i })).toHaveAttribute(
            "href",
            "/admin/shops",
        );
        expect(screen.getByRole("link", { name: /Partner-Anträge/i })).toHaveAttribute(
            "href",
            "/admin/partner-applications",
        );
        expect(screen.getByRole("link", { name: /Benutzer/i })).toHaveAttribute(
            "href",
            "/admin/users",
        );
        expect(screen.getByText("2 Anträge warten auf Prüfung")).toBeInTheDocument();
        expect(screen.getByText("42 Benutzerkonten")).toBeInTheDocument();
    });
});
