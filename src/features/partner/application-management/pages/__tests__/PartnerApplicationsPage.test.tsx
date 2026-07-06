import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PartnerApplicationsPage } from "@/features/partner/application-management/pages/PartnerApplicationsPage.tsx";

vi.mock(
    "@/features/partner/application-management/components/PartnerApplicationsSection.tsx",
    () => ({
        PartnerApplicationsSection: () => <section>applications-section</section>,
    }),
);

describe("PartnerApplicationsPage", () => {
    it("renders application management", () => {
        render(<PartnerApplicationsPage />);

        expect(screen.getByText("applications-section")).toBeInTheDocument();
    });
});
