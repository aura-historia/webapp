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
        expect(
            screen.getByText("Jenseits der bekannten Auktionshäuser suchen"),
        ).toBeInTheDocument();
    });

    it("renders the main heading", () => {
        expect(screen.getByText(/Seltene Antiquitäten/)).toBeInTheDocument();
        expect(screen.getByText(/weltweit entdecken/)).toBeInTheDocument();
    });

    it("renders the subtitle", () => {
        expect(screen.getByText(/globalen Antiquitätenplattform/)).toBeInTheDocument();
    });

    it("renders the search bar", () => {
        expect(screen.getByLabelText("Suche")).toBeInTheDocument();
    });
});
