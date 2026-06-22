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
        expect(screen.getByText("Für Sammler, Interior-Profis und den Handel")).toBeInTheDocument();
    });

    it("renders the main heading", () => {
        expect(screen.getByText(/Seltene Stücke findet man nicht/)).toBeInTheDocument();
        expect(screen.getByText(/durch Zufall allein/)).toBeInTheDocument();
    });

    it("renders the subtitle", () => {
        expect(screen.getByText(/globalen Antiquitätenplattform/)).toBeInTheDocument();
    });

    it("renders the hero video in a muted loop", () => {
        const video = document.querySelector("video");

        expect(video).toBeInTheDocument();
        expect(video).toHaveAttribute("autoplay");
        expect(video).toHaveAttribute("loop");
        expect(video).toHaveAttribute("playsinline");
        expect(video).toHaveAttribute("preload", "metadata");
        expect(video).toHaveAttribute("aria-hidden", "true");
        expect(video).toHaveAttribute("tabindex", "-1");
        expect(video?.muted).toBe(true);
    });

    it("renders the search bar", () => {
        expect(screen.getByLabelText("Suche")).toBeInTheDocument();
    });
});
