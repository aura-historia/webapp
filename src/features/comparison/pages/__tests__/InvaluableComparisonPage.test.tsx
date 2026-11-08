import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import {
    getComparisonChapters,
    getComparisonFaq,
    getComparisonNav,
} from "@/features/comparison/config/comparisonDefinition.ts";
import { COMPARISON_REGISTRY } from "@/features/comparison/config/comparisonRegistry.ts";
import { INVALUABLE_COMPARISON } from "@/features/comparison/config/invaluableComparison.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";
import {
    BANNED_WORDING,
    type LocaleCode,
    LOCALES,
    leafEntries,
    leaves,
} from "@/features/comparison/pages/__tests__/comparisonCopyRules.ts";
import i18n from "@/i18n/i18nForTests";
import { renderWithRouter } from "@/test/utils";

function t(key: string) {
    return i18n.t(key);
}

function plain(key: string) {
    return t(key).replace(/<\/?(em|strong)>/g, "");
}

async function renderPage() {
    let result: ReturnType<typeof renderWithRouter> | undefined;
    await act(async () => {
        result = renderWithRouter(<ComparisonPage definition={INVALUABLE_COMPARISON} />);
    });
    return result as ReturnType<typeof renderWithRouter>;
}

describe("ComparisonPage with the Invaluable definition", () => {
    it("renders one h1 and an h2 with an id for every chapter, with 'together' instead of 'alerts'", async () => {
        const { container } = await renderPage();

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: plain("compareInvaluablePage.hero.title"),
            }),
        ).toBeInTheDocument();

        const ids = getComparisonChapters(INVALUABLE_COMPARISON);
        expect(ids).toEqual([
            "summary",
            "respect",
            "advantages",
            "scorecard",
            "sources",
            "together",
            "faq",
            "verdict",
        ]);
        for (const sectionId of ids) {
            const section = container.querySelector(`section#${sectionId}`);
            expect(section).not.toBeNull();
            const headingId = section?.getAttribute("aria-labelledby") ?? "";
            expect(section?.querySelector(`h2#${headingId}`)).not.toBeNull();
        }
        expect(container.querySelector("section#alerts")).toBeNull();
    });

    it("derives the nav from the definition and labels the 'together' chapter from its copy", async () => {
        await renderPage();

        const nav = screen.getByRole("navigation", { name: t("comparison.nav.label") });
        const links = within(nav).getAllByRole("link");

        expect(links.map((link) => link.getAttribute("href"))).toEqual([
            "#summary",
            "#advantages",
            "#scorecard",
            "#sources",
            "#together",
            "#faq",
            "#verdict",
        ]);
        expect(
            within(nav).getByRole("link", {
                name: plain("compareInvaluablePage.nav.items.together"),
            }),
        ).toHaveAttribute("href", "#together");
        expect(getComparisonNav(INVALUABLE_COMPARISON).map((item) => item.marker)).toEqual([
            "I",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "→",
        ]);
    });

    it("renders the 'together' chapter from its own copy", async () => {
        const { container } = await renderPage();

        const together = container.querySelector("section#together");
        expect(together?.querySelector("h2#comparison-together-heading")).toHaveTextContent(
            plain("compareInvaluablePage.together.title"),
        );
        expect(together).toHaveTextContent(t("compareInvaluablePage.together.paragraph1"));
        expect(together).toHaveTextContent(t("compareInvaluablePage.together.paragraph2"));
    });

    it("concedes the bidding verdict to Invaluable in the quick answer", async () => {
        await renderPage();

        const quickAnswer = screen.getByRole("region", {
            name: plain("compareInvaluablePage.hero.quickAnswerTitle"),
        });
        expect(quickAnswer.tagName).toBe("SECTION");
        expect(within(quickAnswer).getByText("Fazit:").tagName).toBe("STRONG");
        expect(within(quickAnswer).getAllByRole("definition")).toHaveLength(4);

        const badges = [...quickAnswer.querySelectorAll("[data-winner]")];
        expect(badges.map((badge) => badge.getAttribute("data-winner"))).toEqual([
            "competitor",
            "aura",
            "aura",
            "aura",
        ]);
        expect(badges[0]).toHaveTextContent("Invaluable");
    });

    it("concedes bidding and reach to Invaluable and rates prices and languages a tie", async () => {
        await renderPage();

        const table = screen.getByRole("table", {
            name: t("compareInvaluablePage.scorecard.caption"),
        });
        const columnHeaders = within(table).getAllByRole("columnheader");
        expect(columnHeaders).toHaveLength(3);
        expect(columnHeaders[1]).toHaveTextContent("Invaluable");
        const rowHeaders = within(table).getAllByRole("rowheader");
        expect(rowHeaders).toHaveLength(7);

        // The rendered badge in each criterion cell pins who the row goes to.
        const winners = ["competitor", "competitor", "aura", "aura", "aura", "tie", "tie"];
        INVALUABLE_COMPARISON.scorecardRows.forEach((row, index) => {
            const header = rowHeaders[index];
            expect(row.winner).toBe(winners[index]);
            expect(header).toHaveTextContent(
                t(`compareInvaluablePage.scorecard.rows.${row.key}.criterion`),
            );
            expect(header).toHaveTextContent(
                t(`compareInvaluablePage.scorecard.rows.${row.key}.verdict`),
            );
            // The verdict line marks Aura Historia with a check and a tie with an equals sign;
            // the competitor's rows carry no mark.
            const mark = header.querySelector("svg");
            const expectedMark = { aura: "lucide-check", tie: "lucide-equal", competitor: null }[
                row.winner
            ];
            if (expectedMark) {
                expect(mark).toHaveClass(expectedMark);
            } else {
                expect(mark).toBeNull();
            }

            const cells = within(header.closest("tr") as HTMLElement).getAllByRole("cell");
            expect(cells[0]).toHaveTextContent(
                t(`compareInvaluablePage.scorecard.rows.${row.key}.competitor`),
            );
            expect(cells[1]).toHaveTextContent(
                t(`compareInvaluablePage.scorecard.rows.${row.key}.auraHistoria`),
            );
        });
    });

    it("prints the fixed review date in a time element", async () => {
        const { container } = await renderPage();

        const time = container.querySelector("time");
        expect(time).toHaveAttribute("datetime", "2026-11-08");
        expect(time).toHaveTextContent("8. November 2026");
    });

    it("states the dated acquisition in the respect chapter", async () => {
        const { container } = await renderPage();

        const respect = container.querySelector("section#respect");
        expect(respect).toHaveTextContent(t("comparison.statusLabel"));
        expect(respect).toHaveTextContent(t("compareInvaluablePage.respect.status"));
        expect(t("compareInvaluablePage.respect.status")).toContain("1. Oktober 2026");
    });

    it("keeps the five FAQ answers in the DOM under stable anchors", async () => {
        const { container } = await renderPage();

        const faq = getComparisonFaq(INVALUABLE_COMPARISON);
        expect(faq.map((item) => item.anchor)).toEqual([
            "faq-alternative",
            "faq-replace",
            "faq-bid",
            "faq-dealers-fixed-price",
            "faq-auctionzip",
        ]);
        for (const item of faq) {
            const entry = container.querySelector(`#${item.anchor}`);
            expect(entry).not.toBeNull();
            expect(entry).toHaveTextContent(t(item.questionKey));
            expect(entry).toHaveTextContent(t(item.answerKey));
        }
    });

    it("lists the provider types of its own copy, the same ruled list as Barnebys", async () => {
        await renderPage();

        expect(INVALUABLE_COMPARISON.sources.sourceKeys).toEqual(
            BARNEBYS_COMPARISON.sources.sourceKeys,
        );
        const list = screen.getByRole("list", {
            name: t("compareInvaluablePage.downstream.sourcesLabel"),
        });
        const items = within(list).getAllByRole("listitem");
        expect(items).toHaveLength(INVALUABLE_COMPARISON.sources.sourceKeys.length);
        INVALUABLE_COMPARISON.sources.sourceKeys.forEach((key, index) => {
            expect(items[index]).toHaveTextContent(
                t(`compareInvaluablePage.downstream.sources.${key}`),
            );
        });
    });

    it("links to every other comparison in the cross-link block, never to itself or an external site", async () => {
        const { container } = await renderPage();

        const block = screen.getByRole("region", {
            name: plain("comparison.otherComparisons.title"),
        });
        const links = within(block).getAllByRole("link");
        const others = COMPARISON_REGISTRY.filter((entry) => entry.slug !== "invaluable");
        expect(links).toHaveLength(COMPARISON_REGISTRY.length - 1);
        expect(links.map((link) => link.getAttribute("href"))).toEqual(
            others.map((entry) => `/de/compare/${entry.slug}`),
        );
        others.forEach((entry, index) => {
            expect(links[index]).toHaveTextContent(
                i18n.t("comparison.otherComparisons.linkTitle", { name: entry.competitorName }),
            );
        });

        expect(
            screen.getByRole("link", { name: t("compareInvaluablePage.hero.primaryCta") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(
            screen.getByRole("link", { name: t("compareInvaluablePage.hero.secondaryCta") }),
        ).toHaveAttribute("href", "#scorecard");
        expect(
            screen.getByRole("link", { name: t("compareInvaluablePage.finalCta.button") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(container.querySelectorAll('a[href*="invaluable" i]')).toHaveLength(0);
        expect(container.querySelectorAll('a[href*="auctionzip" i]')).toHaveLength(0);
        expect(container.querySelectorAll('a[href^="http" i]')).toHaveLength(0);
    });
});

/**
 * The page never predicts what the acquisition means: no roadmap or AI plans from the
 * announcement, no named executives, no purchase price, and no "leading" self-description.
 */
const PREDICTIONS_AND_SUPERLATIVES: Record<LocaleCode, RegExp> = {
    en: /(roadmap|\bAI\b|Malone|\$80|\bleading\b|world's)/i,
    de: /(roadmap|\bKI\b|Malone|80 Millionen|führend)/i,
    es: /(roadmap|\bIA\b|Malone|80 millones|líder)/i,
    fr: /(roadmap|feuille de route|\bIA\b|Malone|80 millions|leader)/i,
    it: /(roadmap|\bIA\b|Malone|80 milioni|leader)/i,
};

/**
 * Words that state the ownership change. They belong to `respect.status` alone: the page states
 * the acquisition once, as a dated fact.
 */
const OWNERSHIP_WORDING: Record<LocaleCode, RegExp> = {
    en: /(acquir|acquisition|bought|\bowned\b|\bowns\b|\bowner|ownership|purchased|takeover|taken over|parent company|subsidiar|merger|merged|\bsold\b)/i,
    de: /(übernahm|übernehm|übernommen|erwirbt|erwarb|besitzer|eigentümer|gehört|verkauft|fusion|tochterunternehmen|muttergesellschaft)/i,
    es: /(adquisici|adquir|compró|comprada|absorb|pertenece|propiedad|propietari|fusi[oó]n|filial|matriz|\bvendida\b)/i,
    fr: /(rachat|racheté|acquisition|acquér|propriétaire|appartient|\bvendue\b|fusion|filiale)/i,
    it: /(acquisizion|acquistat[oa]|rilevat|appartiene|propriet|\bvenduta\b|fusione|controllata)/i,
};

/** Language-independent names that only the acquisition sentence carries. */
const ACQUISITION_NAMES = /(Auction Holdings|LQDT|RFC Auction Systems)/;

/** The older reach figure ("5,000+", "5.000", "5000"), without matching "15,000" or "25 000". */
const OLDER_REACH_FIGURE = /(?<![\d.,])5[.,\s]?000(?!\d)/;

/**
 * Payment wording. Invaluable does not take payment for every auction house, so the page mentions
 * payment once, where it says each auction house sets its own methods.
 */
const PAYMENT_WORDING: Record<LocaleCode, RegExp> = {
    en: /(payment|\bpay(s|ing)?\b|checkout)/i,
    de: /(zahlung|bezahl|checkout)/i,
    es: /(\bpago|pagar|checkout)/i,
    fr: /(paiement|payer|checkout)/i,
    it: /(pagament|pagare|checkout)/i,
};

describe.each(Object.entries(LOCALES))("Invaluable comparison copy in %s", (lng, locale) => {
    const code = lng as LocaleCode;
    const entries = leafEntries(locale.compareInvaluablePage);
    const copy = entries.map(([, text]) => text);
    // The meta title and description are the search-result text, so they follow the same rules.
    const searchResultCopy = leaves(locale.meta.compareInvaluable);

    it("keeps the rules' banned wording, hype and predictions off the page and its meta text", () => {
        expect(copy.length).toBeGreaterThan(60);
        expect(searchResultCopy).toHaveLength(2);
        for (const text of [...copy, ...searchResultCopy]) {
            expect(text).not.toMatch(BANNED_WORDING[code]);
            expect(text).not.toMatch(PREDICTIONS_AND_SUPERLATIVES[code]);
            expect(text).not.toMatch(OLDER_REACH_FIGURE);
            expect(text).not.toMatch(/!/);
        }
    });

    it("states the acquisition once, dated and with the company that announced it", () => {
        const { status } = locale.compareInvaluablePage.respect;

        expect(status).toContain("2026");
        expect(status).toContain("Liquidity Services");
        expect(status).toContain("Auction Holdings, Inc.");
        expect(status).toMatch(OWNERSHIP_WORDING[code]);

        const pathsMatching = (pattern: RegExp) =>
            entries.filter(([, text]) => pattern.test(text)).map(([path]) => path);
        expect(pathsMatching(OWNERSHIP_WORDING[code])).toEqual(["respect.status"]);
        expect(pathsMatching(ACQUISITION_NAMES)).toEqual(["respect.status"]);
    });

    it("attributes the reach figures to both businesses together, with their years and issuer", () => {
        const page = locale.compareInvaluablePage;

        expect(page.respect.paragraph1).toContain("Invaluable");
        expect(page.respect.paragraph1).toContain("AuctionZip");
        expect(page.respect.paragraph1).toContain("2026");
        expect(page.respect.paragraph1).toContain("2025");
        expect(page.scorecard.rows.auctionHouseReach.competitor).toContain("AuctionZip");
        // Sentences that rely on the announcement name who made it, since FAQ answers are quoted
        // on their own.
        for (const text of [
            page.respect.paragraph1,
            page.scorecard.rows.auctionHouseReach.competitor,
            page.faq.items.auctionZip.answer,
        ]) {
            expect(text).toContain("Liquidity Services");
        }
    });

    it("mentions payment once, where it says each auction house sets its own methods", () => {
        const paths = entries
            .filter(([, text]) => PAYMENT_WORDING[code].test(text))
            .map(([path]) => path);

        expect(paths).toEqual(["scorecard.rows.onPlatformBidding.competitor"]);
    });

    it("names the listing page's own 'Go to provider' label where it says what happens next", () => {
        const label = locale.product.toMerchant;

        expect(locale.compareInvaluablePage.together.paragraph1).toContain(label);
        expect(locale.compareInvaluablePage.faq.items.bid.answer).toContain(label);
        expect(
            locale.compareInvaluablePage.scorecard.rows.onPlatformBidding.auraHistoria,
        ).toContain(label);
    });

    it("says Aura Historia takes no bids and is not affiliated with Invaluable", () => {
        const affiliation: Record<LocaleCode, RegExp> = {
            en: /not affiliated with Invaluable/,
            de: /in keiner Verbindung zu Invaluable/,
            es: /no está vinculada a Invaluable/,
            fr: /n’est pas affiliée à Invaluable/,
            it: /non è affiliata a Invaluable/,
        };
        const no: Record<LocaleCode, string> = {
            en: "No.",
            de: "Nein.",
            es: "No.",
            fr: "Non.",
            it: "No.",
        };

        expect(locale.compareInvaluablePage.together.paragraph2).toMatch(affiliation[code]);
        expect(locale.compareInvaluablePage.faq.items.bid.answer.startsWith(no[code])).toBe(true);
    });

    it("lists the same provider types as the Barnebys comparison in this language", () => {
        expect(locale.compareInvaluablePage.downstream.sources).toEqual(
            locale.compareBarnebysPage.downstream.sources,
        );
    });

    it("writes Invaluable as a plain name and says nothing about agent interfaces", () => {
        expect(locale.compareInvaluablePage.scorecard.headers.competitor).toBe("Invaluable");
        expect(locale.compareInvaluablePage.quickVerdicts.onlineBidding.value).toBe("Invaluable");
        for (const text of [...copy, ...searchResultCopy]) {
            expect(text).not.toMatch(/MCP|llms\.txt|\bAPI\b/);
        }
    });
});
