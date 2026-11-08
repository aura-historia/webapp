import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import {
    getComparisonChapters,
    getComparisonFaq,
    getComparisonNav,
} from "@/features/comparison/config/comparisonDefinition.ts";
import { COMPARISON_REGISTRY } from "@/features/comparison/config/comparisonRegistry.ts";
import { FIRST_DIBS_COMPARISON } from "@/features/comparison/config/firstDibsComparison.ts";
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
        result = renderWithRouter(<ComparisonPage definition={FIRST_DIBS_COMPARISON} />);
    });
    return result as ReturnType<typeof renderWithRouter>;
}

describe("ComparisonPage with the 1stDibs definition", () => {
    it("renders one h1 and an h2 with an id for every chapter, with 'alerts' as the comparing chapter", async () => {
        const { container } = await renderPage();

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: plain("compare1stdibsPage.hero.title"),
            }),
        ).toBeInTheDocument();

        const ids = getComparisonChapters(FIRST_DIBS_COMPARISON);
        expect(ids).toEqual([
            "summary",
            "respect",
            "advantages",
            "scorecard",
            "sources",
            "alerts",
            "faq",
            "verdict",
        ]);
        for (const sectionId of ids) {
            const section = container.querySelector(`section#${sectionId}`);
            expect(section).not.toBeNull();
            const headingId = section?.getAttribute("aria-labelledby") ?? "";
            expect(section?.querySelector(`h2#${headingId}`)).not.toBeNull();
        }
        expect(container.querySelector("section#together")).toBeNull();
    });

    it("derives the nav from the definition and labels the 'alerts' chapter from its copy", async () => {
        await renderPage();

        const nav = screen.getByRole("navigation", { name: t("comparison.nav.label") });
        const links = within(nav).getAllByRole("link");

        expect(links.map((link) => link.getAttribute("href"))).toEqual([
            "#summary",
            "#advantages",
            "#scorecard",
            "#sources",
            "#alerts",
            "#faq",
            "#verdict",
        ]);
        expect(
            within(nav).getByRole("link", {
                name: plain("compare1stdibsPage.nav.items.alerts"),
            }),
        ).toHaveAttribute("href", "#alerts");
        expect(getComparisonNav(FIRST_DIBS_COMPARISON).map((item) => item.marker)).toEqual([
            "I",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "→",
        ]);
    });

    it("renders the comparing-across-providers chapter from its own copy", async () => {
        const { container } = await renderPage();

        const chapter = container.querySelector("section#alerts");
        expect(chapter?.querySelector("h2#comparison-alerts-heading")).toHaveTextContent(
            plain("compare1stdibsPage.alerts.title"),
        );
        expect(chapter).toHaveTextContent(t("compare1stdibsPage.alerts.paragraph1"));
        expect(chapter).toHaveTextContent(t("compare1stdibsPage.alerts.paragraph2"));
    });

    it("concedes the curated-sellers verdict to 1stDibs in the quick answer", async () => {
        await renderPage();

        const quickAnswer = screen.getByRole("region", {
            name: plain("compare1stdibsPage.hero.quickAnswerTitle"),
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
        expect(badges[0]).toHaveTextContent("1stDibs");
    });

    it("concedes curation, rates the seller model, auctions and languages a tie, and gives Aura Historia focus and comparison", async () => {
        await renderPage();

        const table = screen.getByRole("table", {
            name: t("compare1stdibsPage.scorecard.caption"),
        });
        const columnHeaders = within(table).getAllByRole("columnheader");
        expect(columnHeaders).toHaveLength(3);
        expect(columnHeaders[1]).toHaveTextContent("1stDibs");
        const rowHeaders = within(table).getAllByRole("rowheader");
        expect(rowHeaders).toHaveLength(7);

        // The rendered badge in each criterion cell pins who the row goes to.
        const winners = ["competitor", "tie", "aura", "aura", "tie", "aura", "tie"];
        FIRST_DIBS_COMPARISON.scorecardRows.forEach((row, index) => {
            const header = rowHeaders[index];
            expect(row.winner).toBe(winners[index]);
            expect(header).toHaveTextContent(
                t(`compare1stdibsPage.scorecard.rows.${row.key}.criterion`),
            );
            expect(header).toHaveTextContent(
                t(`compare1stdibsPage.scorecard.rows.${row.key}.verdict`),
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
                t(`compare1stdibsPage.scorecard.rows.${row.key}.competitor`),
            );
            expect(cells[1]).toHaveTextContent(
                t(`compare1stdibsPage.scorecard.rows.${row.key}.auraHistoria`),
            );
        });
    });

    it("prints the fixed review date in a time element", async () => {
        const { container } = await renderPage();

        const time = container.querySelector("time");
        expect(time).toHaveAttribute("datetime", "2026-11-08");
        expect(time).toHaveTextContent("8. November 2026");
    });

    it("has no status note: there is nothing dated to state about 1stDibs' situation", async () => {
        const { container } = await renderPage();

        expect(FIRST_DIBS_COMPARISON).not.toHaveProperty("statusNote");
        expect(container.querySelector("section#respect")).not.toHaveTextContent(
            t("comparison.statusLabel"),
        );
        expect(t("compare1stdibsPage.respect.status")).toBe("compare1stdibsPage.respect.status");
    });

    it("keeps the four FAQ answers in the DOM under stable anchors, with no AI-assistants entry", async () => {
        const { container } = await renderPage();

        const faq = getComparisonFaq(FIRST_DIBS_COMPARISON);
        expect(faq.map((item) => item.anchor)).toEqual([
            "faq-alternative",
            "faq-replace",
            "faq-vetting",
            "faq-compare-prices",
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

        expect(FIRST_DIBS_COMPARISON.sources.sourceKeys).toEqual(
            BARNEBYS_COMPARISON.sources.sourceKeys,
        );
        const list = screen.getByRole("list", {
            name: t("compare1stdibsPage.downstream.sourcesLabel"),
        });
        const items = within(list).getAllByRole("listitem");
        expect(items).toHaveLength(FIRST_DIBS_COMPARISON.sources.sourceKeys.length);
        FIRST_DIBS_COMPARISON.sources.sourceKeys.forEach((key, index) => {
            expect(items[index]).toHaveTextContent(
                t(`compare1stdibsPage.downstream.sources.${key}`),
            );
        });
    });

    it("links to every other comparison in the cross-link block, never to itself or an external site", async () => {
        const { container } = await renderPage();

        const block = screen.getByRole("region", {
            name: plain("comparison.otherComparisons.title"),
        });
        const links = within(block).getAllByRole("link");
        const others = COMPARISON_REGISTRY.filter((entry) => entry.slug !== "1stdibs");
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
            screen.getByRole("link", { name: t("compare1stdibsPage.hero.primaryCta") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(
            screen.getByRole("link", { name: t("compare1stdibsPage.hero.secondaryCta") }),
        ).toHaveAttribute("href", "#scorecard");
        expect(
            screen.getByRole("link", { name: t("compare1stdibsPage.finalCta.button") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(container.querySelectorAll('a[href*="1stdibs" i]')).toHaveLength(0);
        expect(container.querySelectorAll('a[href^="http" i]')).toHaveLength(0);
    });
});

/**
 * The page never speaks of 1stDibs' finances or leadership, never calls it "leading" in its own
 * voice (the annual report and the About page say that of themselves), and never uses a US revenue
 * share or an overall country count (the application page and the annual report disagree).
 */
const FINANCES_AND_SUPERLATIVES: Record<LocaleCode, RegExp> = {
    en: /(Nasdaq|\bDIBS\b|GMV|revenue|Shellhammer|Rosenblatt|\bCEO\b|\bleading\b|world's|\b(50|70) countries)/i,
    de: /(Nasdaq|\bDIBS\b|GMV|Umsatz|Shellhammer|Rosenblatt|\bCEO\b|führend|\b(50|70) Länder)/i,
    es: /(Nasdaq|\bDIBS\b|GMV|ingresos|Shellhammer|Rosenblatt|\bCEO\b|\blíder\b|\b(50|70) países)/i,
    fr: /(Nasdaq|\bDIBS\b|GMV|chiffre d’affaires|Shellhammer|Rosenblatt|\bPDG\b|\bleader\b|\b(50|70) pays)/i,
    it: /(Nasdaq|\bDIBS\b|GMV|ricavi|Shellhammer|Rosenblatt|\bCEO\b|\bleader\b|\b(50|70) paesi)/i,
};

/** Claims about 1stDibs' sellers or prices the epic keeps off every page. */
const DISPARAGEMENT: Record<LocaleCode, RegExp> = {
    en: /(unreliable|overpriced|expensive|counterfeit|\bfakes?\b|\bscam)/i,
    de: /(unzuverlässig|überteuert|teuer|gefälscht|Fälschung|Betrug)/i,
    es: /(poco fiable|sobrevalorad|\bcaros?\b|falsific|estafa)/i,
    fr: /(peu fiable|surévalué|\bchers?\b|contrefaçon|\bfaux\b|arnaque)/i,
    it: /(inaffidabil|sopravvalutat|\bcostos[oiae]\b|contraffa|\bfals[oiae]\b|truffa)/i,
};

/** The undated application page's seller figure and the 2019 encyclopaedia figure: never used. */
const UNUSED_FIGURES = /(?<![\d.,])(7[.,\s\u00a0\u202f]?600|4[.,\s\u00a0\u202f]?000)(?!\d)/;

/** The annual report's two figures, in any of the five locales' number formats. */
const REPORT_FIGURES = /(?<![\d.,])(5[.,\s\u00a0\u202f]?700|60[.,\s\u00a0\u202f]?700)(?![\d])/;

/** Where a text names authenticity (or vetting) it must negate it: Aura Historia does neither. */
const AUTHENTICITY_WORDING: Record<LocaleCode, RegExp> = {
    en: /authentic/i,
    de: /Echtheit/i,
    es: /autentic/i,
    fr: /authentic|authentifie/i,
    it: /autentic/i,
};
const NEGATED_AUTHENTICITY: Record<LocaleCode, RegExp> = {
    en: /does not (vet or|appraise or) authenticate objects/,
    de: /Objekte nicht[, ].*Echtheit nicht/,
    es: /no (evalúa|tasa) ni autentica objetos/i,
    fr: /n’expertise ni n’authentifie les objets/i,
    it: /non valuta né autentica gli oggetti/i,
};

/** The scorecard's auction row names its source: 1stDibs' own terms. */
const AUCTION_TERMS: Record<LocaleCode, RegExp> = {
    en: /Auction Terms/,
    de: /Auktionsbedingungen/,
    es: /condiciones de subasta/,
    fr: /conditions des enchères/,
    it: /condizioni delle aste/,
};

describe.each(Object.entries(LOCALES))("1stDibs comparison copy in %s", (lng, locale) => {
    const code = lng as LocaleCode;
    const page = locale.compare1stdibsPage;
    const entries = leafEntries(page);
    const copy = entries.map(([, text]) => text);
    // The meta title and description are the search-result text, so they follow the same rules.
    const searchResultCopy = leaves(locale.meta.compare1stdibs);

    it("keeps the rules' banned wording, hype, finances and disparagement off the page and its meta text", () => {
        expect(copy.length).toBeGreaterThan(60);
        expect(searchResultCopy).toHaveLength(2);
        for (const text of [...copy, ...searchResultCopy]) {
            expect(text).not.toMatch(BANNED_WORDING[code]);
            expect(text).not.toMatch(FINANCES_AND_SUPERLATIVES[code]);
            expect(text).not.toMatch(DISPARAGEMENT[code]);
            expect(text).not.toMatch(UNUSED_FIGURES);
            expect(text).not.toMatch(/!/);
        }
    });

    it("states the annual report's figures once, in the respect chapter, with the report and its year", () => {
        const figurePaths = entries
            .filter(([, text]) => REPORT_FIGURES.test(text))
            .map(([path]) => path);
        expect(figurePaths).toEqual(["respect.paragraph1"]);

        const { paragraph1 } = page.respect;
        expect(paragraph1).toContain("1stDibs");
        expect(paragraph1).toContain("10-K");
        expect(paragraph1).toContain("2025");
        // Both figures are read from one report: the sellers' and the active buyers' count.
        expect(paragraph1.match(new RegExp(REPORT_FIGURES, "g"))).toHaveLength(2);
    });

    it("attributes the curation, the auctions, the alerts and the languages to 1stDibs and their year", () => {
        const { rows } = page.scorecard;

        for (const text of [rows.curationAndVetting.competitor, rows.sellerModel.competitor]) {
            expect(text).toContain("1stDibs");
        }
        expect(rows.auctions.competitor).toMatch(AUCTION_TERMS[code]);
        expect(rows.monitoring.competitor).toContain("2025");
        expect(rows.languages.competitor).toContain("2022");
        // The competitor's cells use its names, never ours.
        expect(rows.objectRange.competitor).not.toContain("Aura Historia");
    });

    it("never promises vetting or authenticity: where it names authenticity, Aura Historia declines it", () => {
        const namingAuthenticity = entries.filter(([, text]) =>
            AUTHENTICITY_WORDING[code].test(text),
        );

        expect(namingAuthenticity.map(([path]) => path)).toEqual([
            "summary.paragraph2",
            "respect.paragraph2",
            "scorecard.rows.curationAndVetting.auraHistoria",
            "faq.items.alternative.answer",
            "faq.items.vetting.answer",
        ]);
        for (const [path, text] of namingAuthenticity) {
            expect(text, path).toMatch(NEGATED_AUTHENTICITY[code]);
        }

        const no: Record<LocaleCode, string> = {
            en: "No.",
            de: "Nein.",
            es: "No.",
            fr: "Non.",
            it: "No.",
        };
        expect(page.faq.items.vetting.answer.startsWith(no[code])).toBe(true);
        expect(page.faq.items.replace.answer.startsWith(no[code])).toBe(true);
    });

    it("words the vetting answer like the about page's existing 'we do not authenticate' answer", () => {
        const existing = locale.aboutPage.faq.items.appraisal.answer;
        // Everything after the opening "No." sentence pair is the about page's own wording.
        const settledWithSeller = existing.slice(existing.indexOf(" ") + 1);

        expect(page.faq.items.vetting.answer.endsWith(settledWithSeller)).toBe(true);
    });

    it("names the listing page's own 'Go to provider' label where it says what the link opens", () => {
        expect(page.scorecard.rows.auctions.auraHistoria).toContain(locale.product.toMerchant);
    });

    it("lists the same provider types as the Barnebys comparison in this language", () => {
        expect(page.downstream.sources).toEqual(locale.compareBarnebysPage.downstream.sources);
    });

    it("writes 1stDibs as a plain name and says nothing about agent interfaces", () => {
        expect(page.scorecard.headers.competitor).toBe("1stDibs");
        expect(page.quickVerdicts.curatedSellers.value).toBe("1stDibs");
        for (const text of [...copy, ...searchResultCopy]) {
            expect(text).not.toMatch(/MCP|llms\.txt|\bAPI\b/);
        }
    });
});
