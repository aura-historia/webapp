import { renderWithRouter } from "@/test/utils";
import { screen, within } from "@testing-library/react";
import {
    BARNEBYS_COMPARISON_FAQ_KEYS,
    BarnebysComparisonPage,
    getBarnebysComparisonTranslationKey,
} from "../BarnebysComparisonPage";
import i18n from "@/i18n/i18nForTests";

function t(key: string) {
    return i18n.t(key);
}

describe("BarnebysComparisonPage", () => {
    it("renders localized German page copy and the main comparison sections", async () => {
        renderWithRouter(<BarnebysComparisonPage />);

        expect(
            await screen.findByRole("heading", {
                level: 1,
                name: t("compareBarnebysPage.hero.title"),
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByText(t("compareBarnebysPage.hero.quickAnswerEyebrow")),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: t("compareBarnebysPage.summary.title"),
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: t("compareBarnebysPage.scorecard.title"),
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: t("compareBarnebysPage.faq.title"),
            }),
        ).toBeInTheDocument();
    });

    it("renders source coverage, downstream advantages, and Aura technology advantages", async () => {
        renderWithRouter(<BarnebysComparisonPage />);

        expect(
            await screen.findByText(t("compareBarnebysPage.downstream.sources.auctionHouses")),
        ).toBeInTheDocument();
        expect(
            screen.getByText(t("compareBarnebysPage.downstream.sources.auctionPlatforms")),
        ).toBeInTheDocument();
        expect(
            screen.getByText(t("compareBarnebysPage.downstream.sources.antiqueDealers")),
        ).toBeInTheDocument();
        expect(
            screen.getByText(t("compareBarnebysPage.downstream.sources.privateSellers")),
        ).toBeInTheDocument();
        expect(
            screen.getByText(t("compareBarnebysPage.downstream.sources.marketplaces")),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: t("compareBarnebysPage.advantages.cards.aiForwardMatching.title"),
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: t("compareBarnebysPage.advantages.cards.nearRealTimeAlerts.title"),
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(t("compareBarnebysPage.scorecard.rows.alertSpeed.auraHistoria")),
        ).toBeInTheDocument();
    });

    it("renders every FAQ item from the exported FAQ key list", async () => {
        renderWithRouter(<BarnebysComparisonPage />);

        expect(
            await screen.findByRole("heading", { name: t("compareBarnebysPage.faq.title") }),
        ).toBeInTheDocument();

        for (const faqKey of BARNEBYS_COMPARISON_FAQ_KEYS) {
            expect(
                screen.getByRole("heading", {
                    name: t(`compareBarnebysPage.faq.items.${faqKey}.question`),
                }),
            ).toBeInTheDocument();
            expect(
                screen.getByText(t(`compareBarnebysPage.faq.items.${faqKey}.answer`)),
            ).toBeInTheDocument();
        }
    });

    it("uses internal CTAs and never links to Barnebys", async () => {
        const { container } = renderWithRouter(<BarnebysComparisonPage />);

        const primaryCta = await screen.findByRole("link", {
            name: t("compareBarnebysPage.hero.primaryCta"),
        });
        expect(primaryCta).toHaveAttribute("href", "/de");

        const secondaryCta = screen.getByRole("link", {
            name: t("compareBarnebysPage.hero.secondaryCta"),
        });
        expect(secondaryCta).toHaveAttribute("href", "#scorecard");

        const finalCta = screen.getByRole("link", {
            name: t("compareBarnebysPage.finalCta.button"),
        });
        expect(finalCta).toHaveAttribute("href", "/de");

        const links = within(container).queryAllByRole("link");
        expect(links).toHaveLength(3);
        expect(container.querySelectorAll('a[href*="barnebys" i]')).toHaveLength(0);
    });

    it("builds comparison translation keys", () => {
        expect(getBarnebysComparisonTranslationKey("hero.title")).toBe(
            "compareBarnebysPage.hero.title",
        );
    });
});
