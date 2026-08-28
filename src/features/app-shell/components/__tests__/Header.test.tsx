import { renderWithRouter } from "@/test/utils.tsx";
import { APP_SHELL_CONFIG } from "@/features/app-shell/config/appShellConfig.ts";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "../Header.tsx";

const mockUseResolvedAuth = vi.hoisted(() => vi.fn());
const mockUseUserAccount = vi.hoisted(() => vi.fn());

vi.mock("@/features/authentication/hooks/useResolvedAuth", () => ({
    useResolvedAuth: mockUseResolvedAuth,
}));

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
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
            expect(logoLink.closest("a")).toHaveAttribute("href", "/de");
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
            expect(logoLink.closest("a")).toHaveAttribute("href", "/de");
        });

        it("should show AccountImage for logged in user", () => {
            const initialsElement = screen.getByText("MM");
            expect(initialsElement).toBeInTheDocument();
        });

        it("should reveal account navigation on hover", async () => {
            const user = userEvent.setup();
            const initialsElement = screen.getByText("MM");
            const dropdownTrigger = initialsElement.closest("button");

            expect(dropdownTrigger).toBeInTheDocument();
            if (dropdownTrigger) {
                await user.hover(dropdownTrigger);
            }

            const accountLink = await screen.findByRole("link", { name: "Account bearbeiten" });
            expect(accountLink).toHaveAttribute("href", "/de/me/account");
            expect(screen.getByRole("button", { name: "Ausloggen" })).toBeInTheDocument();
            expect(screen.queryByRole("link", { name: "Merkliste" })).not.toBeInTheDocument();
            expect(
                screen.queryByRole("link", { name: "Partner-Dashboard" }),
            ).not.toBeInTheDocument();

            accountLink.addEventListener("click", (event) => event.preventDefault(), {
                once: true,
            });
            await user.hover(accountLink);
            await user.click(accountLink);

            expect(dropdownTrigger).toHaveAttribute("data-state", "open");
            expect(screen.getByRole("link", { name: "Account bearbeiten" })).toBeInTheDocument();
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
                "/de/me/watchlist",
            );
            expect(screen.getByRole("menuitem", { name: "Suchaufträge" })).toHaveAttribute(
                "href",
                "/de/me/search-filters",
            );
            expect(screen.getByRole("menuitem", { name: "Partner-Dashboard" })).toHaveAttribute(
                "href",
                "/de/partners/applications",
            );
        });

        it("should not show auth buttons", () => {
            expect(screen.queryByText("Registrieren")).not.toBeInTheDocument();
            expect(screen.queryByText("Einloggen")).not.toBeInTheDocument();
        });

        it("should keep grouped desktop navigation open while hovered after selecting a link", async () => {
            const user = userEvent.setup();
            expect(screen.getByRole("button", { name: "Sammlung" })).toBeInTheDocument();
            const workspaceTrigger = screen.getByRole("button", { name: "Arbeitsbereich" });
            expect(workspaceTrigger).toBeInTheDocument();

            await user.hover(workspaceTrigger);

            const partnerLink = await screen.findByRole("link", { name: "Partner-Dashboard" });
            expect(partnerLink).toHaveAttribute("href", "/de/partners/applications");
            expect(partnerLink).toHaveClass("focus-visible:bg-accent");
            expect(partnerLink).not.toHaveClass("focus:bg-accent");

            partnerLink.addEventListener("click", (event) => event.preventDefault(), {
                once: true,
            });
            await user.hover(partnerLink);
            await user.click(partnerLink);

            expect(workspaceTrigger).toHaveAttribute("data-state", "open");
            expect(screen.getByRole("link", { name: "Partner-Dashboard" })).toBeInTheDocument();
        });

        it("should reserve text decoration for the active navigation item", () => {
            const collectionTrigger = screen.getByRole("button", { name: "Sammlung" });
            expect(collectionTrigger).toHaveClass("rounded-none");
            expect(collectionTrigger).not.toHaveClass("border-b-2", "bg-accent");
        });

        it("should render the account trigger without a focus ring", () => {
            const accountTrigger = screen.getByText("MM").closest("button");

            expect(accountTrigger).toHaveClass("focus-visible:ring-0");
            expect(accountTrigger).not.toHaveClass("border-b-2", "underline");
        });

        it("should keep the account trigger inside the desktop navigation panel", () => {
            const accountTrigger = screen.getByText("MM").closest("button");
            const desktopNavigationPanel = accountTrigger?.closest(".w-max.shrink-0");

            expect(desktopNavigationPanel).toHaveClass("w-max", "shrink-0");
            expect(desktopNavigationPanel).not.toHaveClass("min-w-0");
        });

        it("should give every desktop navigation control the same target height", () => {
            const accountTrigger = screen.getByText("MM").closest("button");
            const notificationTrigger = screen
                .getAllByRole("button", { name: "Benachrichtigungen öffnen" })
                .find((button) => button.classList.contains("size-10"));
            expect(notificationTrigger).toBeDefined();

            const controls = [
                screen.getByRole("button", { name: "Sammlung" }),
                screen.getByRole("button", { name: "Arbeitsbereich" }),
                notificationTrigger,
                accountTrigger,
            ];

            for (const control of controls) {
                expect(
                    control?.classList.contains("h-10") || control?.classList.contains("size-10"),
                ).toBe(true);
            }
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

        it("should show an admin link in the workspace menu", async () => {
            const user = userEvent.setup();
            await user.click(screen.getByRole("button", { name: "Arbeitsbereich" }));

            expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute(
                "href",
                "/de/admin/overview",
            );
        });
    });

    describe("Grouped desktop navigation current page state", () => {
        beforeEach(() => {
            setupAuthMock({ isAuthenticated: true });
            mockUseUserAccount.mockReturnValue({
                data: {
                    firstName: "Ada",
                    lastName: "Admin",
                    role: "ADMIN",
                },
                isLoading: false,
            });
        });

        it.each([
            ["/me/watchlist", "Sammlung", "Merkliste", "Suchaufträge"],
            ["/me/search-filters", "Sammlung", "Suchaufträge", "Merkliste"],
            ["/partners/applications", "Arbeitsbereich", "Partner-Dashboard", "Admin"],
            ["/admin/overview", "Arbeitsbereich", "Admin", "Partner-Dashboard"],
        ])(
            "should expose the current grouped destination on %s",
            async (initialEntry, triggerName, currentLinkName, otherLinkName) => {
                const user = userEvent.setup();
                await act(async () => {
                    renderWithRouter(<Header />, { initialEntries: [initialEntry] });
                });

                await user.click(screen.getByRole("button", { name: triggerName }));

                expect(screen.getByRole("link", { name: currentLinkName })).toHaveAttribute(
                    "aria-current",
                    "page",
                );
                expect(screen.getByRole("link", { name: otherLinkName })).not.toHaveAttribute(
                    "aria-current",
                );
            },
        );
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

        it("should hide the header search bar while the landing hero is visible", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/"] });
            });
            const searchInput = screen.getAllByPlaceholderText("Suche")[0];
            expect(searchInput.closest("form")?.parentElement).toHaveClass("opacity-0");
        });

        it("should observe the landing hero when it mounts after the header", async () => {
            const originalIntersectionObserver = globalThis.IntersectionObserver;
            const observe = vi.fn();
            const unobserve = vi.fn();
            const disconnect = vi.fn();

            globalThis.IntersectionObserver = class {
                readonly root = null;
                readonly rootMargin = "";
                readonly thresholds = [];
                observe = observe;
                unobserve = unobserve;
                disconnect = disconnect;
                takeRecords = () => [];
            } as unknown as typeof IntersectionObserver;

            const hero = document.createElement("div");
            hero.setAttribute("data-app-shell-hero", "");
            hero.getBoundingClientRect = vi.fn(() => ({ top: -100, bottom: 0 }) as DOMRect);

            expect(hero.matches(APP_SHELL_CONFIG.landingHeroSelector)).toBe(true);

            try {
                await act(() => {
                    renderWithRouter(<Header />, { initialEntries: ["/"] });
                });

                expect(observe).not.toHaveBeenCalled();

                await act(async () => {
                    document.body.appendChild(hero);
                    await Promise.resolve();
                });

                expect(observe).toHaveBeenCalledWith(hero);
                const searchInput = screen.getAllByPlaceholderText("Suche")[0];
                expect(searchInput.closest("form")?.parentElement).toHaveClass("opacity-100");
            } finally {
                hero.remove();
                globalThis.IntersectionObserver = originalIntersectionObserver;
            }
        });

        it("should show the search bar on other routes", async () => {
            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/test"] });
            });
            const searchInputs = screen.getAllByPlaceholderText("Suche");
            expect(searchInputs.length).toBeGreaterThan(0);
        });

        it("should hide authentication navigation on the login route", async () => {
            setupAuthMock({ isAuthenticated: false });
            mockUseUserAccount.mockReturnValue({ data: undefined, isLoading: false });

            await act(() => {
                renderWithRouter(<Header />, { initialEntries: ["/login"] });
            });

            expect(screen.queryByRole("link", { name: "Registrieren" })).not.toBeInTheDocument();
            expect(screen.queryByRole("link", { name: "Einloggen" })).not.toBeInTheDocument();
            expect(document.querySelector("svg.lucide-menu")).not.toBeInTheDocument();
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

        it("should clip horizontal navigation animation overflow", async () => {
            await act(() => {
                renderWithRouter(<Header />);
            });
            const header = screen.getByRole("banner");
            expect(header).toHaveClass("overflow-x-clip");
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
