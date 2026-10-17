import { SearchBar } from "../SearchBar.tsx";
import { useAnimatedPlaceholder } from "@/features/search/common/hooks/useAnimatedPlaceholder.ts";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";

vi.mock("@/features/search/common/hooks/useAnimatedPlaceholder.ts", () => ({
    useAnimatedPlaceholder: vi.fn(() => ""),
}));

describe("SearchBar", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    describe("Big variant", () => {
        it("should disable browser autofill heuristics for the search input", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />);
            });

            const input = screen.getByLabelText("Suche");

            expect(input).toHaveAttribute("type", "search");
        });

        it("should render the search bar with input and button", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />);
            });
            expect(screen.getByLabelText("Suche")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /suchen/i })).toBeInTheDocument();
        });

        it("should render with larger input height and text size", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />);
            });
            const input = screen.getByLabelText("Suche");
            const button = screen.getByRole("button", { name: /suchen/i });

            expect(input).toHaveClass("h-full");
            expect(button).toHaveClass("h-12");
        });

        it("should show button text on larger screens", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />);
            });
            const buttonText = screen.getByText("Suchen");
            expect(buttonText).toBeInTheDocument();
            expect(buttonText).toHaveClass("hidden", "sm:inline");
        });

        it("should navigate to the search page with the correct query when input is valid", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />);
            });
            const input = screen.getByLabelText("Suche");
            const button = screen.getByRole("button", { name: /suchen/i });

            await user.type(input, "test query");
            await user.click(button);

            expect(screen.queryByText("Entdecken, vergleichen, sammeln-")).not.toBeInTheDocument();
        });

        it("should not navigate when the input is less than 3 characters", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />);
            });

            const input = screen.getByLabelText("Suche");
            const button = screen.getByRole("button", { name: /suchen/i });

            await user.type(input, "ab");
            await user.click(button);

            // The form should show validation error, preventing navigation
            expect(
                await screen.findByText("Bitte geben Sie mindestens 3 Zeichen ein"),
            ).toBeInTheDocument();
        });

        it("should clear the error message when the input becomes valid", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />);
            });

            const input = screen.getByLabelText("Suche");
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

    describe("Current query", () => {
        it("should populate input with current query from search params on /search page", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />, {
                    initialEntries: ["/search?q=existing+query"],
                });
            });
            const input = screen.getByLabelText("Suche") as HTMLInputElement;
            expect(input.value).toBe("existing query");
        });
    });

    describe("Behavior across routes", () => {
        it("should not populate input with query when not on /search page", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />, {
                    initialEntries: ["/test?q=some+query"],
                });
            });
            const input = screen.getByLabelText("Suche") as HTMLInputElement;
            expect(input.value).toBe("");
        });
    });

    describe("Product/Shop type selector", () => {
        it("renders the search type selector defaulting to products", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />);
            });
            const trigger = screen.getByTestId("search-type-select");
            expect(trigger).toBeInTheDocument();
            expect(trigger).toHaveTextContent("Artikel");
        });

        it("defaults the selector to shops when rendered on the /search/shops page", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />, {
                    initialEntries: ["/search/shops?q=auction"],
                });
            });
            const trigger = screen.getByTestId("search-type-select");
            expect(trigger).toHaveTextContent("Anbieter");
        });

        it("can switch between products and shops", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />);
            });
            const trigger = screen.getByTestId("search-type-select");
            await user.click(trigger);
            const shopsOption = await screen.findByRole("option", { name: "Anbieter" });
            await user.click(shopsOption);
            expect(trigger).toHaveTextContent("Anbieter");
        });

        it("passes resetKey products to animated placeholder by default", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />);
            });
            expect(vi.mocked(useAnimatedPlaceholder)).toHaveBeenCalledWith(
                expect.objectContaining({ resetKey: "products" }),
            );
        });

        it("passes resetKey shops to animated placeholder on shop search route", async () => {
            await act(async () => {
                renderWithRouter(<SearchBar />, {
                    initialEntries: ["/search/shops"],
                });
            });
            expect(vi.mocked(useAnimatedPlaceholder)).toHaveBeenCalledWith(
                expect.objectContaining({ resetKey: "shops" }),
            );
        });
    });
});
