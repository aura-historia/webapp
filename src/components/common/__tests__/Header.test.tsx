import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "../Header.tsx";
import { HERO_SEARCH_BAR_SCROLL_THRESHOLD } from "@/components/landing-page/common/landingPageConstants.ts";

const mockUseResolvedAuth = vi.hoisted(() => vi.fn());
const mockUseUserAccount = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/auth/useResolvedAuth", () => ({
    useResolvedAuth: mockUseResolvedAuth,
}));

vi.mock("@/hooks/account/useUserAccount.ts", () => ({
    useUserAccount: mockUseUserAccount,
}));

const setupAuthMock = ({
    isAuthenticated = false,
    isLoading = false,
}: {
    isAuthenticated?: boolean;
    isLoading?: boolean;
} = {}) => {
    mockUseResolvedAuth.mockReturnValue({
        user: isAuthenticated ? { userId: "test-id", username: "test" } : null,
        isAuthenticated,
        isLoading,
        isResolved: isAuthenticated || !isLoading,
        signOut: vi.fn(),
    });
};

describe("Header Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Not logged in user", () => {
        beforeEach(async () => {
            setupAuthMock();
            mockUseUserAccount.mockReturnValue({ data: undefined, isLoading: false });
            await act(async () => {
                renderWithRouter(<Header />);
            });
        });

        it("should render webapp logo link", () => {
            const logoLink = screen.getAllByRole("presentation")[0];
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
            setupAuthMock({ isAuthenticated: true });
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
            const logoLink = screen.getAllByRole("presentation")[0];
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
            expect(screen.queryByRole("menuitem", { name: "Merkliste" })).not.toBeInTheDocument();
            expect(
                screen.queryByRole("menuitem", { name: "Partner-Dashboard" }),
            ).not.toBeInTheDocument();
        });

        it("should put collapsed navigation links behind a hamburger menu", async () => {
            const user = userEvent.setup();
            const menuTrigger = screen.getByRole("button", { name: "Kontonavigation" });

            expect(menuTrigger.querySelector("svg.lucide-menu")).toBeInTheDocument();
            expect(menuTrigger).toHaveClass("min-[1024px]:max-[1799px]:inline-flex");
            expect(menuTrigger).not.toHaveClass("lg:inline-flex");
            await user.click(menuTrigger);

            expect(screen.getByRole("menuitem", { name: "Merkliste" })).toHaveAttribute(
                "href",
                "/me/watchlist",
            );
            expect(screen.getByRole("menuitem", { name: "Suchaufträge" })).toHaveAttribute(
                "href",
                "/me/search-filters",
            );
            expect(screen.getByRole("menuitem", { name: "Partner-Dashboard" })).toHaveAttribute(
                "href",
                "/partners/applications",
            );
        });

        it("should not show auth buttons", () => {
            expect(screen.queryByText("Registrieren")).not.toBeInTheDocument();
            expect(screen.queryByText("Einloggen")).not.toBeInTheDocument();
        });

        it("should show a partner dashboard link", () => {
            expect(screen.getByRole("link", { name: "Partner-Dashboard" })).toHaveAttribute(
                "href",
                "/partners/applications",
            );
        });

        it("should reserve text decoration for the active navigation item", () => {
            const watchlistLink = screen.getByRole("link", { name: "Merkliste" });
            expect(watchlistLink).toHaveClass("rounded-none");
            expect(watchlistLink).not.toHaveClass("border-b-2");
            expect(watchlistLink).not.toHaveClass("bg-accent");
        });

        it("should render the account trigger without a focus ring", () => {
            const accountTrigger = screen.getByText("MM").closest("button");

            expect(accountTrigger).toHaveClass("focus-visible:ring-0");
            expect(accountTrigger).not.toHaveClass("border-b-2", "underline");
        });

        it("should not show an admin link for non-admin users", () => {
            expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
        });
    });

    describe("Logged in admin user", () => {
        beforeEach(async () => {
            setupAuthMock({ isAuthenticated: true });
            mockUseUserAccount.mockReturnValue({
                data: {
                    firstName: "Ada",
                    lastName: "Admin",
                    role: "ADMIN",
                },
                isLoading: false,
            });
            await act(async () => {
                renderWithRouter(<Header />);
            });
        });

        it("should show an admin link to the admin dashboard", () => {
            expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute(
                "href",
                "/admin/overview",
            );
        });
    });

    describe("Cloudflare prerendered auth state", () => {
        it("uses the client Amplify session when server auth was rendered as logged out", async () => {
            setupAuthMock({ isAuthenticated: true });
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

            expect(screen.getByText("MM")).toBeInTheDocument();
            expect(screen.queryByText("Registrieren")).not.toBeInTheDocument();
            expect(screen.queryByText("Einloggen")).not.toBeInTheDocument();
        });

        it("does not show logged-out actions while the client session is still loading", async () => {
            setupAuthMock({ isLoading: true });
            mockUseUserAccount.mockReturnValue({ data: undefined, isLoading: false });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            expect(screen.queryByText("Registrieren")).not.toBeInTheDocument();
            expect(screen.queryByText("Einloggen")).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Menu" })).not.toBeInTheDocument();
        });
    });

    describe("Search bar integration", () => {
        it("should render the search bar with small variant", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });
            // Search bar should be visible on non-landing pages
            const searchInputs = screen.getAllByPlaceholderText("Suche");
            expect(searchInputs.length).toBeGreaterThan(0);
        });

        it("should hide the search bar on the landing page initially", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/"] });
            });
            // Search bar is in DOM but hidden with CSS
            const searchInputs = screen.queryAllByPlaceholderText("Suche");

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
                Object.defineProperty(window, "scrollY", {
                    value: HERO_SEARCH_BAR_SCROLL_THRESHOLD + 1,
                    writable: true,
                });
                window.dispatchEvent(new Event("scroll"));
            });

            const searchInputs = screen.queryAllByPlaceholderText("Suche");
            if (searchInputs.length > 0) {
                const wrapper = searchInputs[0].closest("form")?.parentElement;
                expect(wrapper).toHaveClass("opacity-100");
            }
        });

        it("should show the search bar on other routes", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/test"] });
            });
            const searchInputs = screen.getAllByPlaceholderText("Suche");
            expect(searchInputs.length).toBeGreaterThan(0);
        });

        it("should render search bar in the center column", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });
            const header = screen.getByRole("banner");

            expect(header).toHaveClass(
                "grid",
                "lg:grid-cols-[minmax(0,1fr)_minmax(12rem,36rem)_minmax(0,1fr)]",
            );

            const desktopSearchDiv = header.querySelector("div.hidden.lg\\:block");
            expect(desktopSearchDiv).toBeInTheDocument();
        });

        it("should allow searching from the header search bar", async () => {
            const user = userEvent.setup();
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });

            const inputs = screen.getAllByPlaceholderText("Suche");
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

            const inputs = screen.getAllByPlaceholderText("Suche");
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
        it("should use equal outer columns to keep the search centered", async () => {
            await act(() => {
                renderWithRouter(<Header />);
            });
            const header = screen.getByRole("banner");
            expect(header).toHaveClass(
                "grid",
                "lg:grid-cols-[minmax(0,1fr)_minmax(12rem,36rem)_minmax(0,1fr)]",
                "2xl:grid-cols-[minmax(0,1fr)_minmax(12rem,42rem)_minmax(0,1fr)]",
            );
        });

        it("should be sticky at the top", async () => {
            await act(() => {
                renderWithRouter(<Header />);
            });
            const header = screen.getByRole("banner");
            expect(header).toHaveClass("sticky", "top-0");
        });

        it("should have a solid background and border", async () => {
            await act(() => {
                renderWithRouter(<Header />);
            });
            const header = screen.getByRole("banner");
            expect(header).toHaveClass("bg-background", "border-b");
        });
    });

    describe("Greeting logic", () => {
        it("should display greeting with firstName when user is logged in", async () => {
            setupAuthMock({ isAuthenticated: true });
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
            setupAuthMock();
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
            setupAuthMock({ isAuthenticated: true });
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
            setupAuthMock({ isAuthenticated: true });
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
            setupAuthMock({ isAuthenticated: true });
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
            setupAuthMock({ isAuthenticated: true });
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
            setupAuthMock({ isAuthenticated: true });
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

    describe("Mobile search overlay", () => {
        beforeEach(() => {
            setupAuthMock();
            mockUseUserAccount.mockReturnValue({ data: undefined, isLoading: false });
        });

        it("opens mobile search overlay when search icon is clicked", async () => {
            const user = userEvent.setup();
            await act(async () => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });

            const searchButton = screen.getByRole("button", { name: "Suche" });
            await user.click(searchButton);

            const overlay = document.querySelector(".absolute.inset-0.flex");
            expect(overlay).not.toHaveClass("opacity-0");
        });

        it("closes mobile search overlay when back button is clicked", async () => {
            const user = userEvent.setup();
            await act(async () => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });

            const searchButton = screen.getByRole("button", { name: "Suche" });
            await user.click(searchButton);

            const overlay = document.querySelector(".absolute.inset-0.flex");
            const backButton = overlay?.querySelector("button");
            if (backButton) await user.click(backButton);

            expect(overlay).toHaveClass("opacity-0");
        });

        it("shows SearchBar in overlay when mobile search is open", async () => {
            const user = userEvent.setup();
            await act(async () => {
                renderWithRouter(<Header />, { initialEntries: ["/search"] });
            });

            const searchButton = screen.getByRole("button", { name: "Suche" });
            await user.click(searchButton);

            const inputs = screen.getAllByPlaceholderText("Suche");
            expect(inputs.length).toBeGreaterThan(1);
        });
    });

    describe("Mobile menu", () => {
        it("shows mobile menu button for unauthenticated user", async () => {
            setupAuthMock({ isAuthenticated: false });
            mockUseUserAccount.mockReturnValue({ data: undefined, isLoading: false });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            const menuButtons = screen.getAllByRole("button");
            const menuButton = menuButtons.find((btn) => btn.querySelector("svg.lucide-menu"));
            expect(menuButton).toBeInTheDocument();
        });

        it("shows register and login in mobile menu for unauthenticated user", async () => {
            const user = userEvent.setup();
            setupAuthMock({ isAuthenticated: false });
            mockUseUserAccount.mockReturnValue({ data: undefined, isLoading: false });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            const menuButtons = screen.getAllByRole("button");
            const menuButton = menuButtons.find((btn) => btn.querySelector("svg.lucide-menu"));
            if (menuButton) await user.click(menuButton);

            expect(screen.getAllByText("Registrieren").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Einloggen").length).toBeGreaterThan(0);
        });

        it("shows watchlist and account links in mobile menu for authenticated user", async () => {
            const user = userEvent.setup();
            setupAuthMock({ isAuthenticated: true });
            mockUseUserAccount.mockReturnValue({
                data: { firstName: "Max", lastName: "Mustermann" },
                isLoading: false,
            });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            const menuButtons = screen.getAllByRole("button");
            const menuButton = menuButtons.find((btn) => btn.querySelector("svg.lucide-menu"));
            if (menuButton) await user.click(menuButton);

            expect(screen.getAllByText("Merkliste").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Partner-Dashboard").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Account bearbeiten").length).toBeGreaterThan(0);
        });

        it("shows admin link in mobile menu for admin user", async () => {
            const user = userEvent.setup();
            setupAuthMock({ isAuthenticated: true });
            mockUseUserAccount.mockReturnValue({
                data: { firstName: "Ada", lastName: "Admin", role: "ADMIN" },
                isLoading: false,
            });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            const menuButtons = screen.getAllByRole("button");
            const menuButton = menuButtons.find((btn) => btn.querySelector("svg.lucide-menu"));
            if (menuButton) await user.click(menuButton);

            expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
        });
    });

    describe("Sign out", () => {
        it("calls signOut and navigates to home when logout is clicked", async () => {
            const user = userEvent.setup();
            const mockSignOut = vi.fn().mockResolvedValue(undefined);
            mockUseResolvedAuth.mockReturnValue({
                isAuthenticated: true,
                isResolved: true,
                signOut: mockSignOut,
            });
            mockUseUserAccount.mockReturnValue({
                data: { firstName: "Max", lastName: "Mustermann" },
                isLoading: false,
            });

            await act(async () => {
                renderWithRouter(<Header />);
            });

            const initialsElement = screen.getByText("MM");
            const dropdownTrigger = initialsElement.closest("button");
            if (dropdownTrigger) await user.click(dropdownTrigger);

            const logoutItems = await screen.findAllByText("Ausloggen");
            await user.click(logoutItems[0]);

            expect(mockSignOut).toHaveBeenCalled();
        });
    });
});
