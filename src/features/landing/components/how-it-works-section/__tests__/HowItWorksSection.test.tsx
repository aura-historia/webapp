import HowItWorksSection from "@/features/landing/components/how-it-works-section/HowItWorksSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("HowItWorksSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<HowItWorksSection />);
        });
    });

    it("renders the chapter heading", () => {
        expect(screen.getByText("IV — So funktioniert's")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
            "Von der Neugier zum wohlüberlegten Erwerb.",
        );
    });

    it("numbers the steps with Roman numerals in order", () => {
        const steps = screen.getAllByRole("listitem");

        expect(steps).toHaveLength(4);
        expect(steps.map((step) => step.firstElementChild?.textContent)).toEqual([
            "I",
            "II",
            "III",
            "IV",
        ]);
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
