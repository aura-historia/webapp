import PartnerProgramPage from "@/features/partner/partner-program/pages/PartnerProgramPage.tsx";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, fireEvent, screen, within } from "@testing-library/react";

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
                name: "Verkaufen Sie Kunst und Antiquitäten online? Erreichen Sie Sammler weltweit.",
            }),
        ).toBeInTheDocument();
        for (const name of [
            "Sammler suchen bereits. Lassen Sie sich finden.",
            "Auffindbar bleiben, wenn sich die Suche wandelt.",
            "In drei Schritten online.",
            "Ihren Bestand anbinden.",
            "Wir bringen die Sammler. Ihr Shop bleibt Ihrer.",
            "Was Partner am häufigsten fragen.",
            "Bereit, Sammler weltweit zu erreichen?",
        ]) {
            expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
        }
    });

    it("numbers the chapters with the discovery chapter second", () => {
        for (const eyebrow of [
            "I — Warum mitmachen",
            "II — Die Suche verändert sich",
            "III — So funktioniert es",
            "IV — Anbinden",
            "V — Was bei Ihnen bleibt",
            "VI — Fragen",
        ]) {
            expect(screen.getByText(eyebrow)).toBeInTheDocument();
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
        const becomePartner = screen.getAllByRole("link", { name: "Partner werden" });
        expect(becomePartner).toHaveLength(2);
        for (const link of becomePartner) {
            expect(link).toHaveAttribute("href", "#apply");
        }
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
        const woocommerce = screen.getByText("Partner Connect für WooCommerce®").closest("a");
        expect(woocommerce).toHaveAttribute("href", WORDPRESS_PLUGIN_DIRECTORY_URL);
        expect(woocommerce).toHaveAttribute("target", "_blank");

        const shopify = screen.getByText("Partner Connect für Shopify").closest("a");
        expect(shopify).toHaveAttribute("href", SHOPIFY_APP_STORE_URL);
        expect(shopify).toHaveAttribute("target", "_blank");

        const customApi = screen.getByText("Eigene API-Integration").closest("a");
        expect(customApi).toHaveAttribute("href", "/de/partner-program/custom-integration");
        expect(customApi).not.toHaveAttribute("target");
        expect(customApi).toHaveTextContent('"sourceListingId": "demo-violin-001"');
    });

    it("puts Shopify above WooCommerce with the same badge and no ranking", () => {
        const shopify = screen.getByText("Partner Connect für Shopify").closest("a") as HTMLElement;
        const woocommerce = screen
            .getByText("Partner Connect für WooCommerce®")
            .closest("a") as HTMLElement;
        expect(
            shopify.compareDocumentPosition(woocommerce) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();

        expect(within(shopify).getByText("Ohne Code")).toBeInTheDocument();
        expect(within(woocommerce).getByText("Ohne Code")).toBeInTheDocument();
        expect(screen.queryByText("Empfohlen")).not.toBeInTheDocument();
        expect(screen.queryByText("Beliebt")).not.toBeInTheDocument();
        expect(
            screen.getByText(/WooCommerce® und die zugehörigen Designs sind Marken von Automattic/),
        ).toBeInTheDocument();
    });

    it("cites each discovery figure with a link to its primary source", () => {
        const figures = within(
            screen.getByText("Von der Suche zu Agenten · Der Wandel in Zahlen").parentElement
                ?.parentElement as HTMLElement,
        );
        for (const value of ["8 %", "60 %", "42 %", "54 %", "67 %"]) {
            expect(figures.getByText(value)).toBeInTheDocument();
        }
        const bain = figures.getByRole("link", { name: /Bain & Comité Colbert · Juni 2026/ });
        expect(bain).toHaveAttribute(
            "href",
            "https://www.bain.com/insights/winning-over-the-customer-in-the-age-of-ai-a-new-horizon-for-luxury/",
        );
        expect(bain).toHaveAttribute("target", "_blank");
        expect(
            screen.getByRole("list", { name: "So wurden diese Zahlen erhoben" }),
        ).toHaveTextContent("Umfrage unter 5.119 Erwachsenen in den USA");
    });

    it("marks what works today as available and the assistant apps as in development", () => {
        expect(screen.getAllByText("Jetzt verfügbar")).toHaveLength(3);
        expect(screen.getAllByText("In Entwicklung")).toHaveLength(5);
        for (const name of ["ChatGPT", "Claude", "Google Suche & Gemini", "Grok", "Muse"]) {
            expect(screen.getByText(name)).toBeInTheDocument();
        }
        expect(
            screen.getByText(/mit OpenAI, Anthropic, Google, xAI und Meta weder verbunden/),
        ).toBeInTheDocument();
    });

    it("reveals the technical detail behind the AI route on request", () => {
        const toggle = screen.getByRole("button", { name: /Wie funktioniert das\?/ });
        const detail = screen.getByText(/Wir betreiben einen öffentlichen MCP-Server/);
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(detail).not.toBeVisible();

        fireEvent.click(toggle);

        expect(toggle).toHaveAttribute("aria-expanded", "true");
        expect(detail).toBeVisible();
    });

    it("closes the discovery chapter with the application and integration anchors", () => {
        expect(screen.getByRole("link", { name: "So funktioniert die Anbindung" })).toHaveAttribute(
            "href",
            "#integrations",
        );
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
