import ArtworkStorySection from "@/components/landing-page/artwork-story-section/ArtworkStorySection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("ArtworkStorySection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<ArtworkStorySection />);
        });
    });

    it("renders the platform thesis intro", () => {
        expect(screen.getByText("Warum Aura Historia")).toBeInTheDocument();
        expect(
            screen.getByText("Ein globaler Antiquitätenmarkt, endlich in Sicht"),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Gute Objekte liegen selten in einem einzigen Auktionsfeed/),
        ).toBeInTheDocument();
    });

    it("renders the connoisseurship story", () => {
        expect(screen.getByText("Kennerblick, erweitert")).toBeInTheDocument();
        expect(screen.getByText("Mehr sehen als den Angebotstitel")).toBeInTheDocument();
        expect(
            screen.getByText(/Holbeins Ambassadors ist ein Bild über Wissen/),
        ).toBeInTheDocument();
    });

    it("renders the global inventory story", () => {
        expect(screen.getByText("Globales Inventar")).toBeInTheDocument();
        expect(screen.getByText("Die Wunderkammer ist heute verteilt")).toBeInTheDocument();
        expect(screen.getByText(/The Paston Treasure zeigt Luxusobjekte/)).toBeInTheDocument();
    });

    it("renders artwork images with descriptive text", () => {
        expect(screen.getByAltText(/Hans Holbeins Gemälde The Ambassadors/)).toBeInTheDocument();
        expect(screen.getByAltText(/The Paston Treasure/)).toBeInTheDocument();
        expect(
            screen.getByText("Hans Holbein der Jüngere, The Ambassadors, 1533"),
        ).toBeInTheDocument();
        expect(screen.getByText("The Paston Treasure, um 1663")).toBeInTheDocument();
    });
});
