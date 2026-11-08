import { act, screen } from "@testing-library/react";
import HeroSection from "@/features/landing/components/hero-section/HeroSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

vi.mock("@/features/landing/hooks/usePublicOverview.ts", () => ({
    usePublicOverview: () => ({ data: undefined, isPending: true }),
}));

describe("HeroSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<HeroSection />, { initialEntries: ["/"] });
        });
    });

    it("renders the headline with its italic closing phrase on the ink ground", () => {
        const heading = screen.getByRole("heading", { level: 1 });

        expect(heading).toHaveTextContent(
            "Der weltweite Kunst- und Antiquitätenmarkt, in einer einzigen Suche.",
        );
        expect(heading.querySelector("em")).toHaveTextContent("in einer einzigen Suche.");
        expect(heading.closest("section")).toHaveAttribute("data-theme", "dark");
    });

    it("renders the lead", () => {
        expect(
            screen.getByText(/Aura Historia erfasst Händler, Auktionshäuser/),
        ).toBeInTheDocument();
    });

    it("renders the global search on a parchment panel", () => {
        const search = screen.getByRole("search");

        expect(search).toHaveAttribute("data-theme", "light");
        expect(screen.getByLabelText("Den weltweiten Markt durchsuchen")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Markt durchsuchen" })).toBeInTheDocument();
    });
});
