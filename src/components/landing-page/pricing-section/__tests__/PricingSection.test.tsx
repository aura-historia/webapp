import PricingSection from "@/components/landing-page/pricing-section/PricingSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("PricingSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<PricingSection />);
        });
    });

    it("renders the section heading", () => {
        expect(screen.getByText("Wählen Sie Ihren Plan")).toBeInTheDocument();
    });

    it("renders the section subtitle", () => {
        expect(
            screen.getByText(
                "Von Gelegenheitssammlern bis zu professionellen Händlern – wir haben den richtigen Plan für Sie.",
            ),
        ).toBeInTheDocument();
    });

    it("renders all three tier names", () => {
        expect(screen.getByText("Kostenlos")).toBeInTheDocument();
        expect(screen.getByText("Pro")).toBeInTheDocument();
        expect(screen.getByText("Ultimate")).toBeInTheDocument();
    });

    it("renders all tier descriptions", () => {
        expect(
            screen.getByText("Perfekt für den Einstieg in die Welt der Antiquitäten."),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Für engagierte Sammler, die mehr entdecken möchten."),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Für Profis, die das volle Potenzial nutzen wollen."),
        ).toBeInTheDocument();
    });

    it("renders pricing placeholder for each tier", () => {
        const comingSoonElements = screen.getAllByText("In Kürze");
        expect(comingSoonElements).toHaveLength(3);
    });

    it("renders the most popular badge on the Pro tier", () => {
        expect(screen.getByText("Am beliebtesten")).toBeInTheDocument();
    });

    it("renders free tier features", () => {
        expect(screen.getByText("20 Artikel auf der Merkliste")).toBeInTheDocument();
        expect(screen.getByText("1 Suchauftrag")).toBeInTheDocument();
        expect(screen.getByText("10 Suchauftrag-Treffer pro Monat")).toBeInTheDocument();
        expect(screen.getByText("Einfache Suchaufträge")).toBeInTheDocument();
        expect(screen.getByText("Benachrichtigung innerhalb weniger Stunden")).toBeInTheDocument();
        expect(screen.getByText("Klassische Textsuche")).toBeInTheDocument();
    });

    it("renders pro tier features", () => {
        expect(screen.getByText("100 Artikel auf der Merkliste")).toBeInTheDocument();
        expect(screen.getByText("5 Suchaufträge")).toBeInTheDocument();
        expect(screen.getByText("Erweiterte Suchaufträge")).toBeInTheDocument();
    });

    it("renders ultimate tier features", () => {
        expect(screen.getByText("Unbegrenzte Merkliste")).toBeInTheDocument();
        expect(screen.getByText("Unbegrenzte Suchaufträge")).toBeInTheDocument();
        expect(screen.getByText("KI-Suchagent")).toBeInTheDocument();
    });

    it("renders hybrid search descriptions", () => {
        expect(
            screen.getByText("Hybridsuche – findet Treffer nach Stichwort und Bedeutung"),
        ).toBeInTheDocument();
        expect(screen.getByText("Hybridsuche (Textbasiert + Semantisch)")).toBeInTheDocument();
    });

    it("renders check icons for all features", () => {
        // Free: 6, Pro: 6, Ultimate: 7 = 19 total features
        const checkIcons = document.querySelectorAll("li");
        expect(checkIcons.length).toBe(19);
    });
});
