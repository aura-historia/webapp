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
        expect(screen.getByText("Ist Aura Historia wirklich kostenfrei?")).toBeInTheDocument();
        expect(screen.getByText("Wie funktioniert Aura Historia?")).toBeInTheDocument();
        expect(
            screen.getByText("Kann ich Artikel direkt über Aura Historia kaufen?"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Wie funktionieren die Preisbenachrichtigungen?"),
        ).toBeInTheDocument();
        expect(screen.getByText("Wie oft werden die Daten aktualisiert?")).toBeInTheDocument();
        expect(
            screen.getByText("Welche Händler sind auf Aura Historia vertreten?"),
        ).toBeInTheDocument();
    });

    it("expands accordion item when clicked", async () => {
        const user = userEvent.setup();
        const firstQuestion = screen.getByText("Ist Aura Historia wirklich kostenfrei?");

        await user.click(firstQuestion);

        expect(
            screen.getByText(/Ja, die Nutzung von Aura Historia ist vollständig kostenfrei/),
        ).toBeInTheDocument();
    });

    it("collapses accordion item when clicked again", async () => {
        const user = userEvent.setup();
        const firstQuestion = screen.getByText("Ist Aura Historia wirklich kostenfrei?");

        // Open
        await user.click(firstQuestion);
        expect(firstQuestion).toHaveAttribute("data-state", "open");

        // Close
        await user.click(firstQuestion);
        expect(firstQuestion).toHaveAttribute("data-state", "closed");
    });
});
