import PartnerProgramPage from "@/features/partner/partner-program/pages/PartnerProgramPage.tsx";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("PartnerProgramPage", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<PartnerProgramPage />);
        });
    });

    it("renders all partner page section headings", () => {
        expect(screen.getByText("Warum Partner werden?")).toBeInTheDocument();
        expect(screen.getByText("Was unsere Partner erleben")).toBeInTheDocument();
        expect(screen.getByText("So einfach verbinden Sie Ihren Shop")).toBeInTheDocument();
        expect(screen.getByText("In drei Schritten online")).toBeInTheDocument();
        expect(screen.getByText("Häufige Fragen zum Partner-Programm")).toBeInTheDocument();
    });

    it("links the final application CTA to the partner dashboard", () => {
        expect(screen.getByRole("link", { name: "Jetzt Partner werden" })).toHaveAttribute(
            "href",
            "/partners/applications",
        );
    });

    it("uses the shared contact email in the final CTA", () => {
        expect(screen.getByRole("link", { name: /E-Mail an Partner-Team/i })).toHaveAttribute(
            "href",
            "mailto:contact@aura-historia.com",
        );
    });

    it("renders integration cards linking to the external plugin listings and custom API page", () => {
        const woocommerce = screen.getByText("WordPress · WooCommerce").closest("a");
        expect(woocommerce).toHaveAttribute("href", WORDPRESS_PLUGIN_DIRECTORY_URL);
        expect(woocommerce).toHaveAttribute("target", "_blank");

        const shopify = screen.getByText("Shopify-App").closest("a");
        expect(shopify).toHaveAttribute("href", SHOPIFY_APP_STORE_URL);
        expect(shopify).toHaveAttribute("target", "_blank");

        const customApi = screen.getByText("Eigene API-Integration").closest("a");
        expect(customApi).toHaveAttribute("href", "/partner-program/custom-integration");
        expect(customApi).not.toHaveAttribute("target");
    });

    it("highlights that the program is free and cancellable in trust badges", () => {
        expect(screen.getByText("100 % kostenlos")).toBeInTheDocument();
        expect(screen.getByText("Keine technischen Kenntnisse nötig")).toBeInTheDocument();
        expect(screen.getByText("Jederzeit kündbar")).toBeInTheDocument();
    });

    it("includes the program-is-free FAQ entry", () => {
        expect(screen.getByText("Was kostet das Partner-Programm?")).toBeInTheDocument();
        expect(screen.getByText("Kann ich jederzeit aussteigen?")).toBeInTheDocument();
    });
});
