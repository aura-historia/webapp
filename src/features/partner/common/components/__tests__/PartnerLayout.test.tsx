import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PartnerLayout } from "@/features/partner/common/components/PartnerLayout.tsx";

vi.mock("@/features/partner/common/components/PartnerSidebar.tsx", () => ({
    PartnerSidebar: () => <nav>Partner navigation</nav>,
}));

describe("PartnerLayout", () => {
    it("renders the common dashboard title, navigation, and route content", () => {
        render(
            <PartnerLayout>
                <section>Route content</section>
            </PartnerLayout>,
        );

        expect(screen.getByRole("heading", { name: "Partner-Dashboard" })).toBeInTheDocument();
        expect(screen.getByRole("navigation")).toHaveTextContent("Partner navigation");
        expect(screen.getByRole("main")).toHaveTextContent("Route content");
    });
});
