import HeroSection from "@/components/landing-page/hero-section/HeroSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("HeroSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<HeroSection />);
        });
    });

    it("renders the badge", () => {
        expect(screen.getByText("Für Sammler, Einrichter und den Handel")).toBeInTheDocument();
    });

    it("renders the main heading", () => {
        expect(screen.getByText(/Seltene Objekte sollten nicht/)).toBeInTheDocument();
        expect(screen.getByText(/vom Zufall abhängen/)).toBeInTheDocument();
    });

    it("renders the subtitle", () => {
        expect(screen.getByText(/globalen Antiquitäten-Plattform/)).toBeInTheDocument();
    });

    it("renders the search bar", () => {
        expect(screen.getByLabelText("Suche")).toBeInTheDocument();
    });
});
