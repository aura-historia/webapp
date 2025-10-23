import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Header } from "../Header.tsx";

describe("Header Component", () => {
    describe("Basic rendering", () => {
        it("should render webapp logo link", async () => {
            await act(() => {
                renderWithRouter(<Header />);
            });
            const logoLink = screen.getByText("Aura Historia");
            expect(logoLink).toBeInTheDocument();
            expect(logoLink.closest("a")).toHaveAttribute("href", "/");
        });

        it("should renders auth buttons with correct text", async () => {
            await act(() => {
                renderWithRouter(<Header />);
            });
            expect(screen.getByText("Registrieren")).toBeInTheDocument();
            expect(screen.getByText("Einloggen")).toBeInTheDocument();
        });
    });

    describe("Search bar integration", () => {
        it("should render the search bar with small variant", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });
            // Search bar should be visible on non-landing pages
            expect(screen.getByPlaceholderText("Ich suche nach...")).toBeInTheDocument();
        });

        it("should hide the search bar on the landing page", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/"] });
            });
            // Small variant should be hidden on landing page (pathname === "/")
            expect(screen.queryByPlaceholderText("Ich suche nach...")).not.toBeInTheDocument();
        });

        it("should show the search bar on other routes", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/test"] });
            });
            expect(screen.getByPlaceholderText("Ich suche nach...")).toBeInTheDocument();
        });

        it("should render search bar in the center column", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });
            const header = screen.getByRole("banner");
            const searchInput = screen.getByPlaceholderText("Ich suche nach...");

            // Verify header has grid layout
            expect(header).toHaveClass("grid", "grid-cols-3");

            // Verify search input is in a centered div
            const centerDiv = searchInput.closest("div.flex.justify-center");
            expect(centerDiv).toBeInTheDocument();
        });

        it("should allow searching from the header search bar", async () => {
            const user = userEvent.setup();
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });

            const input = screen.getByPlaceholderText("Ich suche nach...");
            const button = screen.getByRole("button", { name: "Suchen" });

            await user.type(input, "test query");
            await user.click(button);

            // Form should process without validation errors
            expect(
                screen.queryByText("Bitte geben Sie mindestens 3 Zeichen ein"),
            ).not.toBeInTheDocument();
        });

        it("should use the small variant styling in header", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });

            const input = screen.getByPlaceholderText("Ich suche nach...");
            const button = screen.getByRole("button", { name: "Suchen" });

            // Small variant should have h-10 height
            expect(input).toHaveClass("h-10");
            expect(button).toHaveClass("h-10");

            // Small variant should not show button text on any screen size
            const buttonText = screen.queryByText("Suchen");
            if (buttonText) {
                expect(buttonText).toHaveClass("hidden");
                expect(buttonText).not.toHaveClass("sm:inline");
            }
        });
    });

    describe("Layout structure", () => {
        it("should have three-column grid layout", async () => {
            await act(() => {
                renderWithRouter(<Header />);
            });
            const header = screen.getByRole("banner");
            expect(header).toHaveClass("grid", "grid-cols-3");
        });

        it("should be sticky at the top", async () => {
            await act(() => {
                renderWithRouter(<Header />);
            });
            const header = screen.getByRole("banner");
            expect(header).toHaveClass("sticky", "top-0");
        });

        it("should have backdrop blur and border", async () => {
            await act(() => {
                renderWithRouter(<Header />);
            });
            const header = screen.getByRole("banner");
            expect(header).toHaveClass("backdrop-blur-sm", "border-b");
        });
    });
});
