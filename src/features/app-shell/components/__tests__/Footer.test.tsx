import { useLocation } from "@tanstack/react-router";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { t } from "i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { COMPARISON_REGISTRY } from "@/features/comparison/config/comparisonRegistry.ts";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { Footer } from "../Footer.tsx";
import { FOOTER_GROUPS, footerLinkKey } from "../footer/Footer.data.ts";

const { changeLanguageMock, persistLanguagePreferenceMock } = vi.hoisted(() => ({
    changeLanguageMock: vi.fn().mockResolvedValue(undefined),
    persistLanguagePreferenceMock: vi.fn(),
}));

vi.mock("@/i18n/languagePreference.ts", () => ({
    persistLanguagePreference: persistLanguagePreferenceMock,
}));

vi.mock("@/features/account-management/hooks/usePatchUserAccount.ts", () => ({
    useUpdateUserAccount: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: vi.fn(() => ({ data: undefined })),
}));

vi.mock("react-i18next", async () => {
    const actual = await vi.importActual("react-i18next");
    return {
        ...actual,
        useTranslation: () => ({
            t: (key: string, options?: Record<string, unknown>) => t(key, options),
            i18n: {
                resolvedLanguage: "de",
                language: "de",
                changeLanguage: changeLanguageMock,
            },
        }),
    };
});

function LocationProbe() {
    const location = useLocation();

    return (
        <div data-testid="location-probe">
            {JSON.stringify({ pathname: location.pathname, hash: location.hash })}
        </div>
    );
}

async function renderFooter(path = "/test") {
    await act(async () => {
        renderWithRouter(
            <>
                <Footer />
                <LocationProbe />
            </>,
            { initialEntries: [path] },
        );
    });
}

function group(name: string) {
    return within(screen.getByRole("navigation", { name }));
}

describe("Footer", () => {
    beforeEach(() => {
        localStorage.clear();
        changeLanguageMock.mockClear();
        persistLanguagePreferenceMock.mockClear();
    });

    it("sits on the ink ground", async () => {
        await renderFooter();

        expect(screen.getByRole("contentinfo")).toHaveAttribute("data-theme", "dark");
    });

    it("shows the wordmark, tagline and contact address", async () => {
        await renderFooter();

        expect(screen.getByRole("link", { name: "Aura Historia Startseite" })).toHaveAttribute(
            "href",
            "/de",
        );
        expect(
            screen.getByText("Der globale Kunst- und Antiquitätenmarkt in einer einzigen Suche."),
        ).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "contact@aura-historia.com" })).toHaveAttribute(
            "href",
            "mailto:contact@aura-historia.com",
        );
    });

    it("links the landing page sections under Discover", async () => {
        await renderFooter();
        const discover = group("Entdecken");

        expect(discover.getByRole("link", { name: "Neueste Zugänge" })).toHaveAttribute(
            "href",
            "/de#recently-added",
        );
        expect(discover.getByRole("link", { name: "Plattform" })).toHaveAttribute(
            "href",
            "/de#platform",
        );
        expect(discover.getByRole("link", { name: "Preise" })).toHaveAttribute(
            "href",
            "/de#pricing",
        );
        expect(discover.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/de#faq");
    });

    it("links the partner program, opening store listings in a new tab", async () => {
        await renderFooter();
        const partners = group("Partner");

        expect(partners.getByRole("link", { name: "Übersicht" })).toHaveAttribute(
            "href",
            "/de/partner-program",
        );
        expect(partners.getByRole("link", { name: "Aufnahme beantragen" })).toHaveAttribute(
            "href",
            "/de/partners/applications",
        );
        expect(partners.getByRole("link", { name: "Eigene Integration" })).toHaveAttribute(
            "href",
            "/de/partner-program/custom-integration",
        );
        const wordpress = partners.getByRole("link", { name: "WordPress-Plugin" });
        expect(wordpress).toHaveAttribute("href", WORDPRESS_PLUGIN_DIRECTORY_URL);
        expect(wordpress).toHaveAttribute("target", "_blank");
        expect(wordpress).toHaveAttribute("rel", "noopener noreferrer");
        expect(partners.getByRole("link", { name: "Shopify App Store" })).toHaveAttribute(
            "href",
            SHOPIFY_APP_STORE_URL,
        );
    });

    it("links the company pages", async () => {
        await renderFooter();
        const company = group("Unternehmen");

        expect(company.getByRole("link", { name: "Über uns" })).toHaveAttribute(
            "href",
            "/de/about-us",
        );
        expect(company.getByRole("link", { name: "Impressum" })).toHaveAttribute(
            "href",
            "/de/imprint",
        );
        expect(company.getByRole("link", { name: "Datenschutzerklärung" })).toHaveAttribute(
            "href",
            "/de/privacy",
        );
        expect(company.getByRole("link", { name: "AGB" })).toHaveAttribute(
            "href",
            "/de/terms-and-conditions",
        );
        expect(company.getByRole("link", { name: "Cookie-Einstellungen" })).toHaveAttribute(
            "href",
            "/de/consent-settings",
        );
        expect(company.queryByRole("link", { name: /Barnebys|Artsy|Invaluable/ })).toBeNull();
    });

    it("lists every published comparison in its own group between Partners and Company", async () => {
        await renderFooter();
        const comparisons = group("Vergleiche");

        const links = comparisons.getAllByRole("link");
        expect(links.map((link) => link.getAttribute("href"))).toEqual(
            COMPARISON_REGISTRY.map((comparison) => `/de/compare/${comparison.slug}`),
        );
        expect(
            comparisons.getByRole("link", { name: "Aura Historia vs. Barnebys" }),
        ).toHaveAttribute("href", "/de/compare/barnebys");
        expect(comparisons.getByRole("link", { name: "Aura Historia vs. Artsy" })).toHaveAttribute(
            "href",
            "/de/compare/artsy",
        );
        expect(
            comparisons.getByRole("link", { name: "Aura Historia vs. Invaluable" }),
        ).toHaveAttribute("href", "/de/compare/invaluable");

        const titles = screen
            .getAllByRole("navigation")
            .map((nav) => nav.getAttribute("aria-label"))
            .filter((label) =>
                ["Entdecken", "Partner", "Vergleiche", "Unternehmen"].includes(label ?? ""),
            );
        expect(titles).toEqual(["Entdecken", "Partner", "Vergleiche", "Unternehmen"]);
    });

    it("keeps each link unique when several links share a translation", () => {
        const keys = FOOTER_GROUPS.flatMap((footerGroup) => footerGroup.links.map(footerLinkKey));

        expect(new Set(keys).size).toBe(keys.length);
    });

    it("opens one link group at a time on phones", async () => {
        const user = userEvent.setup();
        await renderFooter();

        const discoverToggle = group("Entdecken").getByRole("button", { name: /Entdecken/ });
        const partnersToggle = group("Partner").getByRole("button", { name: /Partner/ });
        const comparisonsToggle = group("Vergleiche").getByRole("button", { name: /Vergleiche/ });
        expect(discoverToggle).toHaveAttribute("aria-expanded", "false");
        expect(
            document.getElementById(discoverToggle.getAttribute("aria-controls") ?? ""),
        ).toHaveClass("hidden");

        await user.click(discoverToggle);
        expect(discoverToggle).toHaveAttribute("aria-expanded", "true");
        expect(
            document.getElementById(discoverToggle.getAttribute("aria-controls") ?? ""),
        ).toHaveClass("grid");

        await user.click(partnersToggle);
        expect(partnersToggle).toHaveAttribute("aria-expanded", "true");
        expect(discoverToggle).toHaveAttribute("aria-expanded", "false");

        await user.click(comparisonsToggle);
        expect(comparisonsToggle).toHaveAttribute("aria-expanded", "true");
        expect(partnersToggle).toHaveAttribute("aria-expanded", "false");
        expect(
            document.getElementById(comparisonsToggle.getAttribute("aria-controls") ?? ""),
        ).toHaveClass("grid");
    });

    it("links the social profiles in a new tab", async () => {
        await renderFooter();
        const social = group("Soziale Medien");

        const instagram = social.getByRole("link", { name: "Instagram" });
        expect(instagram).toHaveAttribute("href", "https://www.instagram.com/aura_historia/");
        expect(instagram).toHaveAttribute("target", "_blank");
        expect(social.getAllByRole("link")).toHaveLength(8);
    });

    it("shows the copyright with the current year", async () => {
        await renderFooter();

        expect(screen.getByText(`© ${new Date().getFullYear()} Aura Historia`)).toBeInTheDocument();
    });

    it("navigates to a landing page section from another route", async () => {
        const user = userEvent.setup();
        await renderFooter("/test");

        await user.click(group("Entdecken").getByRole("link", { name: "Preise" }));

        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent('"pathname":"/de"');
            expect(screen.getByTestId("location-probe")).toHaveTextContent("pricing");
        });
    });

    it("switches the language from its picker", async () => {
        const user = userEvent.setup();
        await renderFooter("/de/test");

        const trigger = screen.getByRole("button", { name: "Sprache: Deutsch" });
        expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
        await user.click(trigger);

        const listbox = await screen.findByRole("listbox", { name: "Sprache" });
        expect(within(listbox).getByRole("option", { name: /Deutsch/ })).toHaveAttribute(
            "aria-selected",
            "true",
        );
        await user.click(within(listbox).getByRole("option", { name: /English/ }));

        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent("/en/test");
            expect(changeLanguageMock).toHaveBeenCalledWith("en");
            expect(persistLanguagePreferenceMock).toHaveBeenCalledWith("en");
        });
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("picks a language with the keyboard", async () => {
        const user = userEvent.setup();
        await renderFooter("/de/test");

        await user.click(screen.getByRole("button", { name: "Sprache: Deutsch" }));
        const listbox = await screen.findByRole("listbox", { name: "Sprache" });
        expect(listbox).toHaveFocus();

        await user.keyboard("{ArrowDown}{Enter}");

        await waitFor(() => expect(changeLanguageMock).toHaveBeenCalledWith("en"));
    });

    it("searches and picks a currency", async () => {
        const user = userEvent.setup();
        await renderFooter();

        await user.click(screen.getByRole("button", { name: /^Währung: EUR/ }));
        const search = await screen.findByRole("combobox", { name: "Währungen durchsuchen…" });
        expect(search).toHaveFocus();

        await user.type(search, "usd");
        const listbox = screen.getByRole("listbox", { name: "Währung" });
        expect(within(listbox).getAllByRole("option")).toHaveLength(1);

        await user.keyboard("{Enter}");

        expect(await screen.findByRole("button", { name: /^Währung: USD/ })).toBeInTheDocument();
    });

    it("shows the empty message when no currency matches", async () => {
        const user = userEvent.setup();
        await renderFooter();

        await user.click(screen.getByRole("button", { name: /^Währung: EUR/ }));
        await user.type(
            await screen.findByRole("combobox", { name: "Währungen durchsuchen…" }),
            "zzz",
        );

        expect(screen.getByText("Keine Währung gefunden.")).toBeInTheDocument();
    });

    it("switches the unit system", async () => {
        const user = userEvent.setup();
        await renderFooter();

        await user.click(screen.getByRole("button", { name: /^Einheiten: / }));
        await user.click(await screen.findByRole("option", { name: /Imperial|Imperial/ }));

        expect(
            await screen.findByRole("button", { name: /^Einheiten: Imperial/ }),
        ).toBeInTheDocument();
    });
});
