import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";
import { Header } from "../Header.tsx";

const mockUseResolvedAuth = vi.hoisted(() => vi.fn());
const mockUseUserAccount = vi.hoisted(() => vi.fn());

vi.mock("@/features/authentication/hooks/useResolvedAuth", () => ({
    useResolvedAuth: mockUseResolvedAuth,
}));

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: mockUseUserAccount,
}));

const MAX = {
    firstName: "Max",
    lastName: "Mustermann",
    email: "max@example.com",
    role: "USER",
};

const setupViewer = ({
    isAuthenticated = false,
    isLoading = false,
    account,
    signOut = vi.fn().mockResolvedValue(undefined),
}: {
    isAuthenticated?: boolean;
    isLoading?: boolean;
    account?: Record<string, unknown>;
    signOut?: () => Promise<void>;
} = {}) => {
    mockUseResolvedAuth.mockReturnValue({
        user: isAuthenticated ? { userId: "test-id", username: "test" } : null,
        isAuthenticated,
        isLoading,
        isResolved: isAuthenticated || !isLoading,
        signOut,
    });
    mockUseUserAccount.mockReturnValue({ data: account, isLoading: false });
};

async function renderHeader(path: string) {
    await act(async () => {
        renderWithRouter(<Header />, { initialEntries: [path] });
    });
}

/** The desktop variant is the first main navigation; the phone header follows it. */
function desktopNavigation() {
    return screen.getAllByRole("navigation", { name: "Hauptnavigation" })[0];
}

describe("Header", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("landing page", () => {
        it("links the wordmark home and lists the site sections", async () => {
            setupViewer();
            await renderHeader("/");
            const nav = within(desktopNavigation());

            expect(nav.getByRole("link", { name: "Aura Historia Startseite" })).toHaveAttribute(
                "href",
                "/de",
            );
            expect(nav.getByRole("link", { name: "Entdecken" })).toHaveAttribute(
                "href",
                "/de#recently-added",
            );
            expect(nav.getByRole("link", { name: "Plattform" })).toHaveAttribute(
                "href",
                "/de#platform",
            );
            expect(nav.getByRole("link", { name: "Discovery Agent" })).toHaveAttribute(
                "href",
                "/de#agent",
            );
            expect(nav.getByRole("link", { name: "Für Händler" })).toHaveAttribute(
                "href",
                "/de#dealers",
            );
            expect(nav.getByRole("link", { name: "Preise" })).toHaveAttribute(
                "href",
                "/de#pricing",
            );
        });

        it("shows sign in and the create account call to action when signed out", async () => {
            setupViewer();
            await renderHeader("/");
            const nav = within(desktopNavigation());

            expect(nav.getByRole("link", { name: "Anmelden" }).getAttribute("href")).toContain(
                "/de/login",
            );
            expect(nav.getByRole("link", { name: "Konto erstellen" }).getAttribute("href")).toMatch(
                /^\/de\/login\?.*mode=sign-up/,
            );
            expect(nav.queryByRole("search")).not.toBeInTheDocument();
        });

        it("stays at the top on phones and scrolls away with the hero on desktop", async () => {
            setupViewer();
            await renderHeader("/");

            expect(screen.getByRole("banner")).toHaveClass("sticky", "lg:relative");
        });

        it("lies transparently over the ink hero", async () => {
            setupViewer();
            await renderHeader("/");

            const bar = desktopNavigation().parentElement;
            expect(bar).toHaveAttribute("data-theme", "dark");
            expect(bar).toHaveClass("bg-transparent");
        });
    });

    describe("app pages", () => {
        it("shows the global search and stays at the top", async () => {
            setupViewer();
            await renderHeader("/search");

            expect(screen.getByRole("banner")).toHaveClass("sticky");
            expect(within(desktopNavigation()).getByRole("search")).toBeInTheDocument();
            expect(
                within(desktopNavigation()).getByPlaceholderText(
                    "Objekte suchen – Epoche, Hersteller, Stil…",
                ),
            ).toBeInTheDocument();
        });

        it("does not list the site sections", async () => {
            setupViewer();
            await renderHeader("/test");

            expect(
                within(desktopNavigation()).queryByRole("link", { name: "Entdecken" }),
            ).not.toBeInTheDocument();
        });

        it("offers sign in and account creation when signed out", async () => {
            setupViewer();
            await renderHeader("/test");
            const nav = within(desktopNavigation());

            expect(nav.getByRole("link", { name: "Anmelden" }).getAttribute("href")).toContain(
                "mode=sign-in",
            );
            expect(
                nav.getByRole("link", { name: "Konto erstellen" }).getAttribute("href"),
            ).toContain("mode=sign-up");
        });

        it("shows the current query on the search page", async () => {
            setupViewer();
            await renderHeader("/search?q=Biedermeier");

            expect(within(desktopNavigation()).getByRole("searchbox")).toHaveValue("Biedermeier");
        });

        it("keeps the query in the field after searching from another page", async () => {
            const user = userEvent.setup();
            setupViewer();
            await renderHeader("/test");

            const input = within(desktopNavigation()).getByRole("searchbox");
            await user.type(input, "Meissen{Enter}");

            expect(await within(desktopNavigation()).findByRole("searchbox")).toHaveValue(
                "Meissen",
            );
        });

        it("hides search and account actions on the login route", async () => {
            setupViewer();
            await renderHeader("/login");

            expect(screen.queryByRole("search")).not.toBeInTheDocument();
            expect(screen.queryByRole("link", { name: "Anmelden" })).not.toBeInTheDocument();
        });
    });

    describe("auth state", () => {
        it("does not show signed-out actions while the session is loading", async () => {
            setupViewer({ isLoading: true });
            await renderHeader("/");

            expect(screen.queryByRole("link", { name: "Anmelden" })).not.toBeInTheDocument();
            expect(screen.queryByRole("link", { name: "Konto erstellen" })).not.toBeInTheDocument();
        });

        it("shows the member's watchlist and account menu when signed in", async () => {
            setupViewer({ isAuthenticated: true, account: MAX });
            await renderHeader("/test");
            const nav = within(desktopNavigation());

            expect(nav.getByRole("link", { name: "Merkliste" })).toHaveAttribute(
                "href",
                "/de/me/watchlist",
            );
            expect(nav.getByRole("button", { name: "Kontomenü" })).toHaveTextContent("MM");
            expect(nav.queryByRole("link", { name: "Anmelden" })).not.toBeInTheDocument();
        });
    });

    describe("account menu", () => {
        it("shows the member's identity and shortcuts", async () => {
            const user = userEvent.setup();
            setupViewer({ isAuthenticated: true, account: MAX });
            await renderHeader("/test");

            await user.click(
                within(desktopNavigation()).getByRole("button", { name: "Kontomenü" }),
            );
            const menu = await screen.findByRole("menu");

            expect(within(menu).getByText("Max Mustermann")).toBeInTheDocument();
            expect(within(menu).getByText("max@example.com")).toBeInTheDocument();
            expect(within(menu).getByRole("menuitem", { name: "Merkliste" })).toHaveAttribute(
                "href",
                "/de/me/watchlist",
            );
            expect(within(menu).getByRole("menuitem", { name: "Suchaufträge" })).toHaveAttribute(
                "href",
                "/de/me/search-filters",
            );
            expect(
                within(menu).getByRole("menuitem", { name: "Partner-Dashboard" }),
            ).toHaveAttribute("href", "/de/partners/applications");
            expect(
                within(menu).getByRole("menuitem", { name: "Konto & Einstellungen" }),
            ).toHaveAttribute("href", "/de/me/account");
            expect(within(menu).queryByRole("menuitem", { name: "Admin" })).not.toBeInTheDocument();
        });

        it("adds the admin entry for administrators", async () => {
            const user = userEvent.setup();
            setupViewer({ isAuthenticated: true, account: { ...MAX, role: "ADMIN" } });
            await renderHeader("/test");

            await user.click(
                within(desktopNavigation()).getByRole("button", { name: "Kontomenü" }),
            );

            expect(await screen.findByRole("menuitem", { name: "Admin" })).toHaveAttribute(
                "href",
                "/de/admin/overview",
            );
        });

        it("signs out", async () => {
            const user = userEvent.setup();
            const signOut = vi.fn().mockResolvedValue(undefined);
            setupViewer({ isAuthenticated: true, account: MAX, signOut });
            await renderHeader("/test");

            await user.click(
                within(desktopNavigation()).getByRole("button", { name: "Kontomenü" }),
            );
            await user.click(await screen.findByRole("menuitem", { name: "Abmelden" }));

            expect(signOut).toHaveBeenCalled();
        });
    });

    describe("phone menu", () => {
        it("opens a full-screen dialog with sections and sign in", async () => {
            const user = userEvent.setup();
            setupViewer();
            await renderHeader("/");

            const openButton = screen.getByRole("button", { name: "Menü öffnen" });
            expect(openButton).toHaveAttribute("aria-expanded", "false");
            await user.click(openButton);

            const dialog = await screen.findByRole("dialog", { name: "Menü" });
            expect(dialog).toHaveAttribute("data-theme", "dark");
            expect(within(dialog).getByRole("link", { name: "Für Händler" })).toHaveAttribute(
                "href",
                "/de#dealers",
            );
            expect(within(dialog).getByRole("link", { name: "Anmelden" })).toBeInTheDocument();
            expect(within(dialog).getByRole("search")).toBeInTheDocument();
            expect(
                within(dialog).getByRole("button", { name: "Sprache: Deutsch" }),
            ).toBeInTheDocument();
        });

        it("focuses the search field when opened from the search button", async () => {
            const user = userEvent.setup();
            setupViewer();
            await renderHeader("/test");

            await user.click(
                screen.getByRole("button", { name: "Den globalen Markt durchsuchen" }),
            );
            const dialog = await screen.findByRole("dialog", { name: "Menü" });

            expect(within(dialog).getByRole("searchbox")).toHaveFocus();
        });

        it("lists the member's shortcuts when signed in", async () => {
            const user = userEvent.setup();
            setupViewer({ isAuthenticated: true, account: MAX });
            await renderHeader("/test");

            await user.click(screen.getByRole("button", { name: "Menü öffnen" }));
            const dialog = await screen.findByRole("dialog", { name: "Menü" });
            const account = within(dialog).getByRole("navigation", { name: "Ihr Konto" });

            expect(within(account).getByRole("link", { name: "Merkliste" })).toHaveAttribute(
                "href",
                "/de/me/watchlist",
            );
            expect(within(account).getByRole("button", { name: "Abmelden" })).toBeInTheDocument();
            expect(
                within(dialog).queryByRole("link", { name: "Anmelden" }),
            ).not.toBeInTheDocument();
        });

        it("closes with the close button", async () => {
            const user = userEvent.setup();
            setupViewer();
            await renderHeader("/");

            await user.click(screen.getByRole("button", { name: "Menü öffnen" }));
            await user.click(await screen.findByRole("button", { name: "Menü schließen" }));

            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
    });
});
