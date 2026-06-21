import ArtworkStorySection from "@/components/landing-page/artwork-story-section/ArtworkStorySection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("ArtworkStorySection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<ArtworkStorySection />);
        });
    });

    it("renders the editorial section intro", () => {
        expect(screen.getByText("Kuratierte Perspektiven")).toBeInTheDocument();
        expect(
            screen.getByText("Objekte mit Geschichte verdienen mehr als eine Trefferliste"),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Händlerkontext, Kategoriesprache, Verfügbarkeit und Timing/),
        ).toBeInTheDocument();
    });

    it("renders the connoisseurship story", () => {
        expect(screen.getByText("Kennerblick & Kontext")).toBeInTheDocument();
        expect(screen.getByText("Jedes Objekt braucht Kontext")).toBeInTheDocument();
        expect(
            screen.getByText(/Händlerkontext, Kategoriesprache, vergleichbare Angebote/),
        ).toBeInTheDocument();
    });

    it("renders the global collecting story", () => {
        expect(screen.getByText("Globales Sammeln")).toBeInTheDocument();
        expect(
            screen.getByText("Ein Kuriositätenkabinett, laufend neu sortiert"),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Von Silber und Keramik bis zu wissenschaftlichen Instrumenten/),
        ).toBeInTheDocument();
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
