import ArtworkStorySection from "@/features/landing/components/artwork-story-section/ArtworkStorySection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("ArtworkStorySection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<ArtworkStorySection />);
        });
    });

    it("renders the platform thesis intro", () => {
        expect(
            screen.getByText("Der weltweite Antiquitätenmarkt auf einen Blick"),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Besondere Stücke liegen selten an einer einzigen Stelle/),
        ).toBeInTheDocument();
    });

    it("renders the connoisseurship story", () => {
        expect(screen.getByText("Kennerblick, digital erweitert")).toBeInTheDocument();
        expect(screen.getByText("Hinweise erkennen, die anderen fehlen")).toBeInTheDocument();
        expect(screen.getByText(/Holbeins Ambassadors erzählt von Wissen/)).toBeInTheDocument();
    });

    it("renders the global inventory story", () => {
        expect(screen.getByText("Weltweites Inventar")).toBeInTheDocument();
        expect(screen.getByText("Die Wunderkammer ist heute verstreut")).toBeInTheDocument();
        expect(screen.getByText(/The Paston Treasure versammelt Luxusobjekte/)).toBeInTheDocument();
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
