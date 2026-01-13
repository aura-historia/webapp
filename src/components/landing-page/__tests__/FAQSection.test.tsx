import FAQSection from "@/components/landing-page/faq-section/FAQSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("FAQSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<FAQSection />);
        });
    });

    it("renders the section heading", () => {
        expect(screen.getByText("Häufig gestellte Fragen")).toBeInTheDocument();
    });

    it("renders the section subtitle", () => {
        expect(
            screen.getByText(
                "Hier finden Sie Antworten auf die wichtigsten Fragen rund um Aura Historia.",
            ),
        ).toBeInTheDocument();
    });

    it("renders all FAQ questions", () => {
        expect(screen.getByText("Wie funktioniert Aura Historia?")).toBeInTheDocument();
        expect(
            screen.getByText("Kann ich direkt über Aura Historia Antiquitäten kaufen?"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Wie funktionieren die Preis- und Verfügbarkeits-Benachrichtigungen?"),
        ).toBeInTheDocument();
        expect(screen.getByText("Wie oft werden die Daten aktualisiert?")).toBeInTheDocument();
        expect(
            screen.getByText("Welche Antiquitäten-Onlineshops sind auf Aura Historia vertreten?"),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /Ich kenne einen Onlinehändler, ein Auktionshaus oder einen Marktplatz, der noch nicht auf Aura Historia vertreten ist. Können wir ihn hinzufügen?/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Wie unterscheidet sich Aura Historia von Barnebys?"),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Wie unterscheidet sich Aura Historia von Preisdatenbanken/),
        ).toBeInTheDocument();
    });

    it("expands accordion item when clicked", async () => {
        const user = userEvent.setup();
        const firstQuestion = screen.getByText("Wie funktioniert Aura Historia?");

        await user.click(firstQuestion);

        expect(
            screen.getByText(/Aura Historia durchsucht kontinuierlich die Webseiten/),
        ).toBeInTheDocument();
    });

    it("collapses accordion item when clicked again", async () => {
        const user = userEvent.setup();
        const firstQuestion = screen.getByText("Wie funktioniert Aura Historia?");

        // Open
        await user.click(firstQuestion);
        expect(firstQuestion).toHaveAttribute("data-state", "open");

        // Close
        await user.click(firstQuestion);
        expect(firstQuestion).toHaveAttribute("data-state", "closed");
    });
});
