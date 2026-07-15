import HowItWorksSection from "@/components/landing-page/how-it-works-section/HowItWorksSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("HowItWorksSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<HowItWorksSection />);
        });
    });

    it("renders the section heading", () => {
        expect(screen.getByText("Von der Idee zum besonderen Stück")).toBeInTheDocument();
    });

    it("renders the section subtitle", () => {
        expect(
            screen.getByText(
                "Aura Historia führt verstreute Angebote aus Handel, Auktionen und spezialisierten Quellen zusammen – damit vielversprechende Stücke sichtbar bleiben.",
            ),
        ).toBeInTheDocument();
    });

    it("renders all step numbers", () => {
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("renders all step titles", () => {
        expect(screen.getByText("Wunsch beschreiben")).toBeInTheDocument();
        expect(screen.getByText("Markt sichten")).toBeInTheDocument();
        expect(screen.getByText("Stücke merken")).toBeInTheDocument();
        expect(screen.getByText("Im richtigen Moment handeln")).toBeInTheDocument();
    });

    it("renders all step descriptions", () => {
        expect(screen.getByText(/Suchen Sie nach Epoche, Stil, Kategorie/)).toBeInTheDocument();
        expect(screen.getByText(/Vergleichen Sie aktuelle Angebote/)).toBeInTheDocument();
        expect(
            screen.getByText(/Legen Sie relevante Objekte auf Ihre private Merkliste/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Wir zeigen Preis- und Statusänderungen sowie neue passende Objekte/),
        ).toBeInTheDocument();
    });
});
