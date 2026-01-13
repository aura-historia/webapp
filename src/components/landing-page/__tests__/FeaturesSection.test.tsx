import FeaturesSection from "@/components/landing-page/features-section/FeaturesSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("FeaturesSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<FeaturesSection />);
        });
    });

    it("renders the section heading", () => {
        expect(
            screen.getByText("Antiquitäten sind überall online - Ihre Suche sollte es nicht sein"),
        ).toBeInTheDocument();
    });

    it("renders the section subtitle", () => {
        expect(
            screen.getByText(
                "Aura Historia ist die ausgefeilteste Suchmaschine für Antiquitäten und bietet Ihnen alle Werkzeuge, um den Antiquitätenmarkt effizient zu durchsuchen.",
            ),
        ).toBeInTheDocument();
    });

    it("renders all feature cards", () => {
        expect(screen.getByText("Intelligente Suche")).toBeInTheDocument();
        expect(screen.getByText("Weltweite Abdeckung")).toBeInTheDocument();
        expect(screen.getByText("Automatische Übersetzungen")).toBeInTheDocument();
        expect(screen.getByText("Änderungshistorie")).toBeInTheDocument();
        expect(screen.getByText("Persönliche Merkliste")).toBeInTheDocument();
        expect(screen.getByText("Suchaufträge")).toBeInTheDocument();
        expect(screen.getByText("Persönlicher KI-Suchagent")).toBeInTheDocument();
    });

    it("renders feature descriptions", () => {
        expect(
            screen.getByText(
                /Durchsuchen Sie hunderttausende Artikel mit unserer leistungsstarken Suchfunktion/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Wir verbinden Sie mit renommierten Antiquitätenhändlern/),
        ).toBeInTheDocument();
    });

    it("renders preview badges for preview features", () => {
        const previewBadges = screen.getAllByText("Bald verfügbar");
        expect(previewBadges).toHaveLength(2);
    });
});
