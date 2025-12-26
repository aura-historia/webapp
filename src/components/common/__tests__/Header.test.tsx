import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "../Header.tsx";

const mockUseAuthenticator = vi.hoisted(() => vi.fn());
const mockUseUserAccount = vi.hoisted(() => vi.fn());

vi.mock("@aws-amplify/ui-react", () => ({
    useAuthenticator: mockUseAuthenticator,
}));

vi.mock("@/hooks/useUserAccount.ts", () => ({
    useUserAccount: mockUseUserAccount,
}));

const setupAuthMock = (isLoggedIn = false) => {
    mockUseAuthenticator.mockReturnValue({
        toSignUp: vi.fn(),
        toSignIn: vi.fn(),
        user: isLoggedIn ? {} : null,
        signOut: vi.fn(),
    });
};

describe("Header Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Not logged in user", () => {
        beforeEach(async () => {
            setupAuthMock(false);
            mockUseUserAccount.mockReturnValue({ data: undefined, isLoading: false });
            await act(async () => {
                renderWithRouter(<Header />);
            });
        });

        it("should render webapp logo link", () => {
            const logoLink = screen.getByText("Aura Historia (Preview)");
            expect(logoLink).toBeInTheDocument();
            expect(logoLink.closest("a")).toHaveAttribute("href", "/");
        });

        it("should render auth buttons with correct text", () => {
            expect(screen.getByText("Registrieren")).toBeInTheDocument();
            expect(screen.getByText("Einloggen")).toBeInTheDocument();
        });
    });

    describe("Logged in user", () => {
        beforeEach(async () => {
            setupAuthMock(true);
            mockUseUserAccount.mockReturnValue({
                data: {
                    firstName: "Max",
                    lastName: "Mustermann",
                },
                isLoading: false,
            });
            await act(async () => {
                renderWithRouter(<Header />);
            });
        });

        it("should render webapp logo link", () => {
            const logoLink = screen.getByText("Aura Historia (Preview)");
            expect(logoLink).toBeInTheDocument();
            expect(logoLink.closest("a")).toHaveAttribute("href", "/");
        });

        it("should show AccountImage for logged in user", () => {
            const initialsElement = screen.getByText("MM");
            expect(initialsElement).toBeInTheDocument();
        });

        it("should show dropdown menu items when clicked", async () => {
            const user = userEvent.setup();
            const initialsElement = screen.getByText("MM");
            const dropdownTrigger = initialsElement.closest("button");

            expect(dropdownTrigger).toBeInTheDocument();
            if (dropdownTrigger) {
                await user.click(dropdownTrigger);
            }

            expect(screen.getByText("Mein Account")).toBeInTheDocument();
            expect(screen.getByText("Account bearbeiten")).toBeInTheDocument();
            expect(screen.getByText("Ausloggen")).toBeInTheDocument();
        });

        it("should not show auth buttons", () => {
            expect(screen.queryByText("Registrieren")).not.toBeInTheDocument();
            expect(screen.queryByText("Einloggen")).not.toBeInTheDocument();
        });
    });

    describe("Search bar integration", () => {
        it("should render the search bar with small variant", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });
            // Search bar should be visible on non-landing pages
            const searchInputs = screen.getAllByPlaceholderText("Ich suche nach...");
            expect(searchInputs.length).toBeGreaterThan(0);
        });

        it("should hide the search bar on the landing page initially", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/"] });
            });
            // Search bar is in DOM but hidden with CSS
            const searchInputs = screen.queryAllByPlaceholderText("Ich suche nach...");

            if (searchInputs.length > 0) {
                const wrapper = searchInputs[0].closest("form")?.parentElement;
                expect(wrapper).toHaveClass("opacity-0");
                expect(wrapper).toHaveClass("pointer-events-none");
            }
        });

        it("should show search bar when scrolling on landing page", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/"] });
            });

            await act(() => {
                Object.defineProperty(window, "scrollY", { value: 501, writable: true });
                window.dispatchEvent(new Event("scroll"));
            });

            const searchInputs = screen.queryAllByPlaceholderText("Ich suche nach...");
            if (searchInputs.length > 0) {
                const wrapper = searchInputs[0].closest("form")?.parentElement;
                expect(wrapper).toHaveClass("opacity-100");
            }
        });

        it("should show the search bar on other routes", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/test"] });
            });
            const searchInputs = screen.getAllByPlaceholderText("Ich suche nach...");
            expect(searchInputs.length).toBeGreaterThan(0);
        });

        it("should render search bar in the center column", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });
            const header = screen.getByRole("banner");

            // Verify header has responsive grid layout
            expect(header).toHaveClass("md:grid", "md:grid-cols-3");

            // Verify search input is in a centered div (desktop version)
            const centerDiv = header.querySelector("div.hidden.justify-center.md\\:flex");
            expect(centerDiv).toBeInTheDocument();
        });

        it("should allow searching from the header search bar", async () => {
            const user = userEvent.setup();
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });

            const inputs = screen.getAllByPlaceholderText("Ich suche nach...");
            const buttons = screen.getAllByRole("button", { name: "Suchen" });

            await user.type(inputs[0], "test query");
            await user.click(buttons[0]);

            // Form should process without validation errors
            expect(
                screen.queryByText("Bitte geben Sie mindestens 3 Zeichen ein"),
            ).not.toBeInTheDocument();
        });

        it("should use the small variant styling in header", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });

            const inputs = screen.getAllByPlaceholderText("Ich suche nach...");
            const buttons = screen.getAllByRole("button");

            // Find the search button (has Search icon)
            const searchButton = buttons.find((btn) => btn.querySelector("svg.lucide-search"));

            // Small variant should have h-9 height
            expect(inputs[0]).toHaveClass("h-9");
            if (searchButton) {
                expect(searchButton).toHaveClass("h-9");
            }

            // Small variant should not show button text on any screen size
            const buttonTexts = screen.queryAllByText("Suchen");
            if (buttonTexts.length > 0) {
                expect(buttonTexts[0]).toHaveClass("hidden");
                expect(buttonTexts[0]).not.toHaveClass("sm:inline");
            }
        });
    });

    describe("Layout structure", () => {
        it("should have three-column grid layout", async () => {
            await act(() => {
                renderWithRouter(<Header />);
            });
            const header = screen.getByRole("banner");
            expect(header).toHaveClass("md:grid", "md:grid-cols-3");
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

    describe("Greeting logic", () => {
        it("should display greeting with firstName when user is logged in", async () => {
            setupAuthMock(true);
            mockUseUserAccount.mockReturnValue({
                data: {
                    firstName: "Max",
                    lastName: "Mustermann",
                },
                isLoading: false,
            });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            expect(screen.getByText("Hallo, Max", { exact: false })).toBeInTheDocument();
        });

        it("should not display greeting when user is not logged in", async () => {
            setupAuthMock(false);
            mockUseUserAccount.mockReturnValue({
                data: undefined,
                isLoading: false,
            });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            expect(screen.queryByText("Hallo", { exact: false })).not.toBeInTheDocument();
        });

        it("should not display greeting when user is logged in but firstName is missing", async () => {
            setupAuthMock(true);
            mockUseUserAccount.mockReturnValue({
                data: {
                    firstName: undefined,
                    lastName: "Mustermann",
                },
                isLoading: false,
            });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            expect(screen.queryByText("Hallo", { exact: false })).not.toBeInTheDocument();
        });

        it("should not display greeting when user account data is still loading", async () => {
            setupAuthMock(true);
            mockUseUserAccount.mockReturnValue({
                data: undefined,
                isLoading: true,
            });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            expect(screen.queryByText("Hallo", { exact: false })).not.toBeInTheDocument();
        });

        it("should display greeting with different firstName", async () => {
            setupAuthMock(true);
            mockUseUserAccount.mockReturnValue({
                data: {
                    firstName: "Anna",
                    lastName: "Schmidt",
                },
                isLoading: false,
            });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            expect(screen.getByText("Hallo, Anna", { exact: false })).toBeInTheDocument();
        });

        it("should display greeting in dropdown trigger for desktop view", async () => {
            setupAuthMock(true);
            mockUseUserAccount.mockReturnValue({
                data: {
                    firstName: "Max",
                    lastName: "Mustermann",
                },
                isLoading: false,
            });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            // Desktop dropdown trigger should contain greeting
            const dropdownTriggers = screen.getAllByText("Hallo, Max", { exact: false });
            expect(dropdownTriggers.length).toBeGreaterThan(0);
        });

        it("should show AccountImage alongside greeting", async () => {
            setupAuthMock(true);
            mockUseUserAccount.mockReturnValue({
                data: {
                    firstName: "Max",
                    lastName: "Mustermann",
                },
                isLoading: false,
            });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            expect(screen.getByText("Hallo, Max", { exact: false })).toBeInTheDocument();
            expect(screen.getByText("MM")).toBeInTheDocument();
        });
    });
});
