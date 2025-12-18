import HeroSection from "@/components/landing-page/HeroSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("HeroSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<HeroSection />);
        });
    });

    it("renders the badge", () => {
        expect(
            screen.getByText("Die führende Plattform für Antiquitäten-Liebhaber"),
        ).toBeInTheDocument();
    });

    it("renders the main heading", () => {
        expect(screen.getByText("Entdecken, vergleichen, sammeln –")).toBeInTheDocument();
        expect(screen.getByText("Antiquitäten aus aller Welt")).toBeInTheDocument();
    });

    it("renders the subtitle", () => {
        expect(
            screen.getByText(/Durchsuchen Sie über 120.000 einzigartige Antiquitäten/),
        ).toBeInTheDocument();
    });

    it("renders the search bar", () => {
        expect(screen.getByPlaceholderText("Ich suche nach...")).toBeInTheDocument();
    });

    it("renders all trust badges", () => {
        expect(screen.getByText("Vollständig kostenfrei")).toBeInTheDocument();
        expect(screen.getByText("Keine Registrierung nötig")).toBeInTheDocument();
        expect(screen.getByText("Mehrmals täglich aktualisiert")).toBeInTheDocument();
    });
});
