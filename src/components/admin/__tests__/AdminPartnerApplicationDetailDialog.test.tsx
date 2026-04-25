import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartnerApplication } from "@/data/internal/partner-application/PartnerApplication.ts";
import { AdminPartnerApplicationDetailDialog } from "../AdminPartnerApplicationDetailDialog.tsx";

const mockUseAdminUser = vi.hoisted(() => vi.fn());
const mockRefetchApplicant = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/admin/useAdminUsers.ts", () => ({
    useAdminUser: mockUseAdminUser,
}));

vi.mock("@tanstack/react-router", () => ({
    Link: ({
        children,
        to,
        search,
    }: {
        children: React.ReactNode;
        to: string;
        search?: { userId?: string };
    }) => <a href={`${to}${search?.userId ? `?userId=${search.userId}` : ""}`}>{children}</a>,
}));

const application: PartnerApplication = {
    id: "app-1",
    applicantUserId: "user-1",
    businessState: "IN_REVIEW",
    executionState: "WAITING",
    payload: {
        type: "NEW",
        shopName: "Aurora Antiques",
        shopType: "AUCTION_HOUSE",
        shopDomains: ["aurora.example.com"],
        shopImage: "https://example.com/logo.png",
    },
    created: new Date("2024-01-01T00:00:00Z"),
    updated: new Date("2024-01-02T00:00:00Z"),
};

describe("AdminPartnerApplicationDetailDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("displays applicant information when loaded", () => {
        mockUseAdminUser.mockReturnValue({
            data: {
                userId: "user-1",
                email: "applicant@example.com",
                firstName: "Ada",
                lastName: "Lovelace",
                prohibitedContentConsent: false,
                tier: "PRO",
                role: "ADMIN",
                created: new Date("2024-01-01T00:00:00Z"),
                updated: new Date("2024-01-02T00:00:00Z"),
            },
            isPending: false,
            isError: false,
            refetch: mockRefetchApplicant,
        });

        render(
            <AdminPartnerApplicationDetailDialog
                application={application}
                open={true}
                onOpenChange={() => {}}
            />,
        );

        expect(mockUseAdminUser).toHaveBeenCalledWith("user-1", true);
        expect(screen.getByText("applicant@example.com")).toBeInTheDocument();
        expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
        expect(screen.getByText("PRO")).toBeInTheDocument();
        expect(screen.getByText("ADMIN")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Benutzerprofil öffnen/i })).toHaveAttribute(
            "href",
            "/admin/users?userId=user-1",
        );
    });

    it("shows a retry action when loading the applicant fails", async () => {
        const user = userEvent.setup();

        mockUseAdminUser.mockReturnValue({
            data: undefined,
            isPending: false,
            isError: true,
            refetch: mockRefetchApplicant,
        });

        render(
            <AdminPartnerApplicationDetailDialog
                application={application}
                open={true}
                onOpenChange={() => {}}
            />,
        );

        await user.click(screen.getByRole("button", { name: /erneut versuchen/i }));

        expect(mockRefetchApplicant).toHaveBeenCalled();
    });

    it("shows a loading state while the applicant is being fetched", () => {
        mockUseAdminUser.mockReturnValue({
            data: undefined,
            isPending: true,
            isError: false,
            refetch: mockRefetchApplicant,
        });

        render(
            <AdminPartnerApplicationDetailDialog
                application={application}
                open={true}
                onOpenChange={() => {}}
            />,
        );

        expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
    });
});
