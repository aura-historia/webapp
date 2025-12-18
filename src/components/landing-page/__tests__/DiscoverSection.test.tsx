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
        expect(screen.getByText("Ihr Fenster zur Welt der Antiquitäten")).toBeInTheDocument();
    });

    it("renders the description paragraphs", () => {
        expect(
            screen.getByText(/Aura Historia durchforstet täglich das unübersichtliche Angebot/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Unsere intelligente Plattform erfasst nicht nur aktuelle Angebote/),
        ).toBeInTheDocument();
    });

    it("renders all highlights", () => {
        expect(screen.getByText("Über 500 Händler vernetzt")).toBeInTheDocument();
        expect(screen.getByText("Echtzeit-Überwachung")).toBeInTheDocument();
        expect(screen.getByText("Transparente Preisentwicklung")).toBeInTheDocument();
    });

    it("renders highlight descriptions", () => {
        expect(
            screen.getByText(/Wir durchsuchen kontinuierlich renommierte Antiquitätenhändler/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Preisänderungen und Verfügbarkeit werden automatisch erfasst/),
        ).toBeInTheDocument();
        expect(screen.getByText(/Verfolgen Sie die komplette Preishistorie/)).toBeInTheDocument();
    });

    it("renders all stat labels", () => {
        expect(screen.getByText("Vernetzte Händler")).toBeInTheDocument();
        expect(screen.getByText("Einzigartige Artikel")).toBeInTheDocument();
        expect(screen.getByText("Automatische Updates")).toBeInTheDocument();
        expect(screen.getByText("Länder abgedeckt")).toBeInTheDocument();
    });
});
