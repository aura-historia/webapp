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
        expect(screen.getByText("Suche jenseits der üblichen Marktplätze")).toBeInTheDocument();
    });

    it("renders the main heading", () => {
        expect(
            screen.getByText(
                "Aura Historia durchsucht Antiquitätenhändler, Auktionshäuser und Marktplätze weltweit – und hilft Ihnen, Stücke zu entdecken, die andere nie sehen.",
            ),
        ).toBeInTheDocument();
    });

    it("renders the subtitle", () => {
        expect(
            screen.getByText(/Aura Historia durchsucht Antiquitätenhändler/),
        ).toBeInTheDocument();
    });

    it("renders the search bar", () => {
        expect(screen.getByLabelText("Suche")).toBeInTheDocument();
    });

    it("renders all trust badges", () => {
        expect(screen.getByText("Für ernsthafte Sammler und Händler")).toBeInTheDocument();
        expect(screen.getByText("Von Antiquitätensammlern")).toBeInTheDocument();
        expect(screen.getByText("Nahezu Echtzeit")).toBeInTheDocument();
    });
});
