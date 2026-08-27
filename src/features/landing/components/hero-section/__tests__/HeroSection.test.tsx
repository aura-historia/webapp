import HeroSection from "@/features/landing/components/hero-section/HeroSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("HeroSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<HeroSection />);
        });
    });

    it("renders the main heading", () => {
        expect(screen.getByText(/Seltene Antiquit/)).toBeInTheDocument();
        expect(screen.getByText(/weltweit entdecken/)).toBeInTheDocument();
    });

    it("renders the subtitle", () => {
        expect(screen.getByText(/globalen Antiquit/)).toBeInTheDocument();
    });

    it("renders the search bar", () => {
        expect(screen.getByLabelText("Suche")).toBeInTheDocument();
    });
});
