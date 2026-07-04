import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PartnerDashboardPage } from "@/features/partner-dashboard/pages/PartnerDashboardPage.tsx";

vi.mock("@/features/partner-dashboard/components/PartnerApplicationsSection.tsx", () => ({
    PartnerApplicationsSection: () => <section>applications-section</section>,
}));

describe("PartnerDashboardPage", () => {
    it("renders the partner dashboard shell", () => {
        render(<PartnerDashboardPage />);

        expect(screen.getByRole("heading", { name: "Partner-Dashboard" })).toBeInTheDocument();
        expect(screen.getByText("applications-section")).toBeInTheDocument();
    });
});
