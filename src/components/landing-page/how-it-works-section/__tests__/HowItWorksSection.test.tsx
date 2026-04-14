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
        expect(screen.getByText("So einfach funktioniert's")).toBeInTheDocument();
    });

    it("renders the section subtitle", () => {
        expect(
            screen.getByText("In nur wenigen Schritten zu Ihren Traumstücken."),
        ).toBeInTheDocument();
    });

    it("renders all step numbers", () => {
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("renders all step titles", () => {
        expect(screen.getByText("Suchen")).toBeInTheDocument();
        expect(screen.getByText("Entdecken")).toBeInTheDocument();
        expect(screen.getByText("Speichern")).toBeInTheDocument();
        expect(screen.getByText("Benachrichtigt werden")).toBeInTheDocument();
    });

    it("renders all step descriptions", () => {
        expect(screen.getByText(/Geben Sie ein, wonach Sie suchen/)).toBeInTheDocument();
        expect(
            screen.getByText(/Durchstöbern Sie Ergebnisse von tausenden Händlern/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /Speichern Sie interessante Artikel auf Ihrer Merkliste oder legen Sie Ihre Suchkriterien als Alert an/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /Erhalten Sie eine E-Mail, sobald sich ein Artikel auf Ihrer Merkliste ändert oder ein neuer Treffer zu Ihren Kriterien passt/,
            ),
        ).toBeInTheDocument();
    });
});
