import DiscoverSection from "@/components/landing-page/discover-section/DiscoverSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

// Mock IntersectionObserver
class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

describe("DiscoverSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<DiscoverSection />);
        });
    });

    it("renders the section title", () => {
        expect(
            screen.getByText(
                "Wir bringen Transparenz in die undurchsichtige Welt der Online-Antiquitäten",
            ),
        ).toBeInTheDocument();
    });

    it("renders the description paragraphs", () => {
        expect(
            screen.getByText(/Wir durchsuchen täglich das unübersichtliche Angebot/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Wir erfassen nicht nur aktuelle und neu aufgetauchte Antiquitäten/),
        ).toBeInTheDocument();
    });

    it("renders all highlights", () => {
        expect(
            screen.getByText("Über 500 Händler, Auktionshäuser und Marktplätze"),
        ).toBeInTheDocument();
        expect(screen.getByText("Echtzeit-Überwachung")).toBeInTheDocument();
        expect(screen.getByText("Vollständig Sprach-unabhängig")).toBeInTheDocument();
    });

    it("renders highlight descriptions", () => {
        expect(
            screen.getByText(/Wir durchsuchen kontinuierlich renommierte Antiquitätenhändler/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /Sowohl neu aufgetauchte Antiquitäten, als auch Preis- und Verfügbarkeits-Updates werden nahezu in Echtzeit erfasst/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Wir übersetzen jeden Artikel in verschiedene Sprachen/),
        ).toBeInTheDocument();
    });

    it("renders all stat labels", () => {
        expect(screen.getByText("Vernetzte Shops")).toBeInTheDocument();
        expect(screen.getByText("Einzigartige Artikel")).toBeInTheDocument();
        expect(screen.getByText("Nahezu Echtzeit-Updates")).toBeInTheDocument();
        expect(screen.getByText("Länder abgedeckt")).toBeInTheDocument();
    });
});
