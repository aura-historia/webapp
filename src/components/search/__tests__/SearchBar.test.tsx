import { SearchBar } from "@/components/search/SearchBar";
import { useNavigate } from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
    useNavigate: vi.fn(),
}));

describe("SearchBar", () => {
    const mockNavigate = vi.fn();
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
        mockNavigate.mockClear();

        user = userEvent.setup();
        render(<SearchBar />);
    });

    it("should render the search bar with input and button", () => {
        expect(screen.getByPlaceholderText("search.bar.placeholder")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /search.bar.button/i })).toBeInTheDocument();
    });

    it("should navigate to the search page with the correct query when input is valid", async () => {
        const input = screen.getByPlaceholderText("search.bar.placeholder");
        const button = screen.getByRole("button", { name: /search.bar.button/i });

        await user.type(input, "test query");
        await user.click(button);

        expect(mockNavigate).toHaveBeenCalledWith({
            to: "/search",
            search: { q: "test query" },
        });
    });

    it("should not navigate when the input is less than 3 characters", async () => {
        const input = screen.getByPlaceholderText("search.bar.placeholder");
        const button = screen.getByRole("button", { name: /search.bar.button/i });

        await user.type(input, "ab");
        await user.click(button);

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should show an error message when the input is less than 3 characters", async () => {
        const input = screen.getByPlaceholderText("search.bar.placeholder");
        const button = screen.getByRole("button", { name: /search.bar.button/i });

        await user.type(input, "ab");
        await user.click(button);

        expect(await screen.findByText("search.bar.validation.minLength")).toBeInTheDocument();
    });

    it("should clear the error message when the input becomes valid", async () => {
        const input = screen.getByPlaceholderText("search.bar.placeholder");
        const button = screen.getByRole("button", { name: /search.bar.button/i });

        await user.type(input, "ab");
        await user.click(button);
        expect(await screen.findByText("search.bar.validation.minLength")).toBeInTheDocument();

        await user.clear(input);
        await user.type(input, "valid query");

        await waitFor(() => {
            expect(screen.queryByText("search.bar.validation.minLength")).not.toBeInTheDocument();
        });
    });
});
