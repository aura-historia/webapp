import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { PartnerSidebar } from "@/features/partner/common/components/PartnerSidebar.tsx";

const mockPathname = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", () => ({
    Link: ({
        children,
        to,
        params: _params,
        from: _from,
        ...props
    }: {
        children: ReactNode;
        to: string;
        [key: string]: unknown;
    }) => (
        <a href={to.replace("$lng", "de")} {...props}>
            {children}
        </a>
    ),
    useRouterState: () => mockPathname(),
}));

describe("PartnerSidebar", () => {
    it("links to partner applications and marks the route as active", () => {
        mockPathname.mockReturnValue("/de/partners/applications");

        render(<PartnerSidebar />);

        expect(screen.getByRole("navigation", { name: "Partner-Bereiche" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Partner-Anträge" })).toHaveAttribute(
            "href",
            "/de/partners/applications",
        );
        expect(screen.getByRole("link", { name: "Partner-Anträge" })).toHaveAttribute(
            "aria-current",
            "page",
        );
        expect(screen.getByRole("link", { name: "Zugriffstoken" })).toHaveAttribute(
            "href",
            "/de/partners/access-tokens",
        );
    });

    it("marks access token management as active", () => {
        mockPathname.mockReturnValue("/de/partners/access-tokens");

        render(<PartnerSidebar />);

        expect(screen.getByRole("link", { name: "Zugriffstoken" })).toHaveAttribute(
            "aria-current",
            "page",
        );
    });
});
