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
        expect(screen.getByText("Häufige Fragen")).toBeInTheDocument();
    });

    it("renders the section subtitle", () => {
        expect(
            screen.getByText(
                "Kurz und präzise: wie Aura Historia den globalen Antiquitätenmarkt zugänglicher macht.",
            ),
        ).toBeInTheDocument();
    });

    it("renders all FAQ questions", () => {
        expect(screen.getByText("Was ist Aura Historia?")).toBeInTheDocument();
        expect(screen.getByText("Kann ich direkt über Aura Historia kaufen?")).toBeInTheDocument();
        expect(screen.getByText("Was kann ich beobachten lassen?")).toBeInTheDocument();
        expect(
            screen.getByText("Funktioniert die Plattform auch über Sprachgrenzen hinweg?"),
        ).toBeInTheDocument();
        expect(screen.getByText("Wie aktuell sind die Angebote?")).toBeInTheDocument();
        expect(screen.getByText("Welche Quellen werden berücksichtigt?")).toBeInTheDocument();
        expect(
            screen.getByText("Kann ich einen Händler oder eine Quelle vorschlagen?"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Wie unterscheidet sich Aura Historia von Auktionsaggregatoren?"),
        ).toBeInTheDocument();
        expect(screen.getByText("Ist Aura Historia eine Preisdatenbank?")).toBeInTheDocument();
    });

    it("expands accordion item when clicked", async () => {
        const user = userEvent.setup();
        const firstQuestion = screen.getByText("Was ist Aura Historia?");

        await user.click(firstQuestion);

        expect(screen.getByText(/Aura Historia ist eine globale Plattform/)).toBeInTheDocument();
    });

    it("collapses accordion item when clicked again", async () => {
        const user = userEvent.setup();
        const firstQuestion = screen.getByText("Was ist Aura Historia?");

        // Open
        await user.click(firstQuestion);
        expect(firstQuestion).toHaveAttribute("data-state", "open");

        // Close
        await user.click(firstQuestion);
        expect(firstQuestion).toHaveAttribute("data-state", "closed");
    });
});
