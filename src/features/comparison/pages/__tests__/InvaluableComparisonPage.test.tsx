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
import i18n from "@/i18n/i18nForTests";
import translationDE from "@/i18n/locales/de/translation.json";
import translationEN from "@/i18n/locales/en/translation.json";
import translationES from "@/i18n/locales/es/translation.json";
import translationFR from "@/i18n/locales/fr/translation.json";
import translationIT from "@/i18n/locales/it/translation.json";
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
        expect(within(nav).getByRole("link", { name: /Wie beides zusammenpasst/ })).toHaveAttribute(
            "href",
            "#together",
        );
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
        expect(links.map((link) => link.getAttribute("href"))).toEqual(
            COMPARISON_REGISTRY.filter((entry) => entry.slug !== "invaluable").map(
                (entry) => `/de/compare/${entry.slug}`,
            ),
        );

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

const LOCALES = {
    de: translationDE,
    en: translationEN,
    es: translationES,
    fr: translationFR,
    it: translationIT,
} as const;

/**
 * Wording the comparison rules of the epic (#1262) keep off the page: speed and fee comparisons,
 * finances and staffing, unqualified superlatives, hype. Stems are anchored where a short stem
 * would hit unrelated words ("costituisce", "frais" as in "fraises").
 */
const BANNED_WORDING: Record<keyof typeof LOCALES, RegExp> = {
    en: /\b(faster|slower|cheaper|quickly|instant\w*|immediate\w*|fast|outdated|broken|struggling|layoffs?|bankrupt\w*|insolven\w*|commissions?|fees?|premium|more accurate|more complete|real-time|guaranteed|the only|no other|cutting-edge|unlike)\b/i,
    de: /(schneller|langsamer|sofort|umgehend|günstiger|veraltet|insolvenz|entlassung|kommission|gebühr|aufgeld|genauer|vollständiger|echtzeit|garantiert|der einzige|einzigartig)/i,
    es: /(más rápid|más lent|al instante|inmediat|más barat|obsolet|despidos|quiebra|comisi[oó]n|tarifa|prima de|más preciso|más complet|tiempo real|garantiz|el único)/i,
    fr: /(plus rapide|plus lent|instantan|immédiat|moins cher|plus cher|obsolète|licenci|faillite|commission|\bfrais\b|plus précis|plus complet|temps réel|garanti|le seul)/i,
    it: /(più veloce|più lent|istantane|immediat|più economic|obsolet|licenziament|fallimento|commission|\bcosti\b|più accurat|più complet|tempo reale|garantit|l[’']unico)/i,
};

/**
 * The page never predicts what the acquisition means: no roadmap or AI plans from the
 * announcement, no named executives, no purchase price, and no "leading" self-description.
 */
const PREDICTIONS_AND_SUPERLATIVES: Record<keyof typeof LOCALES, RegExp> = {
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
const OWNERSHIP_WORDING: Record<keyof typeof LOCALES, RegExp> = {
    en: /(acquir|acquisition|bought|\bowned\b|ownership|takeover|taken over|parent company|subsidiar|merger|merged)/i,
    de: /(übernahm|übernehm|übernommen|erwirbt|erwarb|besitzer|eigentümer|fusion|tochterunternehmen|muttergesellschaft)/i,
    es: /(adquisici|adquir|compró|absorb|propiedad|propietari|fusi[oó]n|filial|matriz)/i,
    fr: /(rachat|racheté|acquisition|acquér|propriétaire|appartient|fusion|filiale)/i,
    it: /(acquisizion|rilevat|propriet|fusione|controllata)/i,
};

/** Draft claims the research corrected: the older reach figure and platform-wide checkout. */
const CORRECTED_CLAIMS = /(5[.,\s]?000\+?|checkout)/i;

function leaves(value: unknown, path = ""): Array<[string, string]> {
    if (typeof value === "string") return [[path, value]];
    if (value && typeof value === "object") {
        return Object.entries(value).flatMap(([key, child]) =>
            leaves(child, path ? `${path}.${key}` : key),
        );
    }
    return [];
}

describe.each(Object.entries(LOCALES))("Invaluable comparison copy in %s", (lng, locale) => {
    const code = lng as keyof typeof LOCALES;
    const entries = leaves(locale.compareInvaluablePage);
    const copy = entries.map(([, text]) => text);

    it("keeps the rules' banned wording, hype and predictions off the page", () => {
        expect(copy.length).toBeGreaterThan(60);
        for (const text of copy) {
            expect(text).not.toMatch(BANNED_WORDING[code]);
            expect(text).not.toMatch(PREDICTIONS_AND_SUPERLATIVES[code]);
            expect(text).not.toMatch(CORRECTED_CLAIMS);
            expect(text).not.toMatch(/!/);
        }
    });

    it("states the acquisition once, dated and attributed to the announcement", () => {
        const { status } = locale.compareInvaluablePage.respect;

        expect(status).toContain("2026");
        expect(status).toContain("Liquidity Services");
        expect(status).toContain("Auction Holdings, Inc.");
        expect(status).toMatch(OWNERSHIP_WORDING[code]);

        const mentioning = entries
            .filter(([, text]) => OWNERSHIP_WORDING[code].test(text))
            .map(([path]) => path);
        expect(mentioning).toEqual(["respect.status"]);
    });

    it("attributes the reach figures to both businesses together, with their years", () => {
        const { paragraph1 } = locale.compareInvaluablePage.respect;

        expect(paragraph1).toContain("Invaluable");
        expect(paragraph1).toContain("AuctionZip");
        expect(paragraph1).toContain("2026");
        expect(paragraph1).toContain("2025");
        expect(locale.compareInvaluablePage.scorecard.rows.auctionHouseReach.competitor).toContain(
            "AuctionZip",
        );
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
        const affiliation: Record<keyof typeof LOCALES, RegExp> = {
            en: /not affiliated with Invaluable/,
            de: /in keiner Verbindung zu Invaluable/,
            es: /no está vinculada a Invaluable/,
            fr: /n’est pas affiliée à Invaluable/,
            it: /non è affiliata a Invaluable/,
        };

        expect(locale.compareInvaluablePage.together.paragraph2).toMatch(affiliation[code]);
        expect(
            locale.compareInvaluablePage.faq.items.bid.answer.startsWith(
                { en: "No.", de: "Nein.", es: "No.", fr: "Non.", it: "No." }[code],
            ),
        ).toBe(true);
    });

    it("lists the same provider types as the Barnebys comparison in this language", () => {
        expect(locale.compareInvaluablePage.downstream.sources).toEqual(
            locale.compareBarnebysPage.downstream.sources,
        );
    });

    it("writes Invaluable as a plain name and says nothing about agent interfaces", () => {
        expect(locale.compareInvaluablePage.scorecard.headers.competitor).toBe("Invaluable");
        expect(locale.compareInvaluablePage.quickVerdicts.onlineBidding.value).toBe("Invaluable");
        for (const text of copy) {
            expect(text).not.toMatch(/MCP|llms\.txt|\bAPI\b/);
        }
    });
});
