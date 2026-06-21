import FeaturesSection from "@/components/landing-page/features-section/FeaturesSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("FeaturesSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<FeaturesSection />);
        });
    });

    it("renders the section heading", () => {
        expect(
            screen.getByText("Eine Plattform für Menschen, die genauer hinsehen"),
        ).toBeInTheDocument();
    });

    it("renders the section subtitle and note", () => {
        expect(
            screen.getByText(/Entwickelt für Sammler, Interior-Profis und den Handel/),
        ).toBeInTheDocument();
        expect(screen.getByText(/keine reine Auktionsseite/)).toBeInTheDocument();
    });

    it("renders the revised feature rows", () => {
        expect(screen.getByText("Ein Markt jenseits einzelner Marktplätze")).toBeInTheDocument();
        expect(screen.getByText("Mehr als Auktionen")).toBeInTheDocument();
        expect(
            screen.getByText("Finden, ohne die Sprache des Anbieters zu sprechen"),
        ).toBeInTheDocument();
        expect(screen.getByText("Private Merkliste")).toBeInTheDocument();
        expect(screen.getByText("Suchalarme")).toBeInTheDocument();
        expect(screen.getByText("Objektverlauf")).toBeInTheDocument();
        expect(screen.getByText("KI-Suchagent")).toBeInTheDocument();
    });

    it("removes the collector/dealer roadmap row and old price-history framing", () => {
        expect(screen.queryByText("Gebaut mit Sammlern und Händlern")).not.toBeInTheDocument();
        expect(screen.queryByText("Preis- und Statushistorie")).not.toBeInTheDocument();
    });

    it("renders inline market proof points", () => {
        expect(screen.getByText("$59,6 Mrd.")).toBeInTheDocument();
        expect(screen.getByText(/über 41,5 Mio. Transaktionen/)).toBeInTheDocument();
        expect(screen.getByText("$34,8 / $20,7 Mrd.")).toBeInTheDocument();
        expect(screen.getByText(/öffentlichen Auktionsumsätzen 2025/)).toBeInTheDocument();
        expect(screen.getByText("13.362 + 81.256")).toBeInTheDocument();
        expect(screen.getByText(/verteilt über lokale Märkte und Sprachen/)).toBeInTheDocument();
    });

    it("renders linked source citations", () => {
        const artBaselLinks = screen.getAllByRole("link", {
            name: "Art Basel / UBS",
        });
        expect(artBaselLinks).toHaveLength(2);
        for (const link of artBaselLinks) {
            expect(link).toHaveAttribute(
                "href",
                "https://www.ubs.com/global/en/our-firm/art/art-market-research.html",
            );
        }
        expect(screen.getByRole("link", { name: "IBISWorld US" })).toHaveAttribute(
            "href",
            "https://www.ibisworld.com/united-states/industry/antique-stores/6467/",
        );
        expect(screen.getByRole("link", { name: "IBISWorld Europe" })).toHaveAttribute(
            "href",
            "https://www.ibisworld.com/europe/industry/second-hand-goods-retailing/200596/",
        );
    });

    it("renders feature GIF placeholders", () => {
        expect(screen.getByText("Merkliste mit Änderungsbenachrichtigungen")).toBeInTheDocument();
        expect(screen.getByText("Ablauf für neue Suchtreffer")).toBeInTheDocument();
        expect(screen.getByText("Ereignisverlauf eines Angebots")).toBeInTheDocument();
        expect(screen.getByText("Sammlerbriefing in natürlicher Sprache")).toBeInTheDocument();
    });
});
