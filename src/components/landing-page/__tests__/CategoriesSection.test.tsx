import CategoriesSection from "@/components/landing-page/categories-section/CategoriesSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

vi.mock("embla-carousel-autoplay", () => ({
    default: () => ({}),
}));

vi.mock("embla-carousel-react", () => ({
    default: () => [vi.fn(), null],
}));

describe("CategoriesSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<CategoriesSection />);
        });
    });

    it("renders the section title", () => {
        expect(screen.getByText("Kategorien entdecken")).toBeInTheDocument();
    });

    it("renders category cards", () => {
        expect(screen.getByText("Möbel")).toBeInTheDocument();
        expect(screen.getByText("Schmuck")).toBeInTheDocument();
        expect(screen.getByText("Gemälde & Kunst")).toBeInTheDocument();
        expect(screen.getByText("Uhren & Taschenuhren")).toBeInTheDocument();
        expect(screen.getByText("Bücher & Erstausgaben")).toBeInTheDocument();
        expect(screen.getByText("Leuchten & Lampen")).toBeInTheDocument();
        expect(screen.getByText("Münzen & Medaillen")).toBeInTheDocument();
        expect(screen.getByText("Karten & Manuskripte")).toBeInTheDocument();
    });
});
