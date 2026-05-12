import PricingSection from "@/components/landing-page/pricing-section/PricingSection.tsx";
import { PRICING_TIERS } from "@/components/landing-page/pricing-section/PricingSection.data.ts";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

type MockAuthUser = { userId: string; username: string } | null;

const createAuthMockValue = (user: MockAuthUser = null) => ({
    user,
    isLoading: false,
    signOut: vi.fn(),
});

const mockUseAuth = vi.hoisted(() => vi.fn());
const mockUseRouteContext = vi.hoisted(() => vi.fn());

const mockPostBillingManage = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/auth/useAuth", () => ({
    useAuth: mockUseAuth,
}));

vi.mock("@/routes/index.tsx", () => ({
    Route: {
        useRouteContext: mockUseRouteContext,
    },
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
    mockUseAuth.mockReturnValue(createAuthMockValue());
    mockUseRouteContext.mockReturnValue({ serverAuth: { authenticated: false, user: null } });
});

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
            const { prices, yearlyPrices } = tier;
            expect(prices).toBeDefined();
            expect(yearlyPrices).toBeDefined();

            if (!prices || !yearlyPrices) {
                continue;
            }

            for (const currency of CURRENCIES) {
                const monthly = prices[currency];
                const yearly = yearlyPrices[currency];
                // Yearly should be 10x monthly (rounded)
                expect(yearly).toBeCloseTo(monthly * 10, 0);
            }
        }
    });
});

describe("PricingSection with logged-in user", () => {
    beforeEach(async () => {
        mockUseAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );
        mockUseRouteContext.mockReturnValue({
            serverAuth: { authenticated: true, user: { userId: "test-id", username: "test-user" } },
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

describe("PricingSection billing button behavior", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseRouteContext.mockReturnValue({ serverAuth: { authenticated: false, user: null } });

        Object.defineProperty(window, "location", {
            value: { href: "" },
            writable: true,
        });
    });

    it("should navigate to login when anonymous user clicks subscribe", async () => {
        mockUseAuth.mockReturnValue(createAuthMockValue());

        await act(async () => {
            renderWithRouter(<PricingSection />);
        });

        const user = userEvent.setup();
        const subscribeButtons = screen.getAllByText("Abonnieren");

        await user.click(subscribeButtons[0]);

        expect(mockNavigate).toHaveBeenCalledWith({
            to: "/login",
            search: { redirect: "/me/billing/manage?plan=PRO&cycle=YEARLY" },
        });
        expect(mockPostBillingManage).not.toHaveBeenCalled();
    });

    it("should call billing manage with PRO plan and YEARLY cycle when clicking Pro subscribe", async () => {
        mockUseAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );
        mockUseRouteContext.mockReturnValue({
            serverAuth: { authenticated: true, user: { userId: "test-id", username: "test-user" } },
        });

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
        mockUseAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );
        mockUseRouteContext.mockReturnValue({
            serverAuth: { authenticated: true, user: { userId: "test-id", username: "test-user" } },
        });

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
        mockUseAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );
        mockUseRouteContext.mockReturnValue({
            serverAuth: { authenticated: true, user: { userId: "test-id", username: "test-user" } },
        });

        mockPostBillingManage.mockResolvedValue({
            data: { url: "https://checkout.stripe.com/c/pay/cs_test_monthly" },
            error: null,
        });

        await act(async () => {
            renderWithRouter(<PricingSection />);
        });

        const user = userEvent.setup();
        const toggle = screen.getByRole("switch");

        await user.click(toggle);

        const subscribeButtons = screen.getAllByText("Abonnieren");
        await user.click(subscribeButtons[0]);

        expect(mockPostBillingManage).toHaveBeenCalledWith({
            body: { plan: "PRO", cycle: "MONTHLY" },
        });
    });

    it("should redirect to checkout URL on successful billing manage request", async () => {
        mockUseAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );
        mockUseRouteContext.mockReturnValue({
            serverAuth: { authenticated: true, user: { userId: "test-id", username: "test-user" } },
        });

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
        mockUseAuth.mockReturnValue(
            createAuthMockValue({ userId: "test-id", username: "test-user" }),
        );
        mockUseRouteContext.mockReturnValue({
            serverAuth: { authenticated: true, user: { userId: "test-id", username: "test-user" } },
        });

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
