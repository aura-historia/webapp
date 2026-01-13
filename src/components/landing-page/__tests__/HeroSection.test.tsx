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
            screen.getByText(
                "Die führende Plattform für die Suche nach hochspezifischen Antiquitäten",
            ),
        ).toBeInTheDocument();
    });

    it("renders the main heading", () => {
        expect(
            screen.getByText(
                "Stoppen Sie die Zeitverschwendung bei der Suche nach Antiquitäten, die Sie nicht finden können",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Ein zentraler Ort, um die Antiquitäten zu finden, nach denen Sie suchen",
            ),
        ).toBeInTheDocument();
    });

    it("renders the subtitle", () => {
        expect(
            screen.getByText(/Aura Historia überwacht das gesamte Web nach Antiquitäten/),
        ).toBeInTheDocument();
    });

    it("renders the search bar", () => {
        expect(screen.getByPlaceholderText("Ich suche nach...")).toBeInTheDocument();
    });

    it("renders all trust badges", () => {
        expect(screen.getByText("Für ernsthafte Sammler und Händler")).toBeInTheDocument();
        expect(
            screen.getByText("Entwickelt unter der Anleitung erfahrener Antiquitätensammler"),
        ).toBeInTheDocument();
        expect(screen.getByText("Echtzeit")).toBeInTheDocument();
    });
});
