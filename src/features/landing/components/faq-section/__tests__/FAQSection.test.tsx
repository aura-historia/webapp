import FAQSection from "@/features/landing/components/faq-section/FAQSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("FAQSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<FAQSection />);
        });
    });

    it("renders the chapter heading and the contact address", () => {
        expect(screen.getByText("VII — Fragen")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
            "Gefragt, und beantwortet.",
        );
        expect(screen.getByRole("link", { name: "contact@aura-historia.com" })).toHaveAttribute(
            "href",
            "mailto:contact@aura-historia.com",
        );
    });

    it("renders all FAQ questions", () => {
        expect(screen.getByText("Was ist Aura Historia?")).toBeInTheDocument();
        expect(screen.getByText("Kann ich direkt über Aura Historia kaufen?")).toBeInTheDocument();
        expect(screen.getByText("Was kann Aura Historia für mich beobachten?")).toBeInTheDocument();
        expect(
            screen.getByText("Hilft Aura Historia bei fremdsprachigen Angeboten?"),
        ).toBeInTheDocument();
        expect(screen.getByText("Wie aktuell sind die Angebote?")).toBeInTheDocument();
        expect(screen.getByText("Welche Quellen fließen ein?")).toBeInTheDocument();
        expect(
            screen.getByText("Kann ich einen Händler oder eine Quelle vorschlagen?"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Worin unterscheidet sich Aura Historia von Auktionsaggregatoren?"),
        ).toBeInTheDocument();
        expect(screen.getByText("Ist Aura Historia eine Preisdatenbank?")).toBeInTheDocument();
    });

    it("opens the first answer by default", () => {
        expect(screen.getByRole("button", { name: /Was ist Aura Historia\?/ })).toHaveAttribute(
            "aria-expanded",
            "true",
        );
        expect(screen.getByText(/Aura Historia ist eine globale Plattform/)).toBeVisible();
    });

    it("keeps one answer open at a time", async () => {
        const user = userEvent.setup();
        const first = screen.getByRole("button", { name: /Was ist Aura Historia\?/ });
        const second = screen.getByRole("button", {
            name: /Kann ich direkt über Aura Historia kaufen\?/,
        });

        await user.click(second);

        expect(second).toHaveAttribute("aria-expanded", "true");
        expect(first).toHaveAttribute("aria-expanded", "false");
        expect(screen.getByText(/Aura Historia ist eine globale Plattform/)).not.toBeVisible();
    });

    it("closes an open answer when clicked again", async () => {
        const user = userEvent.setup();
        const first = screen.getByRole("button", { name: /Was ist Aura Historia\?/ });

        await user.click(first);

        expect(first).toHaveAttribute("aria-expanded", "false");
    });
});
