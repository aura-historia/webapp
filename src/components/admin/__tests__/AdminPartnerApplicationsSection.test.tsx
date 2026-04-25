import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminPartnerApplicationsSection } from "../AdminPartnerApplicationsSection.tsx";
import type { PartnerApplication } from "@/data/internal/partner-application/PartnerApplication.ts";

const mockUseAdminPartnerApplications = vi.hoisted(() => vi.fn());
const mockDecisionMutate = vi.hoisted(() => vi.fn());
const mockPatchMutate = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/admin/useAdminPartnerApplications.ts", () => ({
    useAdminPartnerApplications: mockUseAdminPartnerApplications,
}));

vi.mock("@/hooks/admin/useAdminPartnerApplicationActions.ts", () => ({
    useAdminPartnerApplicationDecision: () => ({
        mutate: mockDecisionMutate,
        isPending: false,
    }),
    usePatchAdminPartnerApplication: () => ({
        mutate: mockPatchMutate,
        isPending: false,
    }),
}));

vi.mock("../AdminApplicationEditDialog.tsx", () => ({
    AdminApplicationEditDialog: ({
        application,
        open,
    }: {
        application: PartnerApplication | null;
        open: boolean;
    }) => (open ? <div>edit-dialog:{application?.id}</div> : null),
}));

vi.mock("../AdminPartnerApplicationDetailDialog.tsx", () => ({
    AdminPartnerApplicationDetailDialog: ({
        application,
        open,
    }: {
        application: PartnerApplication | null;
        open: boolean;
    }) => (open ? <div>detail-dialog:{application?.id}</div> : null),
}));

const pendingApplication: PartnerApplication = {
    id: "app-pending",
    applicantUserId: "user-pending",
    businessState: "IN_REVIEW",
    executionState: "WAITING",
    payload: {
        type: "NEW",
        shopName: "Pending Shop",
        shopType: "AUCTION_HOUSE",
        shopDomains: ["pending.example.com"],
    },
    created: new Date("2024-01-01T00:00:00Z"),
    updated: new Date("2024-01-02T00:00:00Z"),
};

const approvedApplication: PartnerApplication = {
    id: "app-approved",
    applicantUserId: "user-approved",
    businessState: "APPROVED",
    executionState: "COMPLETED",
    payload: {
        type: "EXISTING",
        shopId: "shop-approved",
    },
    created: new Date("2024-01-03T00:00:00Z"),
    updated: new Date("2024-01-04T00:00:00Z"),
};

describe("AdminPartnerApplicationsSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAdminPartnerApplications.mockReturnValue({
            data: [pendingApplication, approvedApplication],
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });
    });

    it("shows pending applications by default and can switch to all tabs", async () => {
        const user = userEvent.setup();

        render(<AdminPartnerApplicationsSection />);

        expect(screen.getByText("Pending Shop")).toBeInTheDocument();
        expect(screen.queryByText(/Bestehender Shop: shop-approved/i)).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Alle" }));

        expect(screen.getByText(/Bestehender Shop: shop-approved/i)).toBeInTheDocument();
    });

    it("opens the detail dialog for the selected application", async () => {
        const user = userEvent.setup();

        render(<AdminPartnerApplicationsSection />);

        await user.click(screen.getByRole("button", { name: /Details/i }));

        expect(screen.getByText("detail-dialog:app-pending")).toBeInTheDocument();
    });

    it("submits an approve decision for reviewable applications", async () => {
        const user = userEvent.setup();

        render(<AdminPartnerApplicationsSection />);

        await user.click(screen.getByRole("button", { name: /Genehmigen/i }));

        expect(mockDecisionMutate).toHaveBeenCalledWith(
            { partnerApplicationId: "app-pending", decision: "APPROVE" },
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });

    it("shows edit only for editable new applications", () => {
        render(<AdminPartnerApplicationsSection />);

        expect(screen.getByRole("button", { name: /Bearbeiten/i })).toBeInTheDocument();
    });
});
