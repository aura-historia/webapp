import CategoriesSection from "@/components/landing-page/categories-section/CategoriesSection.tsx";
import { CATEGORY_CARDS } from "@/components/landing-page/categories-section/CategoriesSection.data.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";

describe("CategoriesSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<CategoriesSection />);
        });
    });

    it("renders the section heading", () => {
        expect(screen.getByText("Nach Kategorie entdecken")).toBeInTheDocument();
    });

    it("renders all category cards", () => {
        expect(screen.getAllByText("Möbel")).toHaveLength(2); // duplicated for infinite scroll
        expect(screen.getAllByText("Gemälde & Kunst")).toHaveLength(2);
        expect(screen.getAllByText("Porzellan & Keramik")).toHaveLength(2);
        expect(screen.getAllByText("Silber & Metallarbeiten")).toHaveLength(2);
        expect(screen.getAllByText("Schmuck & Uhren")).toHaveLength(2);
        expect(screen.getAllByText("Bücher & Manuskripte")).toHaveLength(2);
    });

    it("renders the correct number of category items", () => {
        const expectedCount = CATEGORY_CARDS.length * 2; // duplicated for seamless scroll
        const categoryElements = screen.getAllByText(
            /Möbel|Gemälde|Porzellan|Silber|Schmuck|Bücher|Uhren|Karten|Skulpturen|Beleuchtung/,
        );
        expect(categoryElements.length).toBe(expectedCount);
    });
});
