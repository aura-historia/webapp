import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ART_PRICE_DATABASES_COMPARISON } from "@/features/comparison/config/artPriceDatabasesComparison.ts";
import {
    getComparisonChapters,
    getComparisonFaq,
    getComparisonNav,
} from "@/features/comparison/config/comparisonDefinition.ts";
import { COMPARISON_REGISTRY } from "@/features/comparison/config/comparisonRegistry.ts";
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
        result = renderWithRouter(<ComparisonPage definition={ART_PRICE_DATABASES_COMPARISON} />);
    });
    return result as ReturnType<typeof renderWithRouter>;
}

describe("ComparisonPage with the art price databases definition", () => {
    it("renders one h1 and an h2 with an id for every chapter, with 'together' instead of 'alerts'", async () => {
        const { container } = await renderPage();

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: plain("compareArtPriceDatabasesPage.hero.title"),
            }),
        ).toBeInTheDocument();

        const ids = getComparisonChapters(ART_PRICE_DATABASES_COMPARISON);
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

    it("derives the nav from the definition and labels the 'What each answers' and 'Using both' chapters from its copy", async () => {
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
                name: plain("compareArtPriceDatabasesPage.nav.items.sources"),
            }),
        ).toHaveAttribute("href", "#sources");
        expect(
            within(nav).getByRole("link", {
                name: plain("compareArtPriceDatabasesPage.nav.items.together"),
            }),
        ).toHaveAttribute("href", "#together");
        expect(getComparisonNav(ART_PRICE_DATABASES_COMPARISON).map((item) => item.marker)).toEqual(
            ["I", "III", "IV", "V", "VI", "VII", "→"],
        );
    });

    it("renders the 'Using both' chapter from its own copy", async () => {
        const { container } = await renderPage();

        const together = container.querySelector("section#together");
        expect(together?.querySelector("h2#comparison-together-heading")).toHaveTextContent(
            plain("compareArtPriceDatabasesPage.together.title"),
        );
        expect(together).toHaveTextContent(t("compareArtPriceDatabasesPage.together.paragraph1"));
        expect(together).toHaveTextContent(t("compareArtPriceDatabasesPage.together.paragraph2"));
    });

    it("concedes past results to the databases, gives two verdicts to Aura Historia and rates alerts a tie", async () => {
        await renderPage();

        const quickAnswer = screen.getByRole("region", {
            name: plain("compareArtPriceDatabasesPage.hero.quickAnswerTitle"),
        });
        expect(quickAnswer.tagName).toBe("SECTION");
        expect(within(quickAnswer).getByText("Fazit:").tagName).toBe("STRONG");
        expect(within(quickAnswer).getAllByRole("definition")).toHaveLength(4);

        const badges = [...quickAnswer.querySelectorAll("[data-winner]")];
        expect(badges.map((badge) => badge.getAttribute("data-winner"))).toEqual([
            "competitor",
            "aura",
            "aura",
            "tie",
        ]);
        expect(badges[0]).toHaveTextContent(
            t("compareArtPriceDatabasesPage.quickVerdicts.pastResults.value"),
        );
        expect(ART_PRICE_DATABASES_COMPARISON.quickVerdicts.map((verdict) => verdict.key)).toEqual([
            "pastResults",
            "offeredNow",
            "watchingChanges",
            "alerts",
        ]);
    });

    it("rates the five scorecard rows as the research supports and drops the dealer-listings and 'valuation: neither' drafts", async () => {
        await renderPage();

        const table = screen.getByRole("table", {
            name: t("compareArtPriceDatabasesPage.scorecard.caption"),
        });
        const columnHeaders = within(table).getAllByRole("columnheader");
        expect(columnHeaders).toHaveLength(3);
        expect(columnHeaders[1]).toHaveTextContent(
            t("compareArtPriceDatabasesPage.scorecard.headers.competitor"),
        );
        const rowHeaders = within(table).getAllByRole("rowheader");
        expect(rowHeaders).toHaveLength(5);

        // Dealer and marketplace listings: MutualArt lists artworks for sale, so the draft's
        // contrast cannot be stated and the row is dropped. Valuation: MutualArt describes online
        // appraisals, so the draft's "neither" is wrong and the row goes to the databases.
        const winners = ["competitor", "aura", "tie", "competitor", "tie"];
        expect(ART_PRICE_DATABASES_COMPARISON.scorecardRows.map((row) => row.key)).toEqual([
            "historicalDepth",
            "currentAvailability",
            "alerts",
            "valuation",
            "accessModel",
        ]);
        ART_PRICE_DATABASES_COMPARISON.scorecardRows.forEach((row, index) => {
            const header = rowHeaders[index];
            expect(row.winner).toBe(winners[index]);
            expect(header).toHaveTextContent(
                t(`compareArtPriceDatabasesPage.scorecard.rows.${row.key}.criterion`),
            );
            expect(header).toHaveTextContent(
                t(`compareArtPriceDatabasesPage.scorecard.rows.${row.key}.verdict`),
            );
            // The verdict line marks Aura Historia with a check and a tie with an equals sign;
            // the databases' rows carry no mark.
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
                t(`compareArtPriceDatabasesPage.scorecard.rows.${row.key}.competitor`),
            );
            expect(cells[1]).toHaveTextContent(
                t(`compareArtPriceDatabasesPage.scorecard.rows.${row.key}.auraHistoria`),
            );
        });
    });

    it("prints the fixed review date in a time element", async () => {
        const { container } = await renderPage();

        const time = container.querySelector("time");
        expect(time).toHaveAttribute("datetime", "2026-11-09");
        expect(time).toHaveTextContent("9. November 2026");
    });

    it("shows the dated Artnet and Artsy status line under the respect chapter", async () => {
        const { container } = await renderPage();

        expect(ART_PRICE_DATABASES_COMPARISON.statusNote).toBe(true);
        const respect = container.querySelector("section#respect");
        expect(respect).toHaveTextContent(t("comparison.statusLabel"));
        expect(respect).toHaveTextContent(t("compareArtPriceDatabasesPage.respect.status"));
    });

    it("keeps the six FAQ answers in the DOM under stable anchors and no AI-assistants entry", async () => {
        const { container } = await renderPage();

        const faq = getComparisonFaq(ART_PRICE_DATABASES_COMPARISON);
        expect(faq.map((item) => item.anchor)).toEqual([
            "faq-artnet-alternative",
            "faq-worthpoint-alternative",
            "faq-artprice-mutualart-alternative",
            "faq-valuation",
            "faq-similar-offers",
            "faq-past-results",
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

    it("lists the questions each tool answers from its own copy", async () => {
        await renderPage();

        const list = screen.getByRole("list", {
            name: t("compareArtPriceDatabasesPage.downstream.sourcesLabel"),
        });
        const items = within(list).getAllByRole("listitem");
        const keys = ART_PRICE_DATABASES_COMPARISON.sources.sourceKeys;
        expect(items).toHaveLength(keys.length);
        keys.forEach((key, index) => {
            expect(items[index]).toHaveTextContent(
                t(`compareArtPriceDatabasesPage.downstream.sources.${key}`),
            );
        });
    });

    it("links to every other comparison in the cross-link block, never to itself or an external site", async () => {
        const { container } = await renderPage();

        const block = screen.getByRole("region", {
            name: plain("comparison.otherComparisons.title"),
        });
        const links = within(block).getAllByRole("link");
        const others = COMPARISON_REGISTRY.filter((entry) => entry.slug !== "art-price-databases");
        expect(COMPARISON_REGISTRY.map((entry) => entry.slug)).toContain("art-price-databases");
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
            screen.getByRole("link", { name: t("compareArtPriceDatabasesPage.hero.primaryCta") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(
            screen.getByRole("link", { name: t("compareArtPriceDatabasesPage.hero.secondaryCta") }),
        ).toHaveAttribute("href", "#scorecard");
        expect(
            screen.getByRole("link", { name: t("compareArtPriceDatabasesPage.finalCta.button") }),
        ).toHaveAttribute("href", "/de#hero-search");
        // Plain text names only: no link to a database, no logo.
        for (const brand of ["artnet", "worthpoint", "mutualart", "artprice"]) {
            expect(container.querySelectorAll(`a[href*="${brand}" i]`)).toHaveLength(0);
        }
        expect(container.querySelectorAll('a[href^="http" i]')).toHaveLength(0);
        expect(container.querySelectorAll("img")).toHaveLength(0);
    });
});

/**
 * Every number the page may carry. Each belongs to one product and one year: Artnet's 18 million
 * auction results and the 1985 start (its Price Database page, 2026), Artprice's 30 million
 * indices and auction results and the year 1700 (its parent company's release, 2026), WorthPoint's
 * 610 million archived prices (its results announcement, 2022), MutualArt's 900,000 artists (2026)
 * and the 15 April 2026 combination of Artsy and Artnet. The thousands separator of "900,000" is
 * removed before the digits are scanned (see `withoutSeparators`). The
 * issue's other figures (Artprice back to 1962, WorthPoint from 2006, a billion photographs, 500+
 * auction houses, subscription prices) are not used.
 */
const ALLOWED_NUMBERS = new Set(["18", "1985", "30", "1700", "610", "2022", "900", "2026", "15"]);

/** Each figure with the product it belongs to and the year that must stand beside it. */
const FIGURES = [
    { figure: /\b18\b/, product: "Artnet", year: "2026" },
    { figure: /\b30\b/, product: "Artprice", year: "2026" },
    { figure: /\b610\b/, product: "WorthPoint", year: "2022" },
    { figure: /\b900\b/, product: "MutualArt", year: "2026" },
] as const;

const BRANDS = ["Artnet", "WorthPoint", "MutualArt", "Artprice"] as const;

/** "900,000", "900.000" and "900 000" (also with a no-break space) are one figure: 900 (thousand). */
function withoutSeparators(text: string) {
    return text.replace(/(\d)[.,\u00a0\u202f ]000\b/g, "$1");
}

/**
 * The product named closest before the figure: a figure never sits beside another product's
 * name, even when one sentence cites two of them.
 */
function nearestBrandBefore(text: string, index: number) {
    const before = text.slice(0, index);
    return BRANDS.map((brand) => ({ brand, at: before.lastIndexOf(brand) }))
        .filter(({ at }) => at >= 0)
        .sort((a, b) => b.at - a.at)[0]?.brand;
}

/**
 * The year (20xx) closest to the figure within its own sentence, before or after it: the one the
 * figure is dated with ("... of January 2022 cited more than 610 million ..." and "... 18 million
 * ... (November 2026)").
 */
function nearestYearInSentence(text: string, index: number) {
    const sentenceStart = text.lastIndexOf(". ", index);
    const sentenceEnd = text.indexOf(". ", index);
    const from = sentenceStart < 0 ? 0 : sentenceStart + 2;
    const to = sentenceEnd < 0 ? text.length : sentenceEnd;
    const years = [...text.slice(from, to).matchAll(/\b20\d\d\b/g)].map((match) => ({
        year: match[0],
        distance: Math.abs(from + (match.index ?? 0) - index),
    }));
    return years.sort((a, b) => a.distance - b.distance)[0]?.year;
}

/** Where each figure appears: always with its product and year, because cells and answers are quoted on their own. */
const FIGURE_PATHS: Record<string, string[]> = {
    "18": [
        "respect.paragraph1",
        "scorecard.rows.historicalDepth.competitor",
        "faq.items.alternativeArtnet.answer",
    ],
    "30": [
        "respect.paragraph1",
        "scorecard.rows.historicalDepth.competitor",
        "faq.items.alternativeArtpriceMutualArt.answer",
    ],
    "610": [
        "respect.paragraph1",
        "scorecard.rows.historicalDepth.competitor",
        "faq.items.alternativeWorthPoint.answer",
    ],
    "900": ["respect.paragraph1", "faq.items.alternativeArtpriceMutualArt.answer"],
};

/** The databases' own claims are attributed: "describes", "says", "cited", "according to". */
const ATTRIBUTION: Record<LocaleCode, RegExp> = {
    en: /\b(describes|says|cited|according to)\b/,
    de: /(beschreibt|gibt an|nannte|laut)/,
    es: /(describe|afirma|indica|citaba|según)/,
    fr: /(décrit|indique|faisait état|selon)/,
    it: /(descrive|dichiara|citava|secondo)/,
};

/** The page never states that the figures are added up or set against Aura Historia's own. */
const NOT_ADDED_UP: Record<LocaleCode, RegExp> = {
    en: /not added up|does not add them up/,
    de: /(weder addiert|nicht und vergleicht)/,
    es: /(no se suman|no las suma)/,
    fr: /(ni additionnés|ne les additionne)/,
    it: /(non vengono sommate|non le somma)/,
};

/** Aura Historia gives no valuations: said plainly, never as an apology and never as a promise. */
const NO_VALUATIONS: Record<LocaleCode, RegExp> = {
    en: /gives no valuations/i,
    de: /gibt keine Bewertungen/i,
    es: /no ofrece valoraciones/i,
    fr: /ne fournit aucune évaluation/i,
    it: /non fornisce valutazioni/i,
};

const NO_VALUATION_PATHS = [
    "hero.quickAnswerDescription",
    "summary.paragraph2",
    "respect.paragraph2",
    "together.paragraph2",
    "faq.items.alternativeArtnet.answer",
    "faq.items.alternativeWorthPoint.answer",
    "scorecard.rows.valuation.auraHistoria",
] as const;

const APPRAISER: Record<LocaleCode, RegExp> = {
    en: /appraiser/,
    de: /einen Gutachter/,
    es: /tasador/,
    fr: /un expert\b/,
    it: /perito/,
};

/** Never a doubt about the databases' accuracy, price or age: not ours to judge. */
const QUALITY_DOUBT: Record<LocaleCode, RegExp> = {
    en: /(inaccura|unreliab|expensive|overpriced|incomplete|misleading|flawed|\bwrong\b)/i,
    de: /(ungenau|unzuverlässig|teuer|unvollständig|irreführend|fehlerhaft|falsch)/i,
    es: /(inexact|poco fiable|caro|incomplet|engañoso|erróne)/i,
    fr: /(inexact|peu fiable|\bcher\b|chers|incomplet|trompeur|erroné)/i,
    it: /(inesatt|inaffidabil|costos|incomplet|fuorviant|errone)/i,
};

/** No prices, no currency and no per-month figure: the rules keep every pricing comparison off the page. */
const PRICING: Record<LocaleCode, RegExp> = {
    en: /([$€£]|per month|a month|monthly|\bUSD\b|\bEUR\b)/i,
    de: /([$€£]|pro Monat|monatlich|\bUSD\b|\bEUR\b)/i,
    es: /([$€£]|al mes|mensual|\bUSD\b|\bEUR\b)/i,
    fr: /([$€£]|par mois|mensuel|\bUSD\b|\bEUR\b)/i,
    it: /([$€£]|al mese|mensil|\bUSD\b|\bEUR\b)/i,
};

/** The page never says the databases hold only past or sold prices: MutualArt lists works for sale. */
const ONLY_PAST: Record<LocaleCode, RegExp> = {
    en: /\b(only|solely) (sold|past|historical)\b/i,
    de: /\bnur (verkauft|vergangen|historisch)/i,
    es: /\bs[oó]lo (resultados|precios|ventas) (pasad|vendid)/i,
    fr: /\buniquement (les )?(prix|résultats|ventes) (passé|vendu)/i,
    it: /\bsolo (prezzi|risultati|vendite) (passat|vendut)/i,
};

/** The Artnet and Artsy line says "shared leadership"-style facts only: never owned, bought or merged. */
const OWNERSHIP: Record<LocaleCode, RegExp> = {
    en: /(owned|ownership|bought|acquired|acquisition|merged|merger|takeover)/i,
    de: /(übernomm|übernahme|gekauft|fusion|besitz|eigentum)/i,
    es: /(adquir|compró|comprada|fusión|propiedad)/i,
    fr: /(rachet|acquis|fusion|propriét)/i,
    it: /(acquis|acquist|fusione|propriet)/i,
};

/**
 * The databases' own superlatives ("the world's most comprehensive record of art sales", "world
 * leader") are never repeated in the page's voice: the sources note says none is used.
 */
const SUPERLATIVES: Record<LocaleCode, RegExp> = {
    en: /(comprehensive|world's (largest|most|first)|world leader|\bleading\b|\bleader\b|largest)/i,
    de: /(umfassendst|weltweit führend|marktführer|größte[nrs]?\b|\bführend)/i,
    es: /(más completa|líder|el mayor|mayor del mundo|el primer)/i,
    fr: /(le plus complet|\bleader\b|le plus grand|premier au monde|premier marché)/i,
    it: /(più completa|\bleader\b|il più grande|primo al mondo)/i,
};

const AFFILIATION: Record<LocaleCode, RegExp> = {
    en: /not affiliated with Artnet, WorthPoint, MutualArt or Artprice/,
    de: /in keiner Verbindung zu Artnet, WorthPoint, MutualArt oder Artprice/,
    es: /no está vinculada a Artnet, WorthPoint, MutualArt ni Artprice/,
    fr: /n’est pas affiliée à Artnet, WorthPoint, MutualArt ni Artprice/,
    it: /non è affiliata ad Artnet, WorthPoint, MutualArt né ad Artprice/,
};

const DESCRIBES_APPRAISALS: Record<LocaleCode, RegExp> = {
    en: /MutualArt also describes online appraisals/,
    de: /MutualArt beschreibt außerdem Online-Wertgutachten/,
    es: /MutualArt describe además tasaciones en línea/,
    fr: /MutualArt décrit en outre des expertises en ligne/,
    it: /MutualArt descrive inoltre perizie online/,
};

describe.each(Object.entries(LOCALES))(
    "art price databases comparison copy in %s",
    (lng, locale) => {
        const code = lng as LocaleCode;
        const page = locale.compareArtPriceDatabasesPage;
        const entries = leafEntries(page);
        const copy = entries.map(([, text]) => text);
        // The meta title and description are the search-result text, so they follow the same rules.
        const searchResultCopy = leaves(locale.meta.compareArtPriceDatabases);
        const pathsMatching = (pattern: RegExp) =>
            entries.filter(([, text]) => pattern.test(text)).map(([path]) => path);
        const textAt = (path: string) =>
            entries.find(([entryPath]) => entryPath === path)?.[1] ?? "";

        it("keeps the rules' banned wording, hype, quality doubts and pricing off the page and its meta text", () => {
            expect(copy.length).toBeGreaterThan(60);
            expect(searchResultCopy).toHaveLength(2);
            for (const text of [...copy, ...searchResultCopy]) {
                expect(text).not.toMatch(BANNED_WORDING[code]);
                expect(text).not.toMatch(QUALITY_DOUBT[code]);
                expect(text).not.toMatch(PRICING[code]);
                expect(text).not.toMatch(ONLY_PAST[code]);
                expect(text).not.toMatch(/!/);
            }
        });

        it("carries no figure but the dated, attributed numbers of the four products", () => {
            for (const text of [...copy, ...searchResultCopy]) {
                for (const [digits] of withoutSeparators(text).matchAll(/\d+/g)) {
                    expect(ALLOWED_NUMBERS.has(digits), `${digits} in "${text}"`).toBe(true);
                }
            }
            for (const { figure, product, year } of FIGURES) {
                const key = String(figure).replace(/[^0-9]/g, "");
                const paths = pathsMatching(figure);
                expect(paths.sort(), `paths with ${key}`).toEqual([...FIGURE_PATHS[key]].sort());
                for (const path of paths) {
                    // Quoted on its own, the string still names the product and the year, and the
                    // product named closest before the figure and the year closest to it in its sentence are
                    // its own (a figure moved to another product's sentence would fail here).
                    const text = withoutSeparators(textAt(path));
                    const at = text.search(figure);
                    expect(nearestBrandBefore(text, at), `${path}: product before ${key}`).toBe(
                        product,
                    );
                    expect(nearestYearInSentence(text, at), `${path}: year beside ${key}`).toBe(
                        year,
                    );
                    expect(text, path).toMatch(ATTRIBUTION[code]);
                }
            }
        });

        it("never adds the figures up or sets them against Aura Historia's own", () => {
            expect(textAt("respect.paragraph2")).toMatch(NOT_ADDED_UP[code]);
            expect(textAt("scorecard.rows.historicalDepth.competitor")).toMatch(NOT_ADDED_UP[code]);
        });

        it("says plainly that Aura Historia gives no valuations, and points to appraisers and price databases", () => {
            for (const path of NO_VALUATION_PATHS) {
                expect(textAt(path), path).toMatch(NO_VALUATIONS[code]);
            }
            const worth = page.faq.items.worth;
            const no: Record<LocaleCode, string> = {
                en: "No.",
                de: "Nein.",
                es: "No.",
                fr: "Non.",
                it: "No.",
            };
            expect(worth.answer.startsWith(no[code])).toBe(true);
            expect(worth.answer).toMatch(APPRAISER[code]);
            expect(page.together.paragraph2).toMatch(APPRAISER[code]);
        });

        it("attributes MutualArt's appraisals as its own description and rates the valuation row to the databases", () => {
            const cell = textAt("scorecard.rows.valuation.competitor");
            expect(cell).toContain("MutualArt");
            expect(cell).toMatch(ATTRIBUTION[code]);
            // Only MutualArt is credited with appraisals: none of the other three is named in the cell.
            for (const brand of ["Artnet", "WorthPoint", "Artprice"]) {
                expect(cell).not.toContain(brand);
            }
            expect(textAt("faq.items.alternativeArtpriceMutualArt.answer")).toMatch(
                DESCRIBES_APPRAISALS[code],
            );
            expect(
                ART_PRICE_DATABASES_COMPARISON.scorecardRows.find((row) => row.key === "valuation")
                    ?.winner,
            ).toBe("competitor");
        });

        it("names the products untranslated, with the Artnet Price Database under its current name", () => {
            for (const brand of ["Artnet", "WorthPoint", "MutualArt", "Artprice"]) {
                expect(page.hero.subtitle).toContain(brand);
                expect(page.scorecard.headers.competitor).toContain(brand);
                // The meta description names all four, as the people who search for them do.
                expect(locale.meta.compareArtPriceDatabases.description).toContain(brand);
            }
            expect(page.hero.subtitle).toContain("Artnet Price Database");
            expect(page.respect.status).toContain("Artnet Price Database");
        });

        it("builds the status line on the Artsy page's own wording and never says owned, bought or merged", () => {
            expect(page.respect.status.startsWith(locale.compareArtsyPage.respect.status)).toBe(
                true,
            );
            expect(page.respect.status).not.toMatch(OWNERSHIP[code]);
        });

        it("says Aura Historia is not affiliated with any of the four", () => {
            expect(page.together.paragraph2).toMatch(AFFILIATION[code]);
        });

        it("names the listing page's own 'Go to provider' label where it says what happens next", () => {
            expect(page.together.paragraph1).toContain(locale.product.toMerchant);
        });

        it("answers 'past auction results' with the product's own label for an observed sale and its recorded history", () => {
            expect(page.faq.items.pastResults.answer).toContain(
                locale.product.saleObservationPrice,
            );
        });

        it("says nothing about the databases' interfaces, assistants or agents", () => {
            for (const text of [...copy, ...searchResultCopy]) {
                expect(text).not.toMatch(/(MCP|llms\.txt|\bAPI\b|\bAI\b|\bKI\b)/);
                expect(text).not.toMatch(/(agent|assistant|assistent|asistent)/i);
            }
        });

        it("rates alerts a tie and says only what the readable pages say each alert covers, with no cadence", () => {
            const cell = textAt("scorecard.rows.alerts.competitor");
            expect(cell).toContain("Artnet");
            expect(cell).toContain("MutualArt");
            expect(cell).not.toContain("WorthPoint");
            expect(cell).not.toContain("Artprice");
            for (const text of copy) {
                expect(text).not.toMatch(
                    /(daily|täglich|diari|quotidien|giornalier|hourly|stündlich|cada hora|toutes les heures|ogni ora)/i,
                );
            }
            // The tie names the two that describe alerts, wherever it is stated.
            for (const text of [
                page.scorecard.rows.alerts.verdict,
                page.quickVerdicts.alerts.label,
                page.hero.quickAnswerDescription,
            ]) {
                expect(text).toContain("Artnet");
                expect(text).toContain("MutualArt");
                expect(text).not.toContain("WorthPoint");
                expect(text).not.toContain("Artprice");
            }
        });

        it("names in the current-availability cell only the products with a readable source for it", () => {
            const cell = textAt("scorecard.rows.currentAvailability.competitor");
            // Artnet: upcoming auctions; MutualArt: artworks for sale and upcoming lots; Artprice's
            // parent company: a marketplace. WorthPoint's release says nothing of the kind.
            for (const brand of ["Artnet", "MutualArt", "Artprice"]) {
                expect(cell).toContain(brand);
            }
            expect(cell).not.toContain("WorthPoint");
            // Artprice's marketplace is attributed to its parent company and dated.
            expect(cell).toContain("2026");
            expect(cell).toMatch(ATTRIBUTION[code]);
        });

        it("repeats none of the databases' own superlatives in the page's voice", () => {
            for (const text of [...copy, ...searchResultCopy]) {
                expect(text).not.toMatch(SUPERLATIVES[code]);
            }
        });

        it("lists the access model without a price and the account-free search for Aura Historia", () => {
            const model = textAt("scorecard.rows.accessModel.competitor");
            for (const brand of ["Artnet", "MutualArt", "WorthPoint", "Artprice"]) {
                expect(model).toContain(brand);
            }
            expect(model).not.toMatch(PRICING[code]);
            expect(model).not.toMatch(/\d/);
        });
    },
);
