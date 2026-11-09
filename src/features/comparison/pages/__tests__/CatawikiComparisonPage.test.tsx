import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import { CATAWIKI_COMPARISON } from "@/features/comparison/config/catawikiComparison.ts";
import {
    type ComparisonDefinition,
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
        result = renderWithRouter(<ComparisonPage definition={CATAWIKI_COMPARISON} />);
    });
    return result as ReturnType<typeof renderWithRouter>;
}

describe("ComparisonPage with the Catawiki definition", () => {
    it("renders one h1 and an h2 with an id for every chapter, with 'together' instead of 'alerts'", async () => {
        const { container } = await renderPage();

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: plain("compareCatawikiPage.hero.title"),
            }),
        ).toBeInTheDocument();

        const ids = getComparisonChapters(CATAWIKI_COMPARISON);
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
                name: plain("compareCatawikiPage.nav.items.together"),
            }),
        ).toHaveAttribute("href", "#together");
        expect(getComparisonNav(CATAWIKI_COMPARISON).map((item) => item.marker)).toEqual([
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
            plain("compareCatawikiPage.together.title"),
        );
        expect(together).toHaveTextContent(t("compareCatawikiPage.together.paragraph1"));
        expect(together).toHaveTextContent(t("compareCatawikiPage.together.paragraph2"));
    });

    it("concedes curated weekly auctions and buyer protection to Catawiki in the quick answer", async () => {
        await renderPage();

        const quickAnswer = screen.getByRole("region", {
            name: plain("compareCatawikiPage.hero.quickAnswerTitle"),
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
        expect(badges[0]).toHaveTextContent("Catawiki");
    });

    it("concedes curation and the weekly rhythm, rates languages a tie and gives Aura Historia the scope rows", async () => {
        await renderPage();

        const table = screen.getByRole("table", {
            name: t("compareCatawikiPage.scorecard.caption"),
        });
        const columnHeaders = within(table).getAllByRole("columnheader");
        expect(columnHeaders).toHaveLength(3);
        expect(columnHeaders[1]).toHaveTextContent("Catawiki");
        const rowHeaders = within(table).getAllByRole("rowheader");
        expect(rowHeaders).toHaveLength(6);

        // The rendered badge in each criterion cell pins who the row goes to.
        const winners = ["competitor", "competitor", "tie", "aura", "aura", "aura"];
        CATAWIKI_COMPARISON.scorecardRows.forEach((row, index) => {
            const header = rowHeaders[index];
            expect(row.winner).toBe(winners[index]);
            expect(header).toHaveTextContent(
                t(`compareCatawikiPage.scorecard.rows.${row.key}.criterion`),
            );
            expect(header).toHaveTextContent(
                t(`compareCatawikiPage.scorecard.rows.${row.key}.verdict`),
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
                t(`compareCatawikiPage.scorecard.rows.${row.key}.competitor`),
            );
            expect(cells[1]).toHaveTextContent(
                t(`compareCatawikiPage.scorecard.rows.${row.key}.auraHistoria`),
            );
        });
    });

    it("prints the fixed review date in a time element", async () => {
        const { container } = await renderPage();

        const time = container.querySelector("time");
        expect(time).toHaveAttribute("datetime", "2026-11-09");
        expect(time).toHaveTextContent("9. November 2026");
    });

    it("has no status note: nothing in the sources says anything about Catawiki's situation", async () => {
        const { container } = await renderPage();

        expect((CATAWIKI_COMPARISON as ComparisonDefinition).statusNote).toBeUndefined();
        expect(container.querySelector("section#respect")).not.toHaveTextContent(
            t("comparison.statusLabel"),
        );
    });

    it("keeps the five FAQ answers in the DOM under stable anchors and no AI-assistants entry", async () => {
        const { container } = await renderPage();

        const faq = getComparisonFaq(CATAWIKI_COMPARISON);
        expect(faq.map((item) => item.anchor)).toEqual([
            "faq-alternative",
            "faq-replace",
            "faq-bid",
            "faq-dealer-stock",
            "faq-languages",
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

        expect(CATAWIKI_COMPARISON.sources.sourceKeys).toEqual(
            BARNEBYS_COMPARISON.sources.sourceKeys,
        );
        const list = screen.getByRole("list", {
            name: t("compareCatawikiPage.downstream.sourcesLabel"),
        });
        const items = within(list).getAllByRole("listitem");
        expect(items).toHaveLength(CATAWIKI_COMPARISON.sources.sourceKeys.length);
        CATAWIKI_COMPARISON.sources.sourceKeys.forEach((key, index) => {
            expect(items[index]).toHaveTextContent(
                t(`compareCatawikiPage.downstream.sources.${key}`),
            );
        });
    });

    it("links to every other comparison in the cross-link block, never to itself or an external site", async () => {
        const { container } = await renderPage();

        const block = screen.getByRole("region", {
            name: plain("comparison.otherComparisons.title"),
        });
        const links = within(block).getAllByRole("link");
        const others = COMPARISON_REGISTRY.filter((entry) => entry.slug !== "catawiki");
        expect(COMPARISON_REGISTRY.map((entry) => entry.slug)).toContain("catawiki");
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
            screen.getByRole("link", { name: t("compareCatawikiPage.hero.primaryCta") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(
            screen.getByRole("link", { name: t("compareCatawikiPage.hero.secondaryCta") }),
        ).toHaveAttribute("href", "#scorecard");
        expect(
            screen.getByRole("link", { name: t("compareCatawikiPage.finalCta.button") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(container.querySelectorAll('a[href*="catawiki" i]')).toHaveLength(0);
        expect(container.querySelectorAll('a[href^="http" i]')).toHaveLength(0);
    });
});

/**
 * Every number the page may carry. The only figure is "over 75,000 objects every week", dated to
 * Catawiki's Terms of Use valid from 18 March 2024. The issue's About-page figures (10+ million
 * visitors, 600+ auctions, 60 countries, 17 languages, 600+ employees, 7 to 10 day auctions) could
 * not be read from Catawiki's own pages and are not used, and neither are fee percentages.
 */
const ALLOWED_NUMBERS = new Set(["75", "000", "18", "2024"]);

/** Catawiki's weekly object count and the date of the documents it comes from, in every language. */
const DATED_FIGURE_PATHS = [
    "respect.paragraph1",
    "scorecard.rows.weeklyAuctions.competitor",
] as const;

/**
 * Catawiki's own wording that the page does not use in its own voice ("the leading online
 * marketplace"): the page only attributes what it concedes.
 */
const SELF_DESCRIPTIONS: Record<LocaleCode, RegExp> = {
    en: /(\bleading\b|most trusted|world['’]s)/i,
    de: /(führend|vertrauenswürdigst|weltweit größt)/i,
    es: /(\blíder\b|más confiable|más fiable|mayor del mundo)/i,
    fr: /(\bleader\b|le plus fiable|le plus digne de confiance|premier au monde)/i,
    it: /(\bleader\b|più affidabile|più fidato|più grande del mondo)/i,
};

/** Never a doubt about Catawiki's quality, safety or authenticity: not the competitor's to judge. */
const QUALITY_DOUBT: Record<LocaleCode, RegExp> = {
    en: /(virtual|can['’]t guarantee|cannot guarantee|counterfeit|\bfakes?\b|complaint|criticis)/i,
    de: /(virtuell|nicht garantier|gefälscht|fälschung|beschwerde|kritik)/i,
    es: /(virtual|no puede garantizar|falsific|reclamaci|crític)/i,
    fr: /(virtuel|ne peut pas garantir|contrefa|\bfaux\b|réclamation|critiqu)/i,
    it: /(virtual|non può garantire|contraffa|falsific|reclam|critic)/i,
};

/** No category list: the readable Catawiki documents do not give one, so the page names none. */
const CATEGORY_LIST: Record<LocaleCode, RegExp> = {
    en: /(jewel|watches|classic car|collectab|\bcoins?\b|stamps|comics|\bwine\b|whisk)/i,
    de: /(schmuck|uhren|oldtimer|sammlerstück|münzen|briefmarken|comics|\bwein\b|whisk)/i,
    es: /(joyer|relojes|coches clásicos|coleccionables|monedas|sellos|cómics|\bvino\b|whisk)/i,
    fr: /(bijou|montres|voitures de collection|objets de collection|monnaies|timbres|bandes dessinées|\bvin\b|whisk)/i,
    it: /(gioiell|orologi|auto d['’]epoca|collezionabili|monete|francobolli|fumetti|\bvino\b|whisk)/i,
};

/** Catawiki's follows, favourites and alerts could not be read: the page describes none of them. */
const CATAWIKI_MONITORING: Record<LocaleCode, RegExp> = {
    en: /(alert|notif|follow|favourit|saved search|watchlist)/i,
    de: /(benachrichtig|folgen|favorit|gespeicherte|merkliste|alarm)/i,
    es: /(alerta|notific|seguir|favorit|búsquedas guardadas|lista de seguimiento)/i,
    fr: /(alerte|notific|suivre|favori|recherches enregistrées|liste de surveillance)/i,
    it: /(avvis|notific|seguire|preferit|ricerche salvate|lista dei preferiti)/i,
};

/** No fee talk, and no talk of how results are ranked or promoted. */
const PAID_PLACEMENT: Record<LocaleCode, RegExp> = {
    en: /(sponsor|paid placement|promot|advertis|boost|\d\s?%)/i,
    de: /(gesponsert|bezahlte Platzierung|Werbung|bewirbt|Sponsor|\d\s?%)/i,
    es: /(patrocin|posicionamiento de pago|publicidad|promoci|\d\s?%)/i,
    fr: /(sponsoris|placement payant|publicité|promotion|\d\s?%)/i,
    it: /(sponsoriz|posizionamento a pagamento|pubblicit|promozion|\d\s?%)/i,
};

/** No alert cadence: the daily or weekly rhythm of an alert invites a speed comparison. */
const CADENCE: Record<LocaleCode, RegExp> = {
    en: /(daily|every day|hourly|every hour|each day|weekly email)/i,
    de: /(täglich|stündlich|jeden Tag)/i,
    es: /(diari|cada día|cada hora)/i,
    fr: /(quotidien|chaque jour|toutes les heures)/i,
    it: /(giornalier|ogni giorno|ogni ora|quotidian)/i,
};

/** The page never claims more or better language support for Aura Historia than Catawiki has. */
const LANGUAGE_WIN: Record<LocaleCode, RegExp> = {
    en: /(more languages than|wider language|broader language|better language|multilingual than)/i,
    de: /(mehr Sprachen als|breiteres Sprachangebot|besser mehrsprachig)/i,
    es: /(más idiomas que|mayor variedad de idiomas|mejor soporte)/i,
    fr: /(plus de langues que|plus large choix de langues|meilleur support)/i,
    it: /(più lingue di|maggiore varietà di lingue|miglior supporto)/i,
};

/** Catawiki's own wording on languages ("available in multiple languages"), without a count. */
const MULTIPLE_LANGUAGES: Record<LocaleCode, RegExp> = {
    en: /multiple languages/,
    de: /mehreren Sprachen/,
    es: /varios idiomas/,
    fr: /plusieurs langues/,
    it: /più lingue/,
};

/** Its terms refer to machine translation of object descriptions. */
const MACHINE_TRANSLATION: Record<LocaleCode, RegExp> = {
    en: /machine translation of object descriptions/,
    de: /maschinelle Übersetzung von Objektbeschreibungen/,
    es: /traducción automática de las descripciones de los objetos/,
    fr: /traduction automatique des descriptions d’objets/,
    it: /traduzione automatica delle descrizioni degli oggetti/,
};

/** The h1 does not claim the "whole market", which nobody can verify. */
const WHOLE_MARKET: Record<LocaleCode, RegExp> = {
    en: /whole market|entire market/i,
    de: /gesamten Markt|ganzen Markt/i,
    es: /todo el mercado|mercado entero/i,
    fr: /tout le marché|marché entier/i,
    it: /tutto il mercato|intero mercato/i,
};

/** Where the copy says some Catawiki objects can be bought directly, as its Buyer Terms do. */
const BUY_NOW: Record<LocaleCode, RegExp> = {
    en: /buy now option/,
    de: /Option zum direkten Kauf/,
    es: /opción de compra directa/,
    fr: /option d’achat direct/,
    it: /opzione di acquisto diretto/,
};

describe.each(Object.entries(LOCALES))("Catawiki comparison copy in %s", (lng, locale) => {
    const code = lng as LocaleCode;
    const page = locale.compareCatawikiPage;
    const entries = leafEntries(page);
    const copy = entries.map(([, text]) => text);
    // The meta title and description are the search-result text, so they follow the same rules.
    const searchResultCopy = leaves(locale.meta.compareCatawiki);
    const pathsMatching = (pattern: RegExp) =>
        entries.filter(([, text]) => pattern.test(text)).map(([path]) => path);
    const textAt = (path: string) => entries.find(([entryPath]) => entryPath === path)?.[1] ?? "";

    it("keeps the rules' banned wording, hype, self-description, fee talk and quality doubts off the page and its meta text", () => {
        expect(copy.length).toBeGreaterThan(60);
        expect(searchResultCopy).toHaveLength(2);
        for (const text of [...copy, ...searchResultCopy]) {
            expect(text).not.toMatch(BANNED_WORDING[code]);
            expect(text).not.toMatch(SELF_DESCRIPTIONS[code]);
            expect(text).not.toMatch(QUALITY_DOUBT[code]);
            expect(text).not.toMatch(PAID_PLACEMENT[code]);
            expect(text).not.toMatch(CADENCE[code]);
            expect(text).not.toMatch(LANGUAGE_WIN[code]);
            expect(text).not.toMatch(/!/);
        }
        expect(page.hero.title).not.toMatch(WHOLE_MARKET[code]);
    });

    it("carries no figure but the dated weekly object count", () => {
        for (const text of [...copy, ...searchResultCopy]) {
            for (const [digits] of text.matchAll(/\d+/g)) {
                expect(ALLOWED_NUMBERS.has(digits), `${digits} in "${text}"`).toBe(true);
            }
        }
        for (const path of DATED_FIGURE_PATHS) {
            const text = textAt(path);
            expect(text, path).toMatch(/75[.,\s]?000/);
            // The figure is dated to the documents, never presented as a current count.
            expect(text, path).toContain("2024");
            expect(text, path).toContain("18");
        }
        expect(pathsMatching(/75[.,\s]?000/)).toEqual([
            "respect.paragraph1",
            "scorecard.rows.weeklyAuctions.competitor",
        ]);
    });

    it("attributes Catawiki's own claims with a saying verb and its weekly figure to its dated Terms of Use", () => {
        const saying: Record<LocaleCode, RegExp> = {
            en: /\bsays\b/i,
            de: /(gibt an|sagt)/i,
            es: /afirma/i,
            fr: /indique/i,
            it: /dichiara/i,
        };
        const termsOfUse: Record<LocaleCode, RegExp> = {
            en: /Terms of Use/,
            de: /Nutzungsbedingungen/,
            es: /Condiciones de uso/,
            fr: /Conditions d’utilisation/,
            it: /Termini di utilizzo/,
        };
        for (const path of [
            "respect.paragraph1",
            "scorecard.rows.curationAndProtection.competitor",
            "scorecard.rows.languageBreadth.competitor",
            "faq.items.languages.answer",
        ]) {
            expect(textAt(path), path).toMatch(saying[code]);
        }
        for (const path of DATED_FIGURE_PATHS) {
            expect(textAt(path), path).toMatch(termsOfUse[code]);
        }
    });

    it("says some Catawiki objects have a buy now option and rests Aura Historia's claim on dealers' own websites", () => {
        const { dealersAndFixedPrice, sourceTypes } = page.scorecard.rows;

        expect(dealersAndFixedPrice.competitor).toMatch(BUY_NOW[code]);
        expect(sourceTypes.competitor).toMatch(BUY_NOW[code]);
        expect(page.faq.items.dealerStock.answer).toMatch(BUY_NOW[code]);
        // The Aura Historia side is about stock on the dealers' own websites, not fixed prices alone.
        expect(dealersAndFixedPrice.verdict).toMatch(
            /(across websites|über Websites hinweg|entre sitios web|sur plusieurs sites|su più siti web)/,
        );
    });

    it("rates language breadth a tie with 'no difference documented' and names no language count", () => {
        const { languageBreadth } = page.scorecard.rows;

        expect(languageBreadth.verdict).toMatch(
            /(No difference documented|Kein dokumentierter Unterschied|Sin diferencia documentada|Aucune différence documentée|Nessuna differenza documentata)/,
        );
        // Catawiki's own wording is "multiple languages", with machine translation of object
        // descriptions in its terms; the About page's count is not used.
        expect(languageBreadth.competitor).toMatch(MULTIPLE_LANGUAGES[code]);
        expect(languageBreadth.competitor).toMatch(MACHINE_TRANSLATION[code]);
        expect(page.faq.items.languages.answer).toMatch(MULTIPLE_LANGUAGES[code]);
        // Aura Historia's side lists its five languages and claims no advantage.
        expect(languageBreadth.auraHistoria).toMatch(/\((?:[^,()]+,){4}[^,()]+\)/);
    });

    it("names no Catawiki category and describes none of its follows, favourites or alerts", () => {
        for (const text of copy) {
            expect(text).not.toMatch(CATEGORY_LIST[code]);
        }
        // Only Aura Historia's own monitoring is described, never Catawiki's.
        const catawikiSide = [
            "respect.paragraph1",
            "scorecard.rows.curationAndProtection.competitor",
            "scorecard.rows.weeklyAuctions.competitor",
            "scorecard.rows.languageBreadth.competitor",
            "scorecard.rows.sourceTypes.competitor",
            "scorecard.rows.dealersAndFixedPrice.competitor",
            "scorecard.rows.categoryFocus.competitor",
        ];
        for (const path of catawikiSide) {
            expect(textAt(path), path).not.toMatch(CATAWIKI_MONITORING[code]);
        }
        expect(page.quickVerdicts.monitoring.value).toBe("Aura Historia");
    });

    it("quotes Catawiki's self-description once, in the category row, and only in English as a quotation", () => {
        const { categoryFocus } = page.scorecard.rows;

        if (code === "en") {
            expect(categoryFocus.competitor).toContain(
                "“special objects that fulfil people's passions”",
            );
        }
        expect(categoryFocus.verdict.length).toBeGreaterThan(0);
        // A statement of focus, not of quality.
        expect(page.advantages.cards.artAntiquesDesignFocus.description.length).toBeGreaterThan(20);
    });

    it("names the listing page's own 'Go to provider' label where it says what happens next", () => {
        const label = locale.product.toMerchant;

        expect(page.together.paragraph1).toContain(label);
        expect(page.faq.items.bid.answer).toContain(label);
    });

    it("says Aura Historia takes no bids and is not affiliated with Catawiki", () => {
        const affiliation: Record<LocaleCode, RegExp> = {
            en: /not affiliated with Catawiki/,
            de: /in keiner Verbindung zu Catawiki/,
            es: /no está vinculada a Catawiki/,
            fr: /n’est pas affiliée à Catawiki/,
            it: /non è affiliata a Catawiki/,
        };
        const no: Record<LocaleCode, string> = {
            en: "No.",
            de: "Nein.",
            es: "No.",
            fr: "Non.",
            it: "No.",
        };

        expect(page.together.paragraph2).toMatch(affiliation[code]);
        expect(page.faq.items.bid.answer.startsWith(no[code])).toBe(true);
        expect(page.faq.items.replace.answer.startsWith(no[code])).toBe(true);
    });

    it("lists the same provider types as the Barnebys comparison in this language", () => {
        expect(page.downstream.sources).toEqual(locale.compareBarnebysPage.downstream.sources);
    });

    it("writes Catawiki as a plain name and says nothing about agent interfaces", () => {
        expect(page.scorecard.headers.competitor).toBe("Catawiki");
        expect(page.quickVerdicts.curatedAuctions.value).toBe("Catawiki");
        for (const text of [...copy, ...searchResultCopy]) {
            expect(text).not.toMatch(/MCP|llms\.txt|\bAPI\b/);
        }
    });
});
