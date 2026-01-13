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
                "Die führende Plattform für alle, die nach ganz bestimmten Antiquitäten suchen",
            ),
        ).toBeInTheDocument();
    });

    it("renders the main heading", () => {
        expect(
            screen.getByText("Hören Sie auf, Zeit bei der Suche nach Antiquitäten zu verschwenden"),
        ).toBeInTheDocument();
        expect(screen.getByText("Der zentrale Ort, um Antiquitäten zu finden")).toBeInTheDocument();
    });

    it("renders the subtitle", () => {
        expect(
            screen.getByText(/Aura Historia durchsucht das gesamte Web nach Antiquitäten/),
        ).toBeInTheDocument();
    });

    it("renders the search bar", () => {
        expect(screen.getByPlaceholderText("Ich suche nach...")).toBeInTheDocument();
    });

    it("renders all trust badges", () => {
        expect(screen.getByText("Für ernsthafte Sammler und Händler")).toBeInTheDocument();
        expect(screen.getByText("Von Antiquitätensammlern")).toBeInTheDocument();
        expect(screen.getByText("Nahezu Echtzeit")).toBeInTheDocument();
    });
});
