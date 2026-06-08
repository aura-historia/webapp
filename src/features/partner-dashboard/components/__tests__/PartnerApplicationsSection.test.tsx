import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerApplicationsSection } from "@/features/partner-dashboard/components/PartnerApplicationsSection.tsx";
import type { PartnerApplication } from "@/data/internal/partner-application/PartnerApplication.ts";

const mockUsePartnerApplications = vi.hoisted(() => vi.fn());

vi.mock("@/features/partner-dashboard/api/usePartnerApplications.ts", () => ({
    usePartnerApplications: mockUsePartnerApplications,
}));

const submittedApplication: PartnerApplication = {
    id: "app-submitted",
    applicantUserId: "user-1",
    businessState: "SUBMITTED",
    executionState: "PROCESSING",
    payload: {
        type: "NEW",
        shopName: "Vintage Shop",
        shopType: "MARKETPLACE",
        shopDomains: ["vintage.example.com"],
    },
    created: new Date("2024-01-01T00:00:00Z"),
    updated: new Date("2024-01-02T00:00:00Z"),
};

const approvedApplication: PartnerApplication = {
    id: "app-approved",
    applicantUserId: "user-1",
    businessState: "APPROVED",
    executionState: "COMPLETED",
    payload: {
        type: "EXISTING",
        shopId: "shop-1",
    },
    created: new Date("2024-01-03T00:00:00Z"),
    updated: new Date("2024-01-04T00:00:00Z"),
};

describe("PartnerApplicationsSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePartnerApplications.mockReturnValue({
            data: [submittedApplication, approvedApplication],
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });
    });

    it("renders all current applications and their associated states", () => {
        render(<PartnerApplicationsSection />);

        expect(screen.getByText("Vintage Shop")).toBeInTheDocument();
        expect(screen.getByText("Bestehender Shop: shop-1")).toBeInTheDocument();
        expect(screen.getByText("Eingereicht")).toBeInTheDocument();
        expect(screen.getByText("In Verarbeitung")).toBeInTheDocument();
        expect(screen.getByText("Genehmigt")).toBeInTheDocument();
        expect(screen.getByText("Abgeschlossen")).toBeInTheDocument();
    });

    it("shows an empty state when the user has no applications", () => {
        mockUsePartnerApplications.mockReturnValue({
            data: [],
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<PartnerApplicationsSection />);

        expect(
            screen.getByText("Sie haben noch keine Partneranträge eingereicht."),
        ).toBeInTheDocument();
    });

    it("renders skeleton rows while loading applications", () => {
        mockUsePartnerApplications.mockReturnValue({
            data: undefined,
            isPending: true,
            isError: false,
            refetch: vi.fn(),
        });

        render(<PartnerApplicationsSection />);

        expect(screen.getByRole("status")).toHaveTextContent("Partneranträge werden geladen.");
    });

    it("offers retry when applications fail to load", async () => {
        const user = userEvent.setup();
        const refetch = vi.fn();
        mockUsePartnerApplications.mockReturnValue({
            data: undefined,
            isPending: false,
            isError: true,
            refetch,
        });

        render(<PartnerApplicationsSection />);

        await user.click(screen.getByRole("button", { name: /Erneut versuchen/i }));

        expect(refetch).toHaveBeenCalledOnce();
    });
});
