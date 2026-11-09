import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import {
    type ComparisonDefinition,
    getComparisonChapters,
    getComparisonFaq,
    getComparisonNav,
} from "@/features/comparison/config/comparisonDefinition.ts";
import { COMPARISON_REGISTRY } from "@/features/comparison/config/comparisonRegistry.ts";
import { EBAY_COMPARISON } from "@/features/comparison/config/ebayComparison.ts";
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
        result = renderWithRouter(<ComparisonPage definition={EBAY_COMPARISON} />);
    });
    return result as ReturnType<typeof renderWithRouter>;
}

describe("ComparisonPage with the eBay definition", () => {
    it("renders one h1 and an h2 with an id for every chapter, with 'together' instead of 'alerts'", async () => {
        const { container } = await renderPage();

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: plain("compareEbayPage.hero.title"),
            }),
        ).toBeInTheDocument();

        const ids = getComparisonChapters(EBAY_COMPARISON);
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
                name: plain("compareEbayPage.nav.items.together"),
            }),
        ).toHaveAttribute("href", "#together");
        expect(getComparisonNav(EBAY_COMPARISON).map((item) => item.marker)).toEqual([
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
            plain("compareEbayPage.together.title"),
        );
        expect(together).toHaveTextContent(t("compareEbayPage.together.paragraph1"));
        expect(together).toHaveTextContent(t("compareEbayPage.together.paragraph2"));
    });

    it("concedes reach and a very large selection to eBay in the quick answer and keeps four verdicts", async () => {
        await renderPage();

        const quickAnswer = screen.getByRole("region", {
            name: plain("compareEbayPage.hero.quickAnswerTitle"),
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
        expect(badges[0]).toHaveTextContent("eBay");
        // The issue's fourth verdict (search across languages) is not kept: the cross-language test
        // ran on the Aura Historia side only, so it cannot support a verdict over eBay.
        expect(EBAY_COMPARISON.quickVerdicts.map((verdict) => verdict.key)).toEqual([
            "reachAndSelection",
            "artAntiquesDesign",
            "dealersAndAuctionHouses",
            "monitoring",
        ]);
    });

    it("concedes reach and buyer protection, gives Aura Historia focus and provider types and rates languages a tie", async () => {
        await renderPage();

        const table = screen.getByRole("table", {
            name: t("compareEbayPage.scorecard.caption"),
        });
        const columnHeaders = within(table).getAllByRole("columnheader");
        expect(columnHeaders).toHaveLength(3);
        expect(columnHeaders[1]).toHaveTextContent("eBay");
        const rowHeaders = within(table).getAllByRole("rowheader");
        expect(rowHeaders).toHaveLength(5);

        // The rendered badge in each criterion cell pins who the row goes to. There is no
        // monitoring row: eBay's saved searches and alerts could not be read from a permitted
        // source.
        const winners = ["competitor", "competitor", "aura", "aura", "tie"];
        expect(EBAY_COMPARISON.scorecardRows.map((row) => row.key)).toEqual([
            "reachAndBuyerBase",
            "buyerProtection",
            "categoryFocus",
            "providerTypes",
            "languagesAndTerminology",
        ]);
        EBAY_COMPARISON.scorecardRows.forEach((row, index) => {
            const header = rowHeaders[index];
            expect(row.winner).toBe(winners[index]);
            expect(header).toHaveTextContent(
                t(`compareEbayPage.scorecard.rows.${row.key}.criterion`),
            );
            expect(header).toHaveTextContent(
                t(`compareEbayPage.scorecard.rows.${row.key}.verdict`),
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
                t(`compareEbayPage.scorecard.rows.${row.key}.competitor`),
            );
            expect(cells[1]).toHaveTextContent(
                t(`compareEbayPage.scorecard.rows.${row.key}.auraHistoria`),
            );
        });
    });

    it("prints the fixed review date in a time element", async () => {
        const { container } = await renderPage();

        const time = container.querySelector("time");
        expect(time).toHaveAttribute("datetime", "2026-11-09");
        expect(time).toHaveTextContent("9. November 2026");
    });

    it("has no status note: nothing in the sources says anything about eBay's situation", async () => {
        const { container } = await renderPage();

        expect((EBAY_COMPARISON as ComparisonDefinition).statusNote).toBeUndefined();
        expect(container.querySelector("section#respect")).not.toHaveTextContent(
            t("comparison.statusLabel"),
        );
    });

    it("keeps the five FAQ answers in the DOM under stable anchors and no AI-assistants entry", async () => {
        const { container } = await renderPage();

        const faq = getComparisonFaq(EBAY_COMPARISON);
        expect(faq.map((item) => item.anchor)).toEqual([
            "faq-alternative",
            "faq-replace",
            "faq-rare-art",
            "faq-everyday-collectibles",
            "faq-authenticity",
        ]);
        for (const item of faq) {
            const entry = container.querySelector(`#${item.anchor}`);
            expect(entry).not.toBeNull();
            expect(entry).toHaveTextContent(t(item.questionKey));
            expect(entry).toHaveTextContent(t(item.answerKey));
        }
        // The maintainer dropped the shared AI-assistants side-note and entry in #1274.
        expect(container.querySelector("#faq-ai-assistants")).toBeNull();
        expect(container.querySelector("#agents")).toBeNull();
    });

    it("lists the provider types of its own copy, the same ruled list as Barnebys", async () => {
        await renderPage();

        expect(EBAY_COMPARISON.sources.sourceKeys).toEqual(BARNEBYS_COMPARISON.sources.sourceKeys);
        const list = screen.getByRole("list", {
            name: t("compareEbayPage.downstream.sourcesLabel"),
        });
        const items = within(list).getAllByRole("listitem");
        expect(items).toHaveLength(EBAY_COMPARISON.sources.sourceKeys.length);
        EBAY_COMPARISON.sources.sourceKeys.forEach((key, index) => {
            expect(items[index]).toHaveTextContent(t(`compareEbayPage.downstream.sources.${key}`));
        });
    });

    it("links to every other comparison in the cross-link block, never to itself or an external site", async () => {
        const { container } = await renderPage();

        const block = screen.getByRole("region", {
            name: plain("comparison.otherComparisons.title"),
        });
        const links = within(block).getAllByRole("link");
        const others = COMPARISON_REGISTRY.filter((entry) => entry.slug !== "ebay");
        expect(COMPARISON_REGISTRY.map((entry) => entry.slug)).toContain("ebay");
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
            screen.getByRole("link", { name: t("compareEbayPage.hero.primaryCta") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(
            screen.getByRole("link", { name: t("compareEbayPage.hero.secondaryCta") }),
        ).toHaveAttribute("href", "#scorecard");
        expect(
            screen.getByRole("link", { name: t("compareEbayPage.finalCta.button") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(container.querySelectorAll('a[href*="ebay" i]')).toHaveLength(0);
        expect(container.querySelectorAll('a[href^="http" i]')).toHaveLength(0);
        expect(container.querySelectorAll("img")).toHaveLength(0);
    });
});

/**
 * Every number the page may carry, all from eBay's annual report for 2025 and dated to it: 135
 * million active buyers, 2.5 billion live listings, the 12-month window that defines an active
 * buyer and "more than 190 markets". The issue's size figures, fee percentages and the $500
 * threshold of the coin programme are not used.
 */
const ALLOWED_NUMBERS = new Set(["135", "2025", "12", "190"]);

/** "2.5 billion live listings" in every locale's number format; removed before figures are scanned. */
const LIVE_LISTINGS_FIGURE = /2[.,]5/g;

/**
 * Every string that cites eBay's annual report names it and its year, because FAQ answers and
 * scorecard cells are quoted on their own.
 */
const ANNUAL_REPORT_PATHS = [
    "hero.subtitle",
    "hero.quickAnswerDescription",
    "respect.paragraph1",
    "scorecard.description",
    "scorecard.rows.reachAndBuyerBase.competitor",
    "scorecard.rows.buyerProtection.competitor",
    "scorecard.rows.categoryFocus.competitor",
    "scorecard.rows.providerTypes.competitor",
    "scorecard.rows.languagesAndTerminology.competitor",
    "faq.items.alternative.answer",
    "faq.items.rareArt.answer",
    "faq.items.everydayCollectibles.answer",
] as const;

/** Where the active-buyer count appears, always with the year. */
const ACTIVE_BUYER_PATHS = [
    "respect.paragraph1",
    "scorecard.rows.reachAndBuyerBase.competitor",
    "faq.items.everydayCollectibles.answer",
] as const;

const ANNUAL_REPORT: Record<LocaleCode, RegExp> = {
    en: /annual report for 2025/,
    de: /Geschäftsbericht für 2025/,
    es: /informe anual de 2025/,
    fr: /rapport annuel 2025/,
    it: /rapporto annuale 2025/,
};

/** eBay's own claims are attributed: "describes", "reports", "names", "according to". */
const ATTRIBUTION: Record<LocaleCode, RegExp> = {
    en: /\b(describes|reports|names|according to)\b/,
    de: /(beschreibt|nennt|führt|nach seinem)/,
    es: /(describe|indica|menciona|según)/,
    fr: /(décrit|indique|cite|selon)/,
    it: /(descrive|indica|cita|secondo)/,
};

/**
 * eBay's own wording that the page does not use in its own voice: "global commerce leader",
 * "most vibrant", "great value", "unique selection".
 */
const SELF_DESCRIPTIONS: Record<LocaleCode, RegExp> = {
    en: /(commerce leader|most vibrant|great value|unique selection|\bleading\b)/i,
    de: /(führend|lebendigst|einzigartig|großartig)/i,
    es: /(\blíder\b|más dinámic|valor excepcional|selección única)/i,
    fr: /(\bleader\b|le plus dynamique|valeur exceptionnelle|choix unique|sélection unique)/i,
    it: /(\bleader\b|più vivace|valore eccezionale|selezione unica)/i,
};

/** The page says "one of the world's largest" only where it attributes it to the annual report. */
const WORLDS_LARGEST: Record<LocaleCode, RegExp> = {
    en: /world's largest/,
    de: /größten der Welt/,
    es: /mayores del mundo/,
    fr: /plus grandes au monde/,
    it: /più grandi al mondo/,
};

/** Never a doubt about eBay's quality, safety or authenticity: not the competitor's to judge. */
const QUALITY_DOUBT: Record<LocaleCode, RegExp> = {
    en: /(counterfeit|\bfakes?\b|fraud|scam|complaint|criticis|unsafe|risk)/i,
    de: /(gefälscht|fälschung|betrug|beschwerde|kritik|unsicher|risiko)/i,
    es: /(falsific|fraude|estafa|reclamaci|crític|inseguro|riesgo)/i,
    fr: /(contrefa|\bfaux\b|fraude|arnaque|réclamation|critiqu|risque)/i,
    it: /(contraffa|falsific|frode|truffa|reclam|critic|insicur|rischio)/i,
};

/** The issue's draft headline "sells everything": eBay does not, and the page does not say so. */
const SELLS_EVERYTHING: Record<LocaleCode, RegExp> = {
    en: /(sells everything|general marketplace|everything)/i,
    de: /(verkauft alles|allgemeiner Marktplatz|alles)/i,
    es: /(vende de todo|marketplace general|todo)\b/i,
    fr: /(vend tout|place de marché généraliste|tout)\b/i,
    it: /(vende tutto|marketplace generalista|tutto)\b/i,
};

/** The page never says eBay "sells": its annual report calls it a third-party marketplace. */
const EBAY_SELLS: Record<LocaleCode, RegExp> = {
    en: /\beBay sells\b/,
    de: /eBay verkauft/,
    es: /eBay vende/,
    fr: /eBay vend\b/,
    it: /eBay vende/,
};

/**
 * The page makes no statement about antiques or art on eBay: the annual report mentions neither,
 * and the one draft fact (an Antiques and Art category) could not be verified from a permitted
 * source. It also never says antiques and art are outside the Authenticity Guarantee.
 */
const ANTIQUES_OR_ART: Record<LocaleCode, RegExp> = {
    en: /(antique|\bart\b|design)/i,
    de: /(antiquit|\bkunst\b|design)/i,
    es: /(antigüedad|\barte\b|diseño)/i,
    fr: /(antiquit|\bart\b|design)/i,
    it: /(antiquari|\barte\b|design)/i,
};

/** eBay's saved searches and alerts could not be read: the page describes none of them. */
const EBAY_MONITORING: Record<LocaleCode, RegExp> = {
    en: /(alert|notif|follow|favourit|saved search|watchlist|watch list)/i,
    de: /(benachrichtig|folgen|favorit|gespeicherte|merkliste|alarm)/i,
    es: /(alerta|notific|seguir|favorit|búsquedas guardadas|lista de seguimiento)/i,
    fr: /(alerte|notific|suivre|favori|recherches enregistrées|liste de surveillance)/i,
    it: /(avvis|notific|seguire|preferit|ricerche salvate|lista dei preferiti)/i,
};

/** No alert cadence and no fee talk: both invite a comparison the rules keep off the page. */
const CADENCE_AND_FEES: Record<LocaleCode, RegExp> = {
    en: /(daily|every day|hourly|every hour|sponsor|paid placement|promot|advertis|\d\s?%)/i,
    // "alltäglich" and "du quotidien" are the question's "everyday", not a cadence.
    de: /((?<!all)täglich|stündlich|jeden Tag|gesponsert|bezahlte Platzierung|Werbung|\d\s?%)/i,
    es: /(diari|cada día|cada hora|patrocin|posicionamiento de pago|publicidad|\d\s?%)/i,
    fr: /((?<!du )quotidien|chaque jour|toutes les heures|sponsoris|placement payant|publicité|\d\s?%)/i,
    it: /(giornalier|ogni giorno|ogni ora|sponsoriz|posizionamento a pagamento|pubblicit|\d\s?%)/i,
};

/** No size comparison with eBay ("more objects than"). */
const MORE_OBJECTS: Record<LocaleCode, RegExp> = {
    en: /(more|larger|bigger|wider|smaller) (objects|lots|listings|inventory|selection|buyers) than/i,
    de: /(mehr|größere[rs]?|kleinere[rs]?) (Objekte|Angebote|Auswahl|Käufer) als/i,
    es: /(más|mayor|menor) (objetos|anuncios|oferta|selección|compradores) que/i,
    fr: /(plus d’(objets|annonces|acheteurs)|plus grande sélection|moins d’acheteurs) que/i,
    it: /(più (oggetti|annunci|acquirenti)|maggiore (offerta|selezione)) di/i,
};

/** The statements about Aura Historia itself: no vetting, authenticity or valuation promise. */
const VETTING_PROMISE: Record<LocaleCode, RegExp> = {
    en: /(verif|vetted|vetting|authentic|appraisal|valuation|guarantee)/i,
    de: /(verifizier|geprüft|authentisch|echtheit|bewertung|garant|gewähr)/i,
    es: /(verific|autentic|tasaci|valoraci|garant)/i,
    fr: /(vérifi|authentiq|expertis|évaluation|garant)/i,
    it: /(verific|autentic|valutazion|perizia|garan)/i,
};

const AURA_SIDE_PATHS = (path: string) =>
    /^(summary|advantages|downstream|together|finalCta)\./.test(path) ||
    /^scorecard\.rows\.[^.]+\.auraHistoria$/.test(path);

/** On Aura Historia's own language claims, any comparative at all is out. */
const LANGUAGE_COMPARATIVE: Record<LocaleCode, RegExp> = {
    en: /(more languages|wider|broader|better|superior|stronger)/i,
    de: /(mehr Sprachen|breiter|besser|überlegen|stärker)/i,
    es: /(más idiomas|más amplio|mejor|superior|más fuerte)/i,
    fr: /(plus de langues|plus large|meilleur|supérieur|plus fort)/i,
    it: /(più lingue|più ampi|migliore|superiore|più forte)/i,
};

/**
 * The page never contrasts itself with "one category among many": that pictures art and antiques
 * as a category inside eBay, a fact that could not be verified from a permitted source.
 */
const CATEGORY_AMONG_MANY: Record<LocaleCode, RegExp> = {
    en: /(category|aisle) among (many|everything)|one category of many/i,
    de: /Kategorie unter vielen|ein Gang unter/i,
    es: /categoría entre muchas|una más entre/i,
    fr: /catégorie parmi tant|catégorie parmi d’autres/i,
    it: /categoria tra tante|una fra tante/i,
};

/** The h1 does not claim the "whole market", which nobody can verify. */
const WHOLE_MARKET: Record<LocaleCode, RegExp> = {
    en: /whole market|entire market/i,
    de: /gesamten Markt|ganzen Markt/i,
    es: /todo el mercado|mercado entero/i,
    fr: /tout le marché|marché entier/i,
    it: /tutto il mercato|intero mercato/i,
};

describe.each(Object.entries(LOCALES))("eBay comparison copy in %s", (lng, locale) => {
    const code = lng as LocaleCode;
    const page = locale.compareEbayPage;
    const entries = leafEntries(page);
    const copy = entries.map(([, text]) => text);
    // The meta title and description are the search-result text, so they follow the same rules.
    const searchResultCopy = leaves(locale.meta.compareEbay);
    const pathsMatching = (pattern: RegExp) =>
        entries.filter(([, text]) => pattern.test(text)).map(([path]) => path);
    const textAt = (path: string) => entries.find(([entryPath]) => entryPath === path)?.[1] ?? "";
    const eBaySide = entries.filter(
        ([path]) =>
            /^scorecard\.rows\.[^.]+\.competitor$/.test(path) || path === "respect.paragraph1",
    );

    it("keeps the rules' banned wording, hype, self-description, fee talk, size comparisons and quality doubts off the page and its meta text", () => {
        expect(copy.length).toBeGreaterThan(60);
        expect(searchResultCopy).toHaveLength(2);
        for (const text of [...copy, ...searchResultCopy]) {
            expect(text).not.toMatch(BANNED_WORDING[code]);
            expect(text).not.toMatch(SELF_DESCRIPTIONS[code]);
            expect(text).not.toMatch(QUALITY_DOUBT[code]);
            expect(text).not.toMatch(CADENCE_AND_FEES[code]);
            expect(text).not.toMatch(MORE_OBJECTS[code]);
            expect(text).not.toMatch(CATEGORY_AMONG_MANY[code]);
            expect(text).not.toMatch(/!/);
        }
        expect(page.hero.title).not.toMatch(WHOLE_MARKET[code]);
        expect(page.hero.title).not.toMatch(SELLS_EVERYTHING[code]);
        expect(page.hero.quickAnswerTitle).not.toMatch(SELLS_EVERYTHING[code]);
        expect(page.finalCta.title).not.toMatch(SELLS_EVERYTHING[code]);
    });

    it("never says eBay sells: its annual report calls it a third-party marketplace", () => {
        expect(eBaySide.length).toBe(6);
        for (const [path, text] of [
            ...entries.filter(
                ([path]) =>
                    path.startsWith("hero.") ||
                    path.startsWith("summary.") ||
                    path.startsWith("together.") ||
                    path.startsWith("faq.items.") ||
                    path.startsWith("finalCta."),
            ),
            ...eBaySide,
        ]) {
            expect(text, path).not.toMatch(EBAY_SELLS[code]);
        }
    });

    it("makes no vetting, authenticity or valuation promise for Aura Historia and no language comparative", () => {
        const auraSide = entries.filter(([path]) => AURA_SIDE_PATHS(path));
        expect(auraSide.length).toBeGreaterThan(20);
        for (const [path, text] of auraSide) {
            expect(text, path).not.toMatch(VETTING_PROMISE[code]);
        }
        for (const path of [
            "scorecard.rows.languagesAndTerminology.auraHistoria",
            "downstream.cards.acrossLanguages.title",
            "downstream.cards.acrossLanguages.description",
            "advantages.cards.terminologyAcrossLanguages.title",
            "advantages.cards.terminologyAcrossLanguages.description",
        ]) {
            expect(textAt(path), path).not.toMatch(LANGUAGE_COMPARATIVE[code]);
        }
    });

    it("answers the authenticity question in the About page's own wording, and as no point for either side", () => {
        const { appraisal } = locale.aboutPage.faq.items;

        expect(page.faq.items.authenticity.answer).toBe(appraisal.answer);
        // The question is the issue's; its answer is the existing legal wording, not invented.
        expect(page.faq.items.authenticity.question.length).toBeGreaterThan(10);
        const no: Record<LocaleCode, string> = {
            en: "No.",
            de: "Nein.",
            es: "No.",
            fr: "Non.",
            it: "No.",
        };
        expect(page.faq.items.authenticity.answer.startsWith(no[code])).toBe(true);
    });

    it("carries no figure but eBay's dated annual-report numbers", () => {
        for (const text of [...copy, ...searchResultCopy]) {
            for (const [digits] of text.replace(LIVE_LISTINGS_FIGURE, "").matchAll(/\d+/g)) {
                expect(ALLOWED_NUMBERS.has(digits), `${digits} in "${text}"`).toBe(true);
            }
        }
        for (const path of ACTIVE_BUYER_PATHS) {
            expect(textAt(path), path).toMatch(/135/);
        }
        expect(pathsMatching(/135/).sort()).toEqual([...ACTIVE_BUYER_PATHS].sort());
        // The live-listings figure and the 190 markets each appear once, in their own cell.
        expect(pathsMatching(/190/)).toEqual(["scorecard.rows.languagesAndTerminology.competitor"]);
        expect(textAt("scorecard.rows.reachAndBuyerBase.competitor")).toMatch(/2[.,]5/);
    });

    it("names eBay's annual report and its year wherever a string cites it, and nowhere else", () => {
        for (const path of ANNUAL_REPORT_PATHS) {
            expect(textAt(path), path).toMatch(ANNUAL_REPORT[code]);
        }
        // Every string with the year cites the report, and the year appears nowhere else.
        expect(pathsMatching(/\b2025\b/).sort()).toEqual([...ANNUAL_REPORT_PATHS].sort());
    });

    it("names eBay in every scorecard cell that cites its report, because cells are quoted on their own", () => {
        const cells = eBaySide.filter(([path]) => path.startsWith("scorecard.rows."));
        expect(cells).toHaveLength(5);
        for (const [path, text] of cells) {
            expect(text, path).toContain("eBay");
        }
        expect(textAt("hero.quickAnswerDescription")).toContain("eBay");
    });

    it("attributes eBay's own claims instead of stating them in the page's voice", () => {
        for (const path of ANNUAL_REPORT_PATHS) {
            expect(textAt(path), path).toMatch(ATTRIBUTION[code]);
        }
        // "One of the world's largest" is eBay's self-description: attributed or absent.
        for (const path of pathsMatching(WORLDS_LARGEST[code])) {
            expect(ANNUAL_REPORT_PATHS, path).toContain(path);
        }
        expect(pathsMatching(WORLDS_LARGEST[code]).length).toBeGreaterThan(0);
        // Paraphrased, never quoted: the filing was read through a tool that cuts quotes short.
        for (const [path, text] of eBaySide) {
            expect(text, path).not.toMatch(/["“”„«»]/);
        }
    });

    it("names the two buyer protection programmes as eBay does, in one cell, with no category scope", () => {
        const cell = "scorecard.rows.buyerProtection.competitor";
        // The annual report lists three refund conditions; the third (a purchase that differs from
        // its description) matters most for antiques and must not be dropped.
        const refundConditions: Record<LocaleCode, RegExp[]> = {
            en: [/does not arrive/, /damaged or faulty/, /differs materially from its description/],
            de: [
                /nicht ankommt/,
                /beschädigt oder fehlerhaft/,
                /erheblich von der Beschreibung abweicht/,
            ],
            es: [/no llega/, /dañado o defectuoso/, /difiere sustancialmente de su descripción/],
            fr: [
                /n’arrive pas/,
                /endommagé ou défectueux/,
                /diffère sensiblement de sa description/,
            ],
            it: [
                /non arriva/,
                /danneggiato o difettoso/,
                /differisce in modo sostanziale dalla descrizione/,
            ],
        };
        for (const condition of refundConditions[code]) {
            expect(textAt(cell)).toMatch(condition);
        }

        expect(pathsMatching(/eBay Money Back Guarantee/)).toEqual([cell]);
        expect(pathsMatching(/Authenticity Guarantee/)).toEqual([cell]);
        // The cell repeats the annual report's description and no more: no category list of the
        // programme, no claim that antiques and art are or are not covered.
        expect(textAt(cell)).not.toMatch(ANTIQUES_OR_ART[code]);
        expect(textAt(cell)).not.toMatch(/\b(PCGS|coins?|trading cards?|2022|500)\b/i);
    });

    it("says nothing about antiques or art on eBay, about its saved searches or alerts, or about its interfaces", () => {
        for (const [path, text] of eBaySide) {
            expect(text, path).not.toMatch(ANTIQUES_OR_ART[code]);
            expect(text, path).not.toMatch(EBAY_MONITORING[code]);
        }
        expect(EBAY_COMPARISON.scorecardRows.map((row) => row.key)).not.toContain("monitoring");
        expect(page.quickVerdicts.monitoring.value).toBe("Aura Historia");
        for (const text of [...copy, ...searchResultCopy]) {
            expect(text).not.toMatch(/(MCP|llms\.txt|\bAPI\b|\bAI\b|\bKI\b)/);
            expect(text).not.toMatch(/(agent|assistant|assistent)/i);
        }
    });

    it("rates languages a tie with 'no difference documented' and says what the annual report does not describe", () => {
        const { languagesAndTerminology } = page.scorecard.rows;

        expect(languagesAndTerminology.verdict).toMatch(
            /(No difference documented|Kein dokumentierter Unterschied|Sin diferencia documentada|Aucune différence documentée|Nessuna differenza documentata)/,
        );
        // Aura Historia's side lists its five languages and claims no advantage.
        expect(languagesAndTerminology.auraHistoria).toMatch(/\((?:[^,()]+,){4}[^,()]+\)/);
        // The competitor's cell says the report is silent on terminology and cross-language search.
        const silent: Record<LocaleCode, RegExp> = {
            en: /The report does not describe terminology or search across languages/,
            de: /Terminologie oder Suche über Sprachen hinweg beschreibt der Bericht nicht/,
            es: /El informe no describe la terminología ni la búsqueda entre idiomas/,
            fr: /Le rapport ne décrit ni la terminologie ni la recherche d’une langue à l’autre/,
            it: /Il rapporto non descrive la terminologia né la ricerca tra le lingue/,
        };
        expect(languagesAndTerminology.competitor).toMatch(silent[code]);
    });

    it("states the cross-language claim as what a search can do, never as a win over eBay", () => {
        const can: Record<LocaleCode, RegExp> = {
            en: /can return objects catalogued in another/,
            de: /Objekte finden kann, die in einer anderen katalogisiert sind/,
            es: /puede devolver objetos catalogados en otro/,
            fr: /peut donc renvoyer des objets catalogués dans une autre/,
            it: /può restituire oggetti catalogati in un’altra/,
        };

        expect(page.advantages.cards.terminologyAcrossLanguages.description).toMatch(can[code]);
        // Not in the quick verdicts, and not in the headline claims.
        expect(Object.keys(page.quickVerdicts)).not.toContain("languages");
        for (const verdict of Object.values(page.quickVerdicts)) {
            expect(verdict.label).not.toMatch(/(language|Sprach|idioma|langue|lingu)/i);
        }
    });

    it("names the listing page's own 'Go to provider' label where it says what happens next", () => {
        expect(page.together.paragraph1).toContain(locale.product.toMerchant);
    });

    it("says Aura Historia is not affiliated with eBay and does not sell objects or take payments for them", () => {
        const affiliation: Record<LocaleCode, RegExp> = {
            en: /not affiliated with eBay/,
            de: /in keiner Verbindung zu eBay/,
            es: /no está vinculada a eBay/,
            fr: /n’est pas affiliée à eBay/,
            it: /non è affiliata a eBay/,
        };
        const forObjects: Record<LocaleCode, RegExp> = {
            en: /take payments for them/,
            de: /nimmt dafür keine Zahlungen entgegen/,
            es: /recibe pagos por ellos/,
            fr: /ne reçoit pas de paiements pour eux/,
            it: /non riceve pagamenti per essi/,
        };
        const no: Record<LocaleCode, string> = {
            en: "No.",
            de: "Nein.",
            es: "No.",
            fr: "Non.",
            it: "No.",
        };

        expect(page.together.paragraph2).toMatch(affiliation[code]);
        expect(page.faq.items.replace.answer.startsWith(no[code])).toBe(true);
        expect(page.scorecard.rows.buyerProtection.auraHistoria).toMatch(forObjects[code]);
    });

    it("concedes everyday collectibles to eBay in the first word of the answer", () => {
        const answer = page.faq.items.everydayCollectibles.answer;

        expect(answer.startsWith("eBay.")).toBe(true);
        expect(page.quickVerdicts.reachAndSelection.value).toBe("eBay");
    });

    it("lists the same provider types as the Barnebys comparison in this language", () => {
        expect(page.downstream.sources).toEqual(locale.compareBarnebysPage.downstream.sources);
    });

    it("writes eBay as a plain name, in the competitor column header and the verdict value", () => {
        expect(page.scorecard.headers.competitor).toBe("eBay");
        expect(page.quickVerdicts.reachAndSelection.value).toBe("eBay");
        for (const key of ["reachAndBuyerBase", "buyerProtection"] as const) {
            expect(page.scorecard.rows[key].verdict).toBe("eBay");
        }
    });
});
