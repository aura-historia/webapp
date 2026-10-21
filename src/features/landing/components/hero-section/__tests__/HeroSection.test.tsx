import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
            "Der weltweite Antiquitätenmarkt, in einer einzigen Suche.",
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

    it("asks for a longer query instead of searching", async () => {
        const user = userEvent.setup();

        await user.type(screen.getByLabelText("Den weltweiten Markt durchsuchen"), "ab");
        await user.click(screen.getByRole("button", { name: "Markt durchsuchen" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Bitte geben Sie mindestens 3 Zeichen ein",
        );
        expect(screen.getByLabelText("Den weltweiten Markt durchsuchen")).toHaveAttribute(
            "aria-invalid",
            "true",
        );
    });

    it("clears the hint once the query changes", async () => {
        const user = userEvent.setup();
        const input = screen.getByLabelText("Den weltweiten Markt durchsuchen");

        await user.type(input, "ab");
        await user.click(screen.getByRole("button", { name: "Markt durchsuchen" }));
        await user.type(input, "c");

        await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    });
});
