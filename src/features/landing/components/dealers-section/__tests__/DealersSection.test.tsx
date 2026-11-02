import { DealersSection } from "@/features/landing/components/dealers-section/DealersSection.tsx";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("DealersSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<DealersSection />);
        });
    });

    it("names both shop integrations after the product, WooCommerce with its registered mark", () => {
        const shopify = screen.getByRole("link", { name: /Partner Connect für Shopify/ });
        expect(shopify).toHaveAttribute("href", SHOPIFY_APP_STORE_URL);
        expect(shopify).toHaveAttribute("target", "_blank");
        expect(shopify).toHaveTextContent("(öffnet in neuem Tab)");

        const woocommerce = screen.getByRole("link", { name: /Partner Connect für WooCommerce®/ });
        expect(woocommerce).toHaveAttribute("href", WORDPRESS_PLUGIN_DIRECTORY_URL);
        expect(woocommerce).toHaveAttribute("target", "_blank");
        expect(woocommerce).toHaveTextContent(
            "Angebote aus Ihrem WooCommerce-Shop auf WordPress synchronisieren.",
        );
    });

    it("keeps every mark and icon out of the accessibility tree", () => {
        for (const link of screen.getAllByRole("link").slice(-4)) {
            const graphics = link.querySelectorAll("svg");
            expect(graphics.length).toBeGreaterThan(1);
            for (const graphic of graphics) {
                expect(graphic).toHaveAttribute("aria-hidden", "true");
            }
        }
    });

    it("links our own tools internally", () => {
        expect(screen.getByRole("link", { name: /Eigene Integration/ })).toHaveAttribute(
            "href",
            "/de/partner-program/custom-integration",
        );
        expect(screen.getByRole("link", { name: /Partner-Dashboard/ })).toHaveAttribute(
            "href",
            "/de/partners/applications",
        );
    });

    it("credits the platform trademarks under the rows", () => {
        expect(
            screen.getByText(
                "Shopify ist eine Marke von Shopify Inc. WooCommerce® und die zugehörigen Designs sind Marken von Automattic Inc. WordPress ist eine Marke der WordPress Foundation.",
            ),
        ).toBeInTheDocument();
    });
});
