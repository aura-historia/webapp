import PartnerProgramPage from "@/features/partner/partner-program/pages/PartnerProgramPage.tsx";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, fireEvent, screen } from "@testing-library/react";

describe("PartnerProgramPage", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<PartnerProgramPage />);
        });
    });

    it("renders the hero and every chapter heading", () => {
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "Verkaufen Sie Antiquitäten online? Erreichen Sie Sammler weltweit.",
            }),
        ).toBeInTheDocument();
        for (const name of [
            "Sammler suchen bereits. Lassen Sie sich finden.",
            "In drei Schritten online.",
            "Ihren Bestand anbinden.",
            "Wir bringen die Sammler. Ihr Shop bleibt Ihrer.",
            "Was Partner am häufigsten fragen.",
            "Bereit, Sammler weltweit zu erreichen?",
        ]) {
            expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
        }
    });

    it("drops the unconfirmed partner statistics", () => {
        expect(screen.queryByText("Was unsere Partner erleben")).not.toBeInTheDocument();
        expect(screen.queryByText(/XX/)).not.toBeInTheDocument();
    });

    it("lists the partner terms under the hero", () => {
        expect(screen.getByText("Provision auf Verkäufe").closest("dl")).toHaveAccessibleName(
            "Partnerbedingungen",
        );
        expect(screen.getByText("Ohne Frist aussteigen")).toBeInTheDocument();
    });

    it("sends the hero calls to action to the application band and the steps", () => {
        expect(screen.getByRole("link", { name: "Partner werden" })).toHaveAttribute(
            "href",
            "#apply",
        );
        expect(screen.getByRole("link", { name: "So funktioniert es" })).toHaveAttribute(
            "href",
            "#how-easy",
        );
    });

    it("links the final application CTA to the partner dashboard", () => {
        expect(screen.getByRole("link", { name: "Jetzt Partner werden" })).toHaveAttribute(
            "href",
            "/de/partners/applications",
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
        expect(customApi).toHaveAttribute("href", "/de/partner-program/custom-integration");
        expect(customApi).not.toHaveAttribute("target");
        expect(customApi).toHaveTextContent('"sourceListingId": "demo-violin-001"');
    });

    it("lists what stays with the shop", () => {
        expect(screen.getByText("Kundenbeziehung")).toBeInTheDocument();
        expect(screen.getByText("100 % bei Ihnen")).toBeInTheDocument();
        expect(screen.getByText("Jederzeit beendbar")).toBeInTheDocument();
    });

    it("keeps one FAQ answer open at a time", () => {
        const first = screen.getByRole("button", { name: /Was kostet das Partner-Programm\?/ });
        const second = screen.getByRole("button", { name: /Kann ich jederzeit aussteigen\?/ });
        expect(first).toHaveAttribute("aria-expanded", "true");
        expect(second).toHaveAttribute("aria-expanded", "false");

        fireEvent.click(second);

        expect(first).toHaveAttribute("aria-expanded", "false");
        expect(second).toHaveAttribute("aria-expanded", "true");
    });
});
