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
        expect(screen.getByText("Vom ersten Gedanken zum gefundenen Objekt")).toBeInTheDocument();
    });

    it("renders the section subtitle", () => {
        expect(
            screen.getByText(
                "Aura Historia bündelt verstreute Angebote aus Handel, Auktionen und spezialisierten Quellen – damit gute Funde nicht in einzelnen Silos verschwinden.",
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
        expect(screen.getByText("Objekt beschreiben")).toBeInTheDocument();
        expect(screen.getByText("Marktbild prüfen")).toBeInTheDocument();
        expect(screen.getByText("Im Blick behalten")).toBeInTheDocument();
        expect(screen.getByText("Rechtzeitig handeln")).toBeInTheDocument();
    });

    it("renders all step descriptions", () => {
        expect(screen.getByText(/Suchen Sie nach Epoche, Stil, Kategorie/)).toBeInTheDocument();
        expect(screen.getByText(/Vergleichen Sie aktuelle Angebote/)).toBeInTheDocument();
        expect(
            screen.getByText(/Legen Sie relevante Objekte auf Ihre private Merkliste/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Wir melden Preis- und Statusänderungen sowie neue passende Objekte/),
        ).toBeInTheDocument();
    });
});
