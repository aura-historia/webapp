import PricingSection from "@/components/landing-page/pricing-section/PricingSection.tsx";
import { PRICING_TIERS } from "@/components/landing-page/pricing-section/PricingSection.data.ts";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@/hooks/preferences/useUserPreferences.tsx", () => ({
    useUserPreferences: () => ({
        preferences: { currency: "EUR" },
        updatePreferences: vi.fn(),
    }),
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

    it("renders localized plan prices", () => {
        expect(screen.getAllByText("Kostenlos")).toHaveLength(2);
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
        expect(screen.getAllByText("monatlich inkl. MwSt.")).toHaveLength(3);
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

    it("defines pricing for every supported currency on paid tiers", () => {
        for (const tier of PRICING_TIERS.filter((pricingTier) => pricingTier.prices)) {
            expect(Object.keys(tier.prices ?? {})).toEqual(CURRENCIES);
        }
    });
});
