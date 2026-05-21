import PartnersPage from "@/components/partners/PartnersPage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("PartnersPage", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<PartnersPage />);
        });
    });

    it("renders all partner page section headings", () => {
        expect(screen.getByText("Warum Partner werden?")).toBeInTheDocument();
        expect(screen.getByText("Was unsere Partner erleben")).toBeInTheDocument();
        expect(screen.getByText("So einfach verbinden Sie Ihren Shop")).toBeInTheDocument();
        expect(screen.getByText("In drei Schritten online")).toBeInTheDocument();
        expect(screen.getByText("Häufige Fragen zum Partner-Programm")).toBeInTheDocument();
    });

    it("renders the primary apply CTA pointing to /partners/apply", () => {
        const ctas = screen.getAllByRole("link", { name: /Partner werden|Jetzt Partner werden/ });
        // Hero + final CTA both link to /partners/apply.
        expect(ctas.length).toBeGreaterThanOrEqual(2);
        for (const cta of ctas) {
            expect(cta).toHaveAttribute("href", "/partners/apply");
        }
    });

    it("renders integration cards linking to dummy integration paths", () => {
        const woocommerce = screen.getByText("WordPress · WooCommerce").closest("a");
        expect(woocommerce).toHaveAttribute("href", "/partners/woocommerce");

        const shopify = screen.getByText("Shopify-App").closest("a");
        expect(shopify).toHaveAttribute("href", "/partners/shopify");

        const customApi = screen.getByText("Eigene Integration · API-Key").closest("a");
        expect(customApi).toHaveAttribute("href", "/partners/custom-api");
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
