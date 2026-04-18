import PricingSection from "@/components/landing-page/pricing-section/PricingSection.tsx";
import { PRICING_TIERS } from "@/components/landing-page/pricing-section/PricingSection.data.ts";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

const mockUseAuthenticator = vi.hoisted(() =>
    vi.fn(() => ({
        user: null as any,
        toSignUp: vi.fn(),
    })),
);

vi.mock("@/hooks/preferences/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({
        preferences: { currency: "EUR" },
        updatePreferences: vi.fn(),
    }),
}));

vi.mock("@aws-amplify/ui-react", () => ({
    useAuthenticator: mockUseAuthenticator,
}));

describe("PricingSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<PricingSection />);
        });
    });

    it("renders the section heading", () => {
        expect(screen.getByText("Wählen Sie Ihren Plan")).toBeInTheDocument();
    });

    it("renders the section subtitle", () => {
        expect(
            screen.getByText(
                "Von Gelegenheitssammlern bis zu professionellen Händlern – wir haben den richtigen Plan für Sie.",
            ),
        ).toBeInTheDocument();
    });

    it("renders all three tier names", () => {
        expect(screen.getAllByText("Kostenlos")).toHaveLength(2);
        expect(screen.getByText("Pro")).toBeInTheDocument();
        expect(screen.getByText("Ultimate")).toBeInTheDocument();
    });

    it("renders all tier descriptions", () => {
        expect(
            screen.getByText("Perfekt für den Einstieg in die Welt der Antiquitäten."),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Für engagierte Sammler, die mehr entdecken möchten."),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Für Profis, die das volle Potenzial nutzen wollen."),
        ).toBeInTheDocument();
    });

    it("renders the billing toggle with yearly pre-selected", () => {
        expect(screen.getByText("Monatlich")).toBeInTheDocument();
        expect(screen.getByText("Jährlich")).toBeInTheDocument();
        expect(screen.getByText("2 Monate sparen")).toBeInTheDocument();

        const toggle = screen.getByRole("switch");
        expect(toggle).toBeInTheDocument();
        expect(toggle).toHaveAttribute("data-state", "checked");
    });

    it("renders yearly equivalent prices by default (yearly pre-selected)", () => {
        // Yearly is pre-selected, so we should see yearly per-month equivalent prices
        // Pro yearly: 139 EUR / 12 = ~11.58 EUR
        const proYearlyPerMonth = new Intl.NumberFormat("de", {
            style: "currency",
            currency: "EUR",
        }).format(139 / 12);

        const ultimateYearlyPerMonth = new Intl.NumberFormat("de", {
            style: "currency",
            currency: "EUR",
        }).format(349 / 12);

        expect(
            screen.getByText((_, element) => element?.textContent === proYearlyPerMonth),
        ).toBeInTheDocument();
        expect(
            screen.getByText((_, element) => element?.textContent === ultimateYearlyPerMonth),
        ).toBeInTheDocument();
    });

    it("renders strikethrough monthly prices when yearly is selected", () => {
        const germanProMonthly = new Intl.NumberFormat("de", {
            style: "currency",
            currency: "EUR",
        }).format(13.9);

        const germanUltimateMonthly = new Intl.NumberFormat("de", {
            style: "currency",
            currency: "EUR",
        }).format(34.9);

        // Strikethrough prices should be present
        const proStrikethrough = screen.getByText(
            (_, element) =>
                element?.textContent === germanProMonthly &&
                element?.classList.contains("line-through") === true,
        );
        expect(proStrikethrough).toBeInTheDocument();

        const ultimateStrikethrough = screen.getByText(
            (_, element) =>
                element?.textContent === germanUltimateMonthly &&
                element?.classList.contains("line-through") === true,
        );
        expect(ultimateStrikethrough).toBeInTheDocument();
    });

    it("renders yearly billing note when yearly is selected", () => {
        expect(
            screen.getAllByText("pro Monat, jährlich abgerechnet, inkl. MwSt.").length,
        ).toBeGreaterThanOrEqual(2);
    });

    it("switches to monthly prices when toggle is clicked", async () => {
        const user = userEvent.setup();
        const toggle = screen.getByRole("switch");

        await user.click(toggle);

        const germanProPrice = new Intl.NumberFormat("de", {
            style: "currency",
            currency: "EUR",
        }).format(13.9);
        const germanUltimatePrice = new Intl.NumberFormat("de", {
            style: "currency",
            currency: "EUR",
        }).format(34.9);

        expect(
            screen.getByText((_, element) => element?.textContent === germanProPrice),
        ).toBeInTheDocument();
        expect(
            screen.getByText((_, element) => element?.textContent === germanUltimatePrice),
        ).toBeInTheDocument();

        expect(screen.getAllByText("pro Monat inkl. MwSt.").length).toBeGreaterThanOrEqual(2);
    });

    it("renders the most popular badge on the Pro tier", () => {
        expect(screen.getByText("Am beliebtesten")).toBeInTheDocument();
    });

    it("renders free tier features", () => {
        expect(screen.getByText("20 Artikel auf der Merkliste")).toBeInTheDocument();
        expect(screen.getByText("1 Suchauftrag")).toBeInTheDocument();
        expect(screen.getByText("10 Suchauftrag-Treffer pro Monat")).toBeInTheDocument();
        expect(screen.getByText("Einfache Suchaufträge")).toBeInTheDocument();
        expect(screen.getByText("Benachrichtigung innerhalb weniger Stunden")).toBeInTheDocument();
        expect(screen.getByText("Klassische Textsuche")).toBeInTheDocument();
    });

    it("renders pro tier features", () => {
        expect(screen.getByText("100 Artikel auf der Merkliste")).toBeInTheDocument();
        expect(screen.getByText("5 Suchaufträge")).toBeInTheDocument();
    });

    it("renders ultimate tier features", () => {
        expect(screen.getByText("Unbegrenzte Merkliste")).toBeInTheDocument();
        expect(screen.getByText("Unbegrenzte Suchaufträge")).toBeInTheDocument();
        expect(screen.getByText("KI-Suchagent")).toBeInTheDocument();
        expect(screen.getByText("Echtzeit-Benachrichtigungen mit Priorität")).toBeInTheDocument();
    });

    it("renders full search alerts for both pro and ultimate tiers", () => {
        const fullAlerts = screen.getAllByText("Erweiterte Suchaufträge");
        expect(fullAlerts).toHaveLength(2);
    });

    it("renders hybrid search descriptions", () => {
        expect(
            screen.getByText("Hybridsuche – findet Treffer nach Stichwort und Bedeutung"),
        ).toBeInTheDocument();
        expect(screen.getByText("Hybridsuche (Textbasiert + Semantisch)")).toBeInTheDocument();
    });

    it("renders check icons for all features", () => {
        // Free: 6, Pro: 6, Ultimate: 7 = 19 total features
        const checkIcons = document.querySelectorAll("li");
        expect(checkIcons.length).toBe(19);
    });

    it("highlights the AI Search Agent feature", () => {
        const aiAgentText = screen.getByText("KI-Suchagent");
        const listItem = aiAgentText.closest("li");
        expect(listItem?.className).toContain("font-semibold");
        expect(listItem?.className).toContain("text-primary");
    });

    it("renders CTA buttons for all tiers", () => {
        // Free tier has a link button to /login, paid tiers have regular buttons
        expect(screen.getByText("Kostenlos starten")).toBeInTheDocument();
        expect(screen.getAllByText("Abonnieren")).toHaveLength(2);
    });

    it("renders the free tier CTA as a link to /login when user is not logged in", () => {
        const freeButton = screen.getByText("Kostenlos starten");
        const link = freeButton.closest("a");
        expect(link).toBeInTheDocument();
        expect(link?.getAttribute("href")).toContain("/login");
    });

    it("renders subscribe buttons for paid tiers", () => {
        const subscribeButtons = screen.getAllByText("Abonnieren");
        expect(subscribeButtons).toHaveLength(2);
        for (const btn of subscribeButtons) {
            expect(btn.closest("button")).toBeInTheDocument();
        }
    });

    it("defines pricing for every supported currency on paid tiers", () => {
        for (const tier of PRICING_TIERS.filter((pricingTier) => pricingTier.prices)) {
            expect(Object.keys(tier.prices ?? {})).toEqual(CURRENCIES);
        }
    });

    it("defines yearly pricing for every supported currency on paid tiers", () => {
        for (const tier of PRICING_TIERS.filter((pricingTier) => pricingTier.yearlyPrices)) {
            expect(Object.keys(tier.yearlyPrices ?? {})).toEqual(CURRENCIES);
        }
    });

    it("yearly prices equal 10x monthly prices (2-month discount)", () => {
        for (const tier of PRICING_TIERS.filter(
            (pricingTier) => pricingTier.prices && pricingTier.yearlyPrices,
        )) {
            for (const currency of CURRENCIES) {
                const monthly = tier.prices![currency];
                const yearly = tier.yearlyPrices![currency];
                // Yearly should be 10x monthly (rounded)
                expect(yearly).toBeCloseTo(monthly * 10, 0);
            }
        }
    });
});

describe("PricingSection with logged-in user", () => {
    beforeEach(async () => {
        mockUseAuthenticator.mockReturnValue({
            user: { username: "test-user" },
            toSignUp: vi.fn(),
        });

        await act(async () => {
            renderWithRouter(<PricingSection />);
        });
    });

    it("renders the free tier CTA as a disabled button when user is logged in", () => {
        const freeButton = screen.getByText("Kostenlos starten");
        const button = freeButton.closest("button");
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });
});
