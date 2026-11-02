import { act, screen } from "@testing-library/react";
import { DealersSection } from "@/features/landing/components/dealers-section/DealersSection.tsx";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";
import { renderWithRouter } from "@/test/utils.tsx";

describe("DealersSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<DealersSection />);
        });
    });

    it("numbers the four destinations in order", () => {
        const rows = screen.getAllByRole("listitem");

        expect(rows).toHaveLength(4);
        expect(rows.map((row) => row.textContent?.slice(0, 2))).toEqual(["01", "02", "03", "04"]);
    });

    it("opens the Shopify App Store in a new tab and says so", () => {
        const link = screen.getByRole("link", { name: /Partner Connect für Shopify/ });

        expect(link).toHaveAttribute("href", SHOPIFY_APP_STORE_URL);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
        expect(link).toHaveAccessibleName(/\(öffnet in neuem Tab\)$/);
    });

    it("names the WordPress directory row after our plugin for WooCommerce, with its registered mark", () => {
        const link = screen.getByRole("link", { name: /Partner Connect für WooCommerce®/ });

        expect(link).toHaveAttribute("href", WORDPRESS_PLUGIN_DIRECTORY_URL);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveTextContent(
            "Angebote aus Ihrem WooCommerce-Shop auf WordPress synchronisieren.",
        );
        expect(link).toHaveAccessibleName(/\(öffnet in neuem Tab\)$/);
    });

    it("keeps the custom integration and the partner dashboard as internal links", () => {
        const custom = screen.getByRole("link", { name: /Eigene Integration/ });
        const dashboard = screen.getByRole("link", { name: /Partner-Dashboard/ });

        expect(custom).toHaveAttribute(
            "href",
            expect.stringContaining("/partner-program/custom-integration"),
        );
        expect(dashboard).toHaveAttribute(
            "href",
            expect.stringContaining("/partners/applications"),
        );
        for (const link of [custom, dashboard]) {
            expect(link).not.toHaveAttribute("target");
            expect(link).not.toHaveAccessibleName(/öffnet in neuem Tab/);
        }
    });

    it("credits the platform trademarks under the rows", () => {
        expect(
            screen.getByText(
                "Shopify ist eine Marke von Shopify Inc. WooCommerce® und die zugehörigen Designs sind Marken von Automattic Inc. WordPress ist eine Marke der WordPress Foundation.",
            ),
        ).toBeInTheDocument();
    });

    it("gives every row a decorative mark beside the arrow", () => {
        for (const row of screen.getAllByRole("listitem")) {
            const graphics = row.querySelectorAll("svg");

            expect(graphics).toHaveLength(2);
            for (const graphic of graphics) {
                expect(graphic).toHaveAttribute("aria-hidden", "true");
            }
        }
    });
});
