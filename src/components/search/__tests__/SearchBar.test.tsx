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

    describe("Big variant", () => {
        it("should render the search bar with input and button", async () => {
            await act(() => {
                renderWithRouter(<SearchBar type={"big"} />);
            });
            expect(screen.getByPlaceholderText("Ich suche nach...")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /suchen/i })).toBeInTheDocument();
        });

        it("should render with larger input height and text size", async () => {
            await act(() => {
                renderWithRouter(<SearchBar type={"big"} />);
            });
            const input = screen.getByPlaceholderText("Ich suche nach...");
            const button = screen.getByRole("button", { name: /suchen/i });

            expect(input).toHaveClass("h-12");
            expect(button).toHaveClass("h-12");
        });

        it("should show button text on larger screens", async () => {
            await act(() => {
                renderWithRouter(<SearchBar type={"big"} />);
            });
            const buttonText = screen.getByText("Suchen");
            expect(buttonText).toBeInTheDocument();
            expect(buttonText).toHaveClass("hidden", "sm:inline");
        });

        it("should navigate to the search page with the correct query when input is valid", async () => {
            await act(() => {
                renderWithRouter(<SearchBar type={"big"} />);
            });
            const input = screen.getByPlaceholderText("Ich suche nach...");
            const button = screen.getByRole("button", { name: /suchen/i });

            await user.type(input, "test query");
            await user.click(button);

            expect(screen.queryByText("Entdecken, vergleichen, sammeln-")).not.toBeInTheDocument();
        });

        it("should not navigate when the input is less than 3 characters", async () => {
            await act(() => {
                renderWithRouter(<SearchBar type={"big"} />);
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
                renderWithRouter(<SearchBar type={"big"} />);
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

    describe("Small variant", () => {
        it("should render the small search bar with input and button", async () => {
            await act(() => {
                renderWithRouter(<SearchBar type={"small"} />, { initialEntries: ["/search"] });
            });
            expect(screen.getByPlaceholderText("Ich suche nach...")).toBeInTheDocument();
            expect(screen.getByRole("button")).toBeInTheDocument();
        });

        it("should render with smaller input height", async () => {
            await act(() => {
                renderWithRouter(<SearchBar type={"small"} />, { initialEntries: ["/search"] });
            });
            const input = screen.getByPlaceholderText("Ich suche nach...");
            const button = screen.getByRole("button");

            expect(input).toHaveClass("h-9");
            expect(button).toHaveClass("h-9");
        });

        it("should not show button text", async () => {
            await act(() => {
                renderWithRouter(<SearchBar type={"small"} />, { initialEntries: ["/search"] });
            });
            const buttonText = screen.queryByText("Suchen");
            // Button text element exists but is hidden
            expect(buttonText).toBeInTheDocument();
            expect(buttonText).toHaveClass("hidden");
            expect(buttonText).not.toHaveClass("sm:inline");
        });

        it("should navigate to the search page when form is submitted", async () => {
            await act(() => {
                renderWithRouter(<SearchBar type={"small"} />, { initialEntries: ["/search"] });
            });
            const input = screen.getByPlaceholderText("Ich suche nach...");
            const button = screen.getByRole("button");

            await user.type(input, "test query");
            await user.click(button);

            expect(screen.queryByText("Entdecken, vergleichen, sammeln-")).not.toBeInTheDocument();
        });

        it("should show validation error for input less than 3 characters", async () => {
            await act(() => {
                renderWithRouter(<SearchBar type={"small"} />, { initialEntries: ["/search"] });
            });

            const input = screen.getByPlaceholderText("Ich suche nach...");
            const button = screen.getByRole("button");

            await user.type(input, "ab");
            await user.click(button);

            expect(
                await screen.findByText("Bitte geben Sie mindestens 3 Zeichen ein"),
            ).toBeInTheDocument();
        });

        it("should populate input with current query from search params on /search page", async () => {
            await act(() => {
                renderWithRouter(<SearchBar type={"small"} />, {
                    initialEntries: ["/search?q=existing+query"],
                });
            });
            const input = screen.getByPlaceholderText("Ich suche nach...") as HTMLInputElement;
            expect(input.value).toBe("existing query");
        });
    });

    describe("Behavior across routes", () => {
        it("should not populate input with query when not on /search page", async () => {
            await act(() => {
                renderWithRouter(<SearchBar type={"big"} />, {
                    initialEntries: ["/test?q=some+query"],
                });
            });
            const input = screen.getByPlaceholderText("Ich suche nach...") as HTMLInputElement;
            expect(input.value).toBe("");
        });
    });
});
