import TestimonialsSection from "@/components/landing-page/testimonials-section/TestimonialsSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("TestimonialsSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<TestimonialsSection />);
        });
    });

    it("renders the section heading", () => {
        expect(screen.getByText("Das sagen unsere Nutzer")).toBeInTheDocument();
    });

    it("renders the section subtitle", () => {
        expect(
            screen.getByText(
                "Erfahren Sie, wie wir Sammlern dabei helfen, ihre Leidenschaft zu leben.",
            ),
        ).toBeInTheDocument();
    });

    it("renders all testimonial names", () => {
        expect(screen.getByText("Margarete W.")).toBeInTheDocument();
        expect(screen.getByText("Heinrich K.")).toBeInTheDocument();
        expect(screen.getByText("Elisabeth M.")).toBeInTheDocument();
    });

    it("renders all testimonial roles", () => {
        expect(screen.getByText("Sammelt Jugendstil-Möbel")).toBeInTheDocument();
        expect(screen.getByText("Antiquitätenhändler")).toBeInTheDocument();
        expect(screen.getByText("Hobby-Sammlerin seit 20 Jahren")).toBeInTheDocument();
    });

    it("renders all testimonial quotes", () => {
        expect(
            screen.getByText(
                /Endlich eine Plattform, die mir die Suche nach seltenen Stücken erleichtert/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /Als Händler nutze ich Aura Historia, um den Markt im Blick zu behalten/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Ich bin begeistert von der Übersichtlichkeit/),
        ).toBeInTheDocument();
    });

    it("renders testimonial images where available", () => {
        // Two testimonials have images (with alt=""), third shows fallback initial
        const images = document.querySelectorAll("img");
        expect(images.length).toBe(2);
    });

    it("renders fallback initial for testimonial without image", () => {
        // Elisabeth M. has no image, should show "E" as fallback
        expect(screen.getByText("E")).toBeInTheDocument();
    });
});
