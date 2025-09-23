import { SearchBar } from "@/components/search/SearchBar";
import { useNavigate } from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@tanstack/react-router", () => ({
    useNavigate: vi.fn(),
}));

describe("SearchBar", () => {
    const mockNavigate = vi.fn();
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        (useNavigate as vi.Mock).mockReturnValue(mockNavigate);
        mockNavigate.mockClear();

        user = userEvent.setup();
        render(<SearchBar />);
    });

    it("renders the search bar with input and button", () => {
        expect(screen.getByPlaceholderText("Ich suche nach...")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /suchen/i })).toBeInTheDocument();
    });

    it("navigates to the search page with the correct query when input is valid", async () => {
        const input = screen.getByPlaceholderText("Ich suche nach...");
        const button = screen.getByRole("button", { name: /suchen/i });

        await user.type(input, "test query");
        await user.click(button);

        expect(mockNavigate).toHaveBeenCalledWith({
            to: "/search",
            search: { q: "test query" },
        });
    });

    it("does not navigate when the input is less than 3 characters", async () => {
        const input = screen.getByPlaceholderText("Ich suche nach...");
        const button = screen.getByRole("button", { name: /suchen/i });

        await user.type(input, "ab");
        await user.click(button);

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("shows an error message when the input is less than 3 characters", async () => {
        const input = screen.getByPlaceholderText("Ich suche nach...");
        const button = screen.getByRole("button", { name: /suchen/i });

        await user.type(input, "ab");
        await user.click(button);

        expect(
            await screen.findByText("Bitte geben Sie mindestens 3 Zeichen ein"),
        ).toBeInTheDocument();
    });

    it("clears the error message when the input becomes valid", async () => {
        const input = screen.getByPlaceholderText("Ich suche nach...");
        const button = screen.getByRole("button", { name: /suchen/i });

        await user.type(input, "ab");
        await user.click(button);
        expect(
            await screen.findByText("Bitte geben Sie mindestens 3 Zeichen ein"),
        ).toBeInTheDocument();

        await user.clear(input);
        await user.type(input, "valid query");

        await waitFor(() => {
            expect(
                screen.queryByText("Bitte geben Sie mindestens 3 Zeichen ein"),
            ).not.toBeInTheDocument();
        });
    });
});
