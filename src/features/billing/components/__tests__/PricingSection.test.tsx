import PricingSection from "@/features/billing/components/PricingSection.tsx";
import {
    type PaidPricingTier,
    PRICING_TIERS,
} from "@/features/billing/components/PricingSection.data.ts";
import { CURRENCIES, type Currency } from "@/data/internal/common/Currency.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

/** The Stripe catalogue aligned on 26 October 2026: [Pro monthly, Pro yearly, Ultimate monthly, Ultimate yearly]. */
const STRIPE_PRICES: Record<Currency, readonly [number, number, number, number]> = {
    AED: [59.9, 599, 149.9, 1499],
    ARS: [21990, 219900, 54990, 549900],
    AUD: [22.9, 229, 59.9, 599],
    BRL: [79.9, 799, 199.9, 1999],
    CAD: [22.9, 229, 59.9, 599],
    CHF: [15.9, 159, 39.9, 399],
    CNY: [109.9, 1099, 279.9, 2799],
    CZK: [329.9, 3299, 899.9, 8999],
    DKK: [109.9, 1099, 279.9, 2799],
    EUR: [13.9, 139, 34.9, 349],
    GBP: [11.9, 119, 29.9, 299],
    HKD: [119.9, 1199, 319.9, 3199],
    HUF: [4990, 49900, 11990, 119900],
    INR: [1299, 12990, 3299, 32990],
    JPY: [1900, 19000, 6499, 64990],
    KRW: [21900, 219000, 54900, 549000],
    MXN: [249.9, 2499, 649.9, 6499],
    NOK: [159.9, 1599, 399.9, 3999],
    NZD: [27.9, 279, 69.9, 699],
    PLN: [54.9, 549, 149.9, 1499],
    RON: [69.9, 699, 179.9, 1799],
    RUB: [1289.9, 12899, 3299.9, 32999],
    SAR: [59.9, 599, 149.9, 1499],
    SEK: [169.9, 1699, 429.9, 4299],
    SGD: [19.9, 199, 54.9, 549],
    THB: [499, 4990, 1199, 11990],
    TRY: [689.9, 6899, 1899.9, 18999],
    TWD: [549, 5490, 1399, 13990],
    USD: [17.9, 179, 39.9, 399],
    ZAR: [229.9, 2299, 599.9, 5999],
};

function paidTier(id: PaidPricingTier["id"]): PaidPricingTier {
    const tier = PRICING_TIERS.find((pricingTier) => pricingTier.id === id);
    if (tier?.id !== id) throw new Error(`Missing ${id} tier`);
    return tier as PaidPricingTier;
}

/** The formatted number in a price, e.g. "1.082,50" from "1.082,50 ₹". */
function amountIn(text: string | undefined): string | undefined {
    return text?.match(/\d[\d.,]*/)?.[0];
}

/** The large current price of each plan card, in card order. */
function displayedPrices(): string[] {
    return Array.from(document.querySelectorAll("article span.font-serif")).map(
        (element) => element.textContent ?? "",
    );
}

type MockAuthUser = { userId: string; username: string } | null;

const createAuthMockValue = (user: MockAuthUser = null) => ({
    user,
    isAuthenticated: !!user,
    isLoading: false,
    isResolved: true,
    signOut: vi.fn(),
});

const mockUseResolvedAuth = vi.hoisted(() => vi.fn());

const mockPostBillingManage = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("@/features/authentication/hooks/useResolvedAuth", () => ({
    useResolvedAuth: mockUseResolvedAuth,
}));

vi.mock("@/client", () => ({
    postBillingManage: mockPostBillingManage,
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("@/hooks/common/useApiError", () => ({
    useApiError: () => ({
        getErrorMessage: () => "An error occurred",
    }),
}));

vi.mock("@/data/internal/hooks/ApiError", () => ({
    mapToInternalApiError: (error: unknown) => error,
}));

beforeEach(() => {
    mockUseResolvedAuth.mockReturnValue(createAuthMockValue());
});

describe("PricingSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<PricingSection />);
        });
    });

    it("renders the chapter heading with its italic closing phrase", () => {
        expect(screen.getByText("V — Preise")).toBeInTheDocument();
        const heading = screen.getByRole("heading", { level: 2 });
        expect(heading).toHaveTextContent("Wählen Sie Ihren Zugang.");
        expect(heading.querySelector("em")).toHaveTextContent("Zugang.");
    });

    it("renders the section subtitle", () => {
        expect(
            screen.getByText(
                "Starten Sie kostenlos. Wechseln Sie, sobald Merklisten, Suchaufträge und Marktbeobachtung zu Ihrer regelmäßigen Recherche gehören.",
            ),
        ).toBeInTheDocument();
    });

    it("renders all three tier names", () => {
        expect(screen.getByRole("heading", { name: "Kostenlos" })).toBeInTheDocument();
        expect(screen.getByText("Pro")).toBeInTheDocument();
        expect(screen.getByText("Ultimate")).toBeInTheDocument();
    });

    it("renders all tier descriptions", () => {
        expect(
            screen.getByText(
                "Für erste Recherchen, spontane Funde und eine kleine private Auswahl.",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Für Sammler, die ernsthafte Kandidaten über Anbieter und Zeit hinweg verfolgen.",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Für anspruchsvolle Sammler, Interior-Profis und Fachleute, die genau beschreiben, wonach sie suchen.",
            ),
        ).toBeInTheDocument();
    });

    it("renders the billing toggle with yearly pre-selected", () => {
        expect(screen.getByText("Monatlich")).toBeInTheDocument();
        expect(screen.getByText("Jährlich")).toBeInTheDocument();
        expect(screen.getByText("2 Monate sparen")).toBeInTheDocument();

        expect(screen.getByRole("group", { name: "Abrechnungszeitraum" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Jährlich/ })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByRole("button", { name: "Monatlich" })).toHaveAttribute(
            "aria-pressed",
            "false",
        );
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
        const struckPrices = Array.from(document.querySelectorAll("s")).map(
            (element) => element.textContent,
        );
        expect(struckPrices).toEqual([
            `Regulärer Monatspreis: ${germanProMonthly}`,
            `Regulärer Monatspreis: ${germanUltimateMonthly}`,
        ]);
    });

    it("renders yearly billing note when yearly is selected", () => {
        expect(
            screen.getAllByText("pro Monat, jährlich abgerechnet, inkl. MwSt.").length,
        ).toBeGreaterThanOrEqual(2);
    });

    it("switches to monthly prices when monthly billing is chosen", async () => {
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: "Monatlich" }));

        expect(document.querySelectorAll("s")).toHaveLength(0);

        const germanProPrice = new Intl.NumberFormat("de", {
            style: "currency",
            currency: "EUR",
        }).format(13.9);
        const germanUltimatePrice = new Intl.NumberFormat("de", {
            style: "currency",
            currency: "EUR",
        }).format(34.9);

        expect(
            screen.getByText(
                (_, element) =>
                    element?.textContent === germanProPrice && element?.tagName === "SPAN",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                (_, element) =>
                    element?.textContent === germanUltimatePrice && element?.tagName === "SPAN",
            ),
        ).toBeInTheDocument();

        expect(screen.getAllByText("pro Monat inkl. MwSt.").length).toBeGreaterThanOrEqual(2);
    });

    it("renders the most popular badge on the Pro tier", () => {
        expect(screen.getByText("Am beliebtesten")).toBeInTheDocument();
    });

    it("renders free tier features", () => {
        expect(screen.getByText("20 Objekte in der privaten Merkliste")).toBeInTheDocument();
        expect(screen.getByText("1 aktiver Suchauftrag")).toBeInTheDocument();
        expect(
            screen.getByText("10 Trefferbenachrichtigungen aus Suchaufträgen pro Monat"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Suchaufträge nach Suchbegriff, Verfügbarkeit und Preisspanne"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Abgleich anhand von Titel und Beschreibung des Angebots"),
        ).toBeInTheDocument();
    });

    it("renders pro tier features", () => {
        expect(screen.getByText("100 Objekte in der privaten Merkliste")).toBeInTheDocument();
        expect(screen.getByText("5 aktive Suchaufträge")).toBeInTheDocument();
        expect(
            screen.getByText("Abgleich anhand des Angebotstexts und bis zu 1 Bild"),
        ).toBeInTheDocument();
    });

    it("renders ultimate tier features", () => {
        expect(screen.getByText("Unbegrenzte Merkliste")).toBeInTheDocument();
        expect(screen.getByText("Unbegrenzt viele aktive Suchaufträge")).toBeInTheDocument();
        expect(
            screen.getByText("Abgleich anhand des Angebotstexts und bis zu 4 Bildern"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Detaillierte Suchanweisungen für den Abgleich per KI-Agent"),
        ).toBeInTheDocument();
    });

    it("renders unlimited ordinary search for every tier", () => {
        expect(
            screen.getAllByText("Unbegrenzte Suche über alle indexierten Anbieter"),
        ).toHaveLength(3);
    });

    it("renders unlimited match notifications and the full alert criteria for both paid tiers", () => {
        expect(
            screen.getAllByText("Unbegrenzte Trefferbenachrichtigungen aus Suchaufträgen"),
        ).toHaveLength(2);
        expect(
            screen.getAllByText(
                "Suchaufträge auch nach Anbieter, Auktion, Datum, Standort und Versand",
            ),
        ).toHaveLength(2);
    });

    it("offers custom search instructions only on the ultimate tier", () => {
        const instructions = screen.getByText(
            "Detaillierte Suchanweisungen für den Abgleich per KI-Agent",
        );
        expect(instructions.closest("article")).toHaveAttribute(
            "aria-labelledby",
            "pricing-ultimate",
        );
    });

    it("does not promise notification timing or priority, and names an agent only on Ultimate", () => {
        expect(screen.queryByText(/Echtzeit|innerhalb weniger Stunden|Priorisiert/)).toBeNull();
        const agentRows = screen.getAllByText(/Agent/);
        expect(agentRows).toHaveLength(1);
        expect(agentRows[0].closest("article")).toHaveAttribute(
            "aria-labelledby",
            "pricing-ultimate",
        );
        expect(screen.queryByText("Vertiefte Marktbeobachtung")).toBeNull();
        expect(screen.queryByText("Einfache Marktbeobachtung")).toBeNull();
    });

    it("does not render text or hybrid search plan wording", () => {
        expect(screen.queryByText("Klassische Textsuche")).not.toBeInTheDocument();
        expect(
            screen.queryByText("Hybridsuche – findet Treffer nach Stichwort und Bedeutung"),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText("Hybridsuche (Textbasiert + Semantisch)"),
        ).not.toBeInTheDocument();
    });

    it("renders check icons for all features", () => {
        // Free: 6, Pro: 6, Ultimate: 7 = 19 total features
        const checkIcons = document.querySelectorAll("li");
        expect(checkIcons).toHaveLength(19);
    });

    it("highlights the custom search instructions feature", () => {
        const instructions = screen.getByText(
            "Detaillierte Suchanweisungen für den Abgleich per KI-Agent",
        );
        const listItem = instructions.closest("li");
        expect(listItem?.className).toContain("font-semibold");
        expect(listItem?.className).toContain("text-ink");
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

    it("prices both paid tiers in every supported currency", () => {
        for (const tier of PRICING_TIERS) {
            if (tier.id === "free") continue;
            expect(Object.keys(tier.prices).sort()).toEqual([...CURRENCIES].sort());
            expect(Object.keys(tier.yearlyPrices).sort()).toEqual([...CURRENCIES].sort());
        }
        expect(Object.keys(STRIPE_PRICES).sort()).toEqual([...CURRENCIES].sort());
    });

    it.each(CURRENCIES)("matches the Stripe catalogue amounts for %s", (currency) => {
        const [proMonthly, proYearly, ultimateMonthly, ultimateYearly] = STRIPE_PRICES[currency];
        expect(paidTier("pro").prices[currency]).toBe(proMonthly);
        expect(paidTier("pro").yearlyPrices[currency]).toBe(proYearly);
        expect(paidTier("ultimate").prices[currency]).toBe(ultimateMonthly);
        expect(paidTier("ultimate").yearlyPrices[currency]).toBe(ultimateYearly);
    });

    it("charges exactly ten monthly prices for a year (2-month discount)", () => {
        for (const tier of PRICING_TIERS) {
            if (tier.id === "free") continue;
            for (const currency of CURRENCIES) {
                expect(tier.yearlyPrices[currency]).toBeCloseTo(tier.prices[currency] * 10, 6);
            }
        }
    });
});

describe("Pricing and search-instruction copy", () => {
    it.each(["de", "en", "es", "fr", "it"])(
        "promises no notification timing or priority, and names an agent only on the Ultimate row, in %s",
        async (lng) => {
            const { default: translation } = await import(`@/i18n/locales/${lng}/translation.json`);
            const copy = JSON.stringify([
                translation.landingPage.pricing,
                translation.landingPage.platform.agent.kicker,
                translation.landingPage.platform.agent.title,
                translation.landingPage.platform.agent.body,
                translation.landingPage.platform.agent.demoLabel,
                translation.landingPage.platform.alerts.title,
                translation.header.sections.agent,
            ]);
            expect(copy).not.toMatch(
                /real-time|Echtzeit|tiempo real|temps réel|tempo reale|priorit|few hours|weniger Stunden|pocas horas|quelques heures|poche ore/i,
            );
            const agentRow = JSON.stringify(
                translation.landingPage.pricing.ultimate.features.searchInstructions,
            ).slice(1, -1);
            expect(agentRow).toMatch(/agent/i);
            expect(copy.replace(agentRow, "")).not.toMatch(/agent/i);
        },
    );
});

describe("PricingSection currency preference", () => {
    const renderWithCurrency = async (currency: string) => {
        localStorage.setItem("user-preferences", JSON.stringify({ currency }));
        await act(async () => {
            renderWithRouter(<PricingSection />);
        });
    };

    afterEach(() => {
        localStorage.clear();
    });

    it.each(CURRENCIES)(
        "renders %s prices for both cycles without a fallback",
        async (currency) => {
            await renderWithCurrency(currency);
            const user = userEvent.setup();

            const yearly = displayedPrices();
            expect(yearly).toHaveLength(3);
            expect(yearly[0]).toBe(
                new Intl.NumberFormat("de", {
                    style: "currency",
                    currency,
                    minimumFractionDigits: 0,
                }).format(0),
            );
            await user.click(screen.getByRole("button", { name: "Monatlich" }));
            const monthly = displayedPrices();

            for (const text of [...yearly, ...monthly]) {
                expect(text).not.toMatch(/NaN|undefined/);
                expect(text).toMatch(/\d/);
            }
            if (currency !== "EUR") {
                expect(document.body.textContent).not.toMatch(/€/);
            }
        },
    );

    it.each([
        // [currency, Pro yearly per month, Pro monthly, Ultimate yearly per month, Ultimate monthly]
        ["DKK", "91,58", "109,90", "233,25", "279,90"],
        ["NOK", "133,25", "159,90", "333,25", "399,90"],
        ["INR", "1.082,50", "1.299", "2.749,17", "3.299"],
        ["HUF", "4.158,33", "4.990", "9.991,67", "11.990"],
        ["TWD", "457,50", "549", "1.165,83", "1.399"],
        ["KRW", "18.250", "21.900", "45.750", "54.900"],
        ["JPY", "1.583", "1.900", "5.416", "6.499"],
        ["ARS", "18.325", "21.990", "45.825", "54.990"],
    ] as const)(
        "formats %s per-month equivalents and monthly prices at charge precision",
        async (currency, proYearly, proMonthly, ultimateYearly, ultimateMonthly) => {
            await renderWithCurrency(currency);
            const user = userEvent.setup();

            const [, pro, ultimate] = displayedPrices();
            expect(amountIn(pro)).toBe(proYearly);
            expect(amountIn(ultimate)).toBe(ultimateYearly);
            const struck = Array.from(document.querySelectorAll("s")).map(
                (element) => element.textContent ?? "",
            );
            expect(amountIn(struck[0])).toBe(proMonthly);
            expect(amountIn(struck[1])).toBe(ultimateMonthly);

            await user.click(screen.getByRole("button", { name: "Monatlich" }));
            const [, proMonth, ultimateMonth] = displayedPrices();
            expect(amountIn(proMonth)).toBe(proMonthly);
            expect(amountIn(ultimateMonth)).toBe(ultimateMonthly);
        },
    );

    it("falls back to EUR for an unsupported stored currency", async () => {
        await renderWithCurrency("XYZ");

        const [, pro] = displayedPrices();
        expect(pro).toBe(
            new Intl.NumberFormat("de", { style: "currency", currency: "EUR" }).format(139 / 12),
        );
    });
});

describe("PricingSection with logged-in user", () => {
    beforeEach(async () => {
        mockUseResolvedAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );

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

describe("PricingSection with client-only persisted session", () => {
    beforeEach(async () => {
        mockUseResolvedAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );

        await act(async () => {
            renderWithRouter(<PricingSection />);
        });
    });

    it("treats the free tier as active when Cloudflare prerender auth is anonymous", () => {
        const freeButton = screen.getByText("Kostenlos starten");
        const button = freeButton.closest("button");
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
        expect(freeButton.closest("a")).not.toBeInTheDocument();
    });
});

describe("PricingSection while auth is restoring", () => {
    beforeEach(async () => {
        mockUseResolvedAuth.mockReturnValue({
            ...createAuthMockValue(),
            isLoading: true,
            isResolved: false,
        });

        await act(async () => {
            renderWithRouter(<PricingSection />);
        });
    });

    it("does not render the free tier CTA as a login link before auth resolves", () => {
        const freeButton = screen.getByText("Kostenlos starten");
        const button = freeButton.closest("button");
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
        expect(freeButton.closest("a")).not.toBeInTheDocument();
    });
});

describe("PricingSection billing button behavior", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        Object.defineProperty(window, "location", {
            value: { href: "" },
            writable: true,
        });
    });

    it("should navigate to login when anonymous user clicks subscribe", async () => {
        mockUseResolvedAuth.mockReturnValue(createAuthMockValue());

        await act(async () => {
            renderWithRouter(<PricingSection />);
        });

        const user = userEvent.setup();
        const subscribeButtons = screen.getAllByText("Abonnieren");

        await user.click(subscribeButtons[0]);

        expect(mockNavigate).toHaveBeenCalledWith({
            to: "/$lng/login",
            search: { redirect: "/de/me/billing/manage?plan=PRO&cycle=YEARLY" },
        });
        expect(mockPostBillingManage).not.toHaveBeenCalled();
    });

    it("should call billing manage with PRO plan and YEARLY cycle when clicking Pro subscribe", async () => {
        mockUseResolvedAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );

        mockPostBillingManage.mockResolvedValue({
            data: { url: "https://checkout.stripe.com/c/pay/cs_test_123" },
            error: null,
        });

        await act(async () => {
            renderWithRouter(<PricingSection />);
        });

        const user = userEvent.setup();
        const subscribeButtons = screen.getAllByText("Abonnieren");

        await user.click(subscribeButtons[0]);

        expect(mockPostBillingManage).toHaveBeenCalledWith({
            body: { plan: "PRO", cycle: "YEARLY" },
        });
    });

    it("should call billing manage with ULTIMATE plan and YEARLY cycle when clicking Ultimate subscribe", async () => {
        mockUseResolvedAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );

        mockPostBillingManage.mockResolvedValue({
            data: { url: "https://checkout.stripe.com/c/pay/cs_test_456" },
            error: null,
        });

        await act(async () => {
            renderWithRouter(<PricingSection />);
        });

        const user = userEvent.setup();
        const subscribeButtons = screen.getAllByText("Abonnieren");

        await user.click(subscribeButtons[1]);

        expect(mockPostBillingManage).toHaveBeenCalledWith({
            body: { plan: "ULTIMATE", cycle: "YEARLY" },
        });
    });

    it("should call billing manage with MONTHLY cycle after switching to monthly billing", async () => {
        mockUseResolvedAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );

        mockPostBillingManage.mockResolvedValue({
            data: { url: "https://checkout.stripe.com/c/pay/cs_test_monthly" },
            error: null,
        });

        await act(async () => {
            renderWithRouter(<PricingSection />);
        });

        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: "Monatlich" }));

        const subscribeButtons = screen.getAllByText("Abonnieren");
        await user.click(subscribeButtons[0]);

        expect(mockPostBillingManage).toHaveBeenCalledWith({
            body: { plan: "PRO", cycle: "MONTHLY" },
        });
    });

    it("should redirect to checkout URL on successful billing manage request", async () => {
        mockUseResolvedAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );

        mockPostBillingManage.mockResolvedValue({
            data: { url: "https://checkout.stripe.com/c/pay/cs_test_redirect" },
            error: null,
        });

        await act(async () => {
            renderWithRouter(<PricingSection />);
        });

        const user = userEvent.setup();
        const subscribeButtons = screen.getAllByText("Abonnieren");

        await user.click(subscribeButtons[0]);

        expect(mockNavigate).toHaveBeenCalledWith({
            href: "https://checkout.stripe.com/c/pay/cs_test_redirect",
        });
    });

    it("should redirect to portal URL when billing manage returns portal session", async () => {
        mockUseResolvedAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );

        mockPostBillingManage.mockResolvedValue({
            data: { url: "https://billing.stripe.com/p/session/test_portal" },
            error: null,
        });

        await act(async () => {
            renderWithRouter(<PricingSection />);
        });

        const user = userEvent.setup();
        const subscribeButtons = screen.getAllByText("Abonnieren");

        await user.click(subscribeButtons[0]);

        expect(mockPostBillingManage).toHaveBeenCalledWith({
            body: { plan: "PRO", cycle: "YEARLY" },
        });
        expect(mockNavigate).toHaveBeenCalledWith({
            href: "https://billing.stripe.com/p/session/test_portal",
        });
    });
});
