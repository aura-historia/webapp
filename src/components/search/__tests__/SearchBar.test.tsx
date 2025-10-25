import { SearchBar } from "@/components/search/SearchBar";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";

describe("SearchBar", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
    });

    it("should render the search bar with input and button", async () => {
        await act(() => {
            renderWithRouter(<SearchBar />);
        });
        expect(screen.getByPlaceholderText("Ich suche nach...")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /suchen/i })).toBeInTheDocument();
    });

    it("should navigate to the search page with the correct query when input is valid", async () => {
        await act(() => {
            renderWithRouter(<SearchBar />);
        });
        const input = screen.getByPlaceholderText("Ich suche nach...");
        const button = screen.getByRole("button", { name: /suchen/i });

        await user.type(input, "test query");
        await user.click(button);

        expect(screen.queryByText("Entdecken, vergleichen, sammeln-")).not.toBeInTheDocument();
    });

    it("should not navigate when the input is less than 3 characters", async () => {
        await act(() => {
            renderWithRouter(<SearchBar />);
        });

        const input = screen.getByPlaceholderText("Ich suche nach...");
        const button = screen.getByRole("button", { name: /suchen/i });

        await user.type(input, "ab");
        await user.click(button);

        // The form should show validation error, preventing navigation
        expect(
            await screen.findByText("Bitte geben Sie mindestens 3 Zeichen ein"),
        ).toBeInTheDocument();
    });

    it("should clear the error message when the input becomes valid", async () => {
        await act(() => {
            renderWithRouter(<SearchBar />);
        });

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
