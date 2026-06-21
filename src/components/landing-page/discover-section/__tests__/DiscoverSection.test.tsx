import DiscoverSection from "@/components/landing-page/discover-section/DiscoverSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("DiscoverSection", () => {
    describe("static content", () => {
        beforeEach(async () => {
            await act(async () => {
                renderWithRouter(<DiscoverSection />);
            });
        });

        it("renders the section title", () => {
            expect(
                screen.getByText("Der Antiquitätenmarkt ist global. Der Überblick ist es selten."),
            ).toBeInTheDocument();
        });

        it("renders the description paragraphs", () => {
            expect(screen.getByText(/Antiquitäten sind längst online/)).toBeInTheDocument();
            expect(
                screen.getByText(/Für Sammler, Interior-Profis und den Handel heißt das/),
            ).toBeInTheDocument();
        });

        it("renders all highlights with fallback source count", () => {
            expect(screen.getByText("Hunderte indexierte Quellen")).toBeInTheDocument();
            expect(screen.getByText("Marktüberblick abseits der großen Namen")).toBeInTheDocument();
            expect(screen.getByText("Recherche über Sprachgrenzen hinweg")).toBeInTheDocument();
        });

        it("renders highlight descriptions", () => {
            expect(screen.getByText(/Spezialisierte Händler, Auktionshäuser/)).toBeInTheDocument();
            expect(screen.getByText(/Neue Stücke, Preisbewegungen/)).toBeInTheDocument();
            expect(
                screen.getByText(/die Begriffe internationaler Anbieter für Sie ein/),
            ).toBeInTheDocument();
        });

        it("renders the curated discover artwork only", () => {
            expect(screen.getByAltText(/Antoine Watteaus The Shop Sign/)).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Antoine Watteau, The Shop Sign of the Art Dealer Gersaint, 1720–1721",
                ),
            ).toBeInTheDocument();
            expect(screen.queryByAltText(/David Teniers/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Archduke Leopold Wilhelm/)).not.toBeInTheDocument();
        });
    });

    describe("live source count", () => {
        it("shows live shop count in the first highlight title", async () => {
            await act(async () => {
                renderWithRouter(<DiscoverSection shopCount={1234} />);
            });

            expect(screen.getByText("Über 1234 indexierte Quellen")).toBeInTheDocument();
            expect(screen.queryByText("Hunderte indexierte Quellen")).not.toBeInTheDocument();
        });
    });
});
