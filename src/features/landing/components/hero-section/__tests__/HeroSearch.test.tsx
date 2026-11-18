import { act, screen } from "@testing-library/react";
import { HeroSearch } from "@/features/landing/components/hero-section/HeroSearch.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

function stubPointer(fine: boolean) {
    vi.stubGlobal("matchMedia", (query: string) => ({
        matches: query === "(pointer: fine)" ? fine : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}

async function renderHeroSearch(entry = "/") {
    await act(async () => {
        renderWithRouter(<HeroSearch />, { initialEntries: [entry] });
    });
    return screen.getByLabelText("Den weltweiten Markt durchsuchen");
}

describe("HeroSearch focus", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("focuses the search input on arrival with a fine pointer", async () => {
        stubPointer(true);

        const input = await renderHeroSearch();

        expect(input).toHaveFocus();
    });

    it("leaves focus alone on touch devices so the keyboard does not cover the hero", async () => {
        stubPointer(false);

        const input = await renderHeroSearch();

        expect(input).not.toHaveFocus();
    });

    it("focuses the search input on touch devices when the page targets the search", async () => {
        stubPointer(false);

        const input = await renderHeroSearch("/#hero-search");

        expect(input).toHaveFocus();
    });

    it("does not steal focus the visitor already placed elsewhere", async () => {
        stubPointer(true);
        const other = document.createElement("button");
        document.body.appendChild(other);
        other.focus();

        const input = await renderHeroSearch();

        expect(input).not.toHaveFocus();
        expect(other).toHaveFocus();
        other.remove();
    });
});
