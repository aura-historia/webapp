import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    type ComparisonDefinition,
    getComparisonChapters,
    getComparisonFaq,
    getComparisonNav,
} from "@/features/comparison/config/comparisonDefinition.ts";
import { COMPARISON_REGISTRY } from "@/features/comparison/config/comparisonRegistry.ts";
import { VINTED_COMPARISON } from "@/features/comparison/config/vintedComparison.ts";
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
        result = renderWithRouter(<ComparisonPage definition={VINTED_COMPARISON} />);
    });
    return result as ReturnType<typeof renderWithRouter>;
}

describe("ComparisonPage with the Vinted definition", () => {
    it("renders one h1 and an h2 with an id for every chapter, with 'together' instead of 'alerts'", async () => {
        const { container } = await renderPage();

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: plain("compareVintedPage.hero.title"),
            }),
        ).toBeInTheDocument();

        const ids = getComparisonChapters(VINTED_COMPARISON);
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
                name: plain("compareVintedPage.nav.items.together"),
            }),
        ).toHaveAttribute("href", "#together");
        expect(getComparisonNav(VINTED_COMPARISON).map((item) => item.marker)).toEqual([
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
            plain("compareVintedPage.together.title"),
        );
        expect(together).toHaveTextContent(t("compareVintedPage.together.paragraph1"));
        expect(together).toHaveTextContent(t("compareVintedPage.together.paragraph2"));
    });

    it("concedes second-hand trading between members to Vinted in the quick answer and keeps four verdicts", async () => {
        await renderPage();

        const quickAnswer = screen.getByRole("region", {
            name: plain("compareVintedPage.hero.quickAnswerTitle"),
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
        expect(badges[0]).toHaveTextContent("Vinted");
        // No cross-language verdict: the test ran on the Aura Historia side only, so it cannot
        // support a verdict over Vinted. No buyer-protection verdict either: Vinted's help pages
        // are off limits to automated requests.
        expect(VINTED_COMPARISON.quickVerdicts.map((verdict) => verdict.key)).toEqual([
            "secondHandTrading",
            "artAntiquesDesign",
            "dealerStock",
            "monitoring",
        ]);
    });

    it("concedes the marketplace and its shipping and payment services, gives Aura Historia focus and who sells, and rates languages a tie", async () => {
        await renderPage();

        const table = screen.getByRole("table", {
            name: t("compareVintedPage.scorecard.caption"),
        });
        const columnHeaders = within(table).getAllByRole("columnheader");
        expect(columnHeaders).toHaveLength(3);
        expect(columnHeaders[1]).toHaveTextContent("Vinted");
        const rowHeaders = within(table).getAllByRole("rowheader");
        expect(rowHeaders).toHaveLength(5);

        // The rendered badge in each criterion cell pins who the row goes to. There is no
        // buyer-protection or monitoring row: neither could be read from a permitted source.
        const winners = ["competitor", "competitor", "aura", "aura", "tie"];
        expect(VINTED_COMPARISON.scorecardRows.map((row) => row.key)).toEqual([
            "marketplaceModel",
            "shippingAndPayment",
            "categoryFocus",
            "providerTypes",
            "languagesAndTerminology",
        ]);
        VINTED_COMPARISON.scorecardRows.forEach((row, index) => {
            const header = rowHeaders[index];
            expect(row.winner).toBe(winners[index]);
            expect(header).toHaveTextContent(
                t(`compareVintedPage.scorecard.rows.${row.key}.criterion`),
            );
            expect(header).toHaveTextContent(
                t(`compareVintedPage.scorecard.rows.${row.key}.verdict`),
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
                t(`compareVintedPage.scorecard.rows.${row.key}.competitor`),
            );
            expect(cells[1]).toHaveTextContent(
                t(`compareVintedPage.scorecard.rows.${row.key}.auraHistoria`),
            );
        });
    });

    it("prints the fixed review date in a time element", async () => {
        const { container } = await renderPage();

        const time = container.querySelector("time");
        expect(time).toHaveAttribute("datetime", "2026-11-26");
        expect(time).toHaveTextContent("26. November 2026");
    });

    it("has no status note: nothing in the sources says anything about Vinted's situation", async () => {
        const { container } = await renderPage();

        expect((VINTED_COMPARISON as ComparisonDefinition).statusNote).toBeUndefined();
        expect(container.querySelector("section#respect")).not.toHaveTextContent(
            t("comparison.statusLabel"),
        );
    });

    it("keeps the five FAQ answers in the DOM under stable anchors and no AI-assistants entry", async () => {
        const { container } = await renderPage();

        const faq = getComparisonFaq(VINTED_COMPARISON);
        expect(faq.map((item) => item.anchor)).toEqual([
            "faq-alternative",
            "faq-replace",
            "faq-sell-own-items",
            "faq-everyday-goods",
            "faq-authenticity",
        ]);
        for (const item of faq) {
            const entry = container.querySelector(`#${item.anchor}`);
            expect(entry).not.toBeNull();
            expect(entry).toHaveTextContent(t(item.questionKey));
            expect(entry).toHaveTextContent(t(item.answerKey));
        }
        expect(container.querySelector("#faq-ai-assistants")).toBeNull();
        expect(container.querySelector("#agents")).toBeNull();
    });

    it("lists the scope of the Aura Historia Handbook in its own copy, not the ruled provider types of the auction and marketplace pages", async () => {
        await renderPage();

        // The Handbook's "In" rows that the live index shows (Strategy and roadmap, "Scope").
        // Designer vintage is left out (partners only), and the older pages' provider types
        // (auction houses, auction platforms, private sellers, marketplaces) are not Aura
        // Historia's providers today: the live index holds dealers only, and the Handbook rules
        // out open classifieds.
        expect(VINTED_COMPARISON.sources.sourceKeys).toEqual([
            "antiquesDecorativeArts",
            "historicArt",
            "rareAndAntiquarianBooks",
            "coinsStampsMilitaria",
        ]);
        for (const providerType of [
            "auctionHouses",
            "auctionPlatforms",
            "privateSellers",
            "marketplaces",
        ]) {
            expect(VINTED_COMPARISON.sources.sourceKeys).not.toContain(providerType);
        }
        const list = screen.getByRole("list", {
            name: t("compareVintedPage.downstream.sourcesLabel"),
        });
        const items = within(list).getAllByRole("listitem");
        expect(items).toHaveLength(VINTED_COMPARISON.sources.sourceKeys.length);
        VINTED_COMPARISON.sources.sourceKeys.forEach((key, index) => {
            expect(items[index]).toHaveTextContent(
                t(`compareVintedPage.downstream.sources.${key}`),
            );
        });
    });

    it("links to every other comparison in the cross-link block, never to itself or an external site", async () => {
        const { container } = await renderPage();

        const block = screen.getByRole("region", {
            name: plain("comparison.otherComparisons.title"),
        });
        const links = within(block).getAllByRole("link");
        const others = COMPARISON_REGISTRY.filter((entry) => entry.slug !== "vinted");
        expect(COMPARISON_REGISTRY.map((entry) => entry.slug)).toContain("vinted");
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
            screen.getByRole("link", { name: t("compareVintedPage.hero.primaryCta") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(
            screen.getByRole("link", { name: t("compareVintedPage.hero.secondaryCta") }),
        ).toHaveAttribute("href", "#scorecard");
        expect(
            screen.getByRole("link", { name: t("compareVintedPage.finalCta.button") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(container.querySelectorAll('a[href*="vinted" i]')).toHaveLength(0);
        expect(container.querySelectorAll('a[href^="http" i]')).toHaveLength(0);
        expect(container.querySelectorAll("img")).toHaveLength(0);
    });
});

/**
 * Every number the page may carry, all from Vinted's results release for 2025 and dated to it:
 * the year itself and the 500,000 pick-up and drop-off points (its digits are 500 and 000 in every
 * locale's number format). "C2C" is Vinted's own term, not a figure. The release's gross
 * merchandise value, revenue and profit are finances and stay off the page.
 */
const ALLOWED_NUMBERS = new Set(["2025", "500", "000"]);
const C2C = /C2C/g;

/**
 * Every string that cites Vinted's release names it and its year, because FAQ answers and
 * scorecard cells are quoted on their own.
 */
const RELEASE_PATHS = [
    "hero.subtitle",
    "hero.quickAnswerDescription",
    "respect.paragraph1",
    "scorecard.description",
    "scorecard.rows.marketplaceModel.competitor",
    "scorecard.rows.shippingAndPayment.competitor",
    "scorecard.rows.categoryFocus.competitor",
    "scorecard.rows.providerTypes.competitor",
    "scorecard.rows.languagesAndTerminology.competitor",
    "faq.items.alternative.answer",
    "faq.items.sellOwnItems.answer",
    "faq.items.everydayGoods.answer",
] as const;

const RELEASE: Record<LocaleCode, RegExp> = {
    en: /annual results release for 2025/,
    de: /Pressemitteilung zu den Jahresergebnissen 2025/,
    es: /comunicado de resultados anuales de 2025/,
    fr: /communiqué sur les résultats annuels 2025/,
    it: /comunicato sui risultati annuali 2025/,
};

/** Vinted's own claims are attributed: "describes", "names", "says", "according to". */
const ATTRIBUTION: Record<LocaleCode, RegExp> = {
    en: /\b(describes|names|says|according to)\b/,
    de: /(beschreibt|nennt|gibt an|nach der Beschreibung)/,
    es: /(describe|afirma|menciona|según)/,
    fr: /(décrit|indique|cite|selon)/,
    it: /(descrive|afferma|cita|secondo)/,
};

/**
 * Vinted's mission and self-praise, which the page leaves out: "make second-hand the first
 * choice", and any superlative or "leading".
 */
const SELF_DESCRIPTIONS: Record<LocaleCode, RegExp> = {
    en: /(first choice|largest|\bleading\b|\bleader\b)/i,
    de: /(erste Wahl|größt|führend)/i,
    es: /(primera opción|\bmayor\b|\blíder\b)/i,
    fr: /(premier choix|plus grand|\bleader\b)/i,
    it: /(prima scelta|più grande|\bleader\b)/i,
};

/** Never a doubt about Vinted's quality, safety or authenticity: not the competitor's to judge. */
const QUALITY_DOUBT: Record<LocaleCode, RegExp> = {
    en: /(counterfeit|\bfakes?\b|fraud|scam|complaint|criticis|unsafe|risk)/i,
    de: /(gefälscht|fälschung|betrug|beschwerde|kritik|unsicher|risiko)/i,
    es: /(falsific|fraude|estafa|reclamaci|crític|inseguro|riesgo)/i,
    fr: /(contrefa|\bfaux\b|fraude|arnaque|réclamation|critiqu|risque)/i,
    it: /(contraffa|falsific|frode|truffa|reclam|critic|insicur|rischio)/i,
};

/** The issue's draft headline "sells everything": the page never says it of either side. */
const SELLS_EVERYTHING: Record<LocaleCode, RegExp> = {
    en: /(sells everything|general marketplace|everything)/i,
    de: /(verkauft alles|allgemeiner Marktplatz|alles)/i,
    es: /(vende de todo|marketplace general|todo)\b/i,
    fr: /(vend tout|place de marché généraliste|tout)\b/i,
    it: /(vende tutto|marketplace generalista|tutto)\b/i,
};

/** The page never says Vinted itself "sells": its members do, on the marketplace. */
const VINTED_SELLS: Record<LocaleCode, RegExp> = {
    en: /\bVinted sells\b/,
    de: /Vinted verkauft/,
    es: /Vinted vende/,
    fr: /Vinted vend\b/,
    it: /Vinted vende/,
};

/**
 * Vinted's buyer protection could not be read: its help pages are off limits to automated
 * requests (robots.txt), and the results release names none. The page says nothing about it.
 */
const BUYER_PROTECTION: Record<LocaleCode, RegExp> = {
    en: /(buyer protection|protect)/i,
    de: /(käuferschutz|schutz)/i,
    es: /(protecci)/i,
    fr: /(protection)/i,
    it: /(protezion)/i,
};

/** Vinted's saved searches and alerts could not be read: the page describes none of them. */
const VINTED_MONITORING: Record<LocaleCode, RegExp> = {
    en: /(alert|notif|follow|favourit|saved search|watchlist|watch list)/i,
    de: /(benachrichtig|folgen|favorit|gespeicherte|merkliste|alarm)/i,
    es: /(alerta|notific|seguir|favorit|búsquedas guardadas|lista de seguimiento)/i,
    fr: /(alerte|notific|suivre|favori|recherches enregistrées|liste de surveillance)/i,
    it: /(avvis|notific|seguire|preferit|ricerche salvate|lista dei preferiti)/i,
};

/**
 * The release calls the people who buy and sell "members" and never says whether they are private
 * individuals or businesses: the page does not say it either. (The consumer-to-consumer
 * expansion of "C2C" is Vinted's own term.)
 */
const SELLER_STATUS: Record<LocaleCode, RegExp> = {
    en: /(private|amateur|non-professional|individuals)/i,
    de: /(privat|laien)/i,
    es: /(privad|aficionad|particulares)/i,
    fr: /(privé|amateur|particuliers\b)/i,
    it: /(privat|amator)/i,
};

/** The release does not call fashion Vinted's "base": the page says "core fashion", attributed. */
const FASHION_BASE: Record<LocaleCode, RegExp> = {
    en: /\bbase\b/i,
    de: /\bBasis\b/,
    es: /\bbase\b/i,
    fr: /\bbase\b/i,
    it: /\bbase\b/i,
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

/** No size comparison with Vinted ("more objects than"). */
const MORE_OBJECTS: Record<LocaleCode, RegExp> = {
    en: /(more|larger|bigger|wider|smaller) (objects|lots|listings|inventory|selection|buyers|members) than/i,
    de: /(mehr|größere[rs]?|kleinere[rs]?) (Objekte|Angebote|Auswahl|Käufer|Mitglieder) als/i,
    es: /(más|mayor|menor) (objetos|anuncios|oferta|selección|compradores|miembros) que/i,
    fr: /(plus d’(objets|annonces|acheteurs|membres)|plus grande sélection|moins d’acheteurs) que/i,
    it: /(più (oggetti|annunci|acquirenti|membri)|maggiore (offerta|selezione)) di/i,
};

/**
 * The Aura Historia side follows the Handbook and the live index: no auction houses, auction
 * platforms or private sellers among its providers (the index holds dealers only, and the
 * Handbook rules out open classifieds), and no designer vintage (partners only, for now).
 */
const OUT_OF_SCOPE_PROVIDERS: Record<LocaleCode, RegExp> = {
    en: /(auction house|auction platform|private seller)/i,
    de: /(Auktionshäuser|Auktionsplattform|private Verkäufer|Privatverkäufer)/i,
    es: /(casas? de subastas|plataformas? de subastas|vendedores? privados?)/i,
    fr: /(maisons? de ventes|plateformes? d’enchères|vendeurs? privés?)/i,
    it: /(case d’asta|piattaform\w+ d’asta|venditori privati)/i,
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

/** Where a claim about the overlap of Vinted and the index could slip in: Vinted is never named. */
const VINTED_FREE_PATHS = (path: string) =>
    /^(advantages|downstream)\./.test(path) || /^scorecard\.rows\.[^.]+\.auraHistoria$/.test(path);

/** On Aura Historia's own language claims, any comparative at all is out. */
const LANGUAGE_COMPARATIVE: Record<LocaleCode, RegExp> = {
    en: /(more languages|wider|broader|better|superior|stronger)/i,
    de: /(mehr Sprachen|breiter|besser|überlegen|stärker)/i,
    es: /(más idiomas|más amplio|mejor|superior|más fuerte)/i,
    fr: /(plus de langues|plus large|meilleur|supérieur|plus fort)/i,
    it: /(più lingue|più ampi|migliore|superiore|più forte)/i,
};

/** The h1 does not claim the "whole market", which nobody can verify. */
const WHOLE_MARKET: Record<LocaleCode, RegExp> = {
    en: /whole market|entire market/i,
    de: /gesamten Markt|ganzen Markt/i,
    es: /todo el mercado|mercado entero/i,
    fr: /tout le marché|marché entier/i,
    it: /tutto il mercato|intero mercato/i,
};

describe.each(Object.entries(LOCALES))("Vinted comparison copy in %s", (lng, locale) => {
    const code = lng as LocaleCode;
    const page = locale.compareVintedPage;
    const entries = leafEntries(page);
    const copy = entries.map(([, text]) => text);
    // The meta title and description are the search-result text, so they follow the same rules.
    const searchResultCopy = leaves(locale.meta.compareVinted);
    const pathsMatching = (pattern: RegExp) =>
        entries.filter(([, text]) => pattern.test(text)).map(([path]) => path);
    const textAt = (path: string) => entries.find(([entryPath]) => entryPath === path)?.[1] ?? "";
    const vintedSide = entries.filter(
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
            expect(text).not.toMatch(/!/);
        }
        expect(page.hero.title).not.toMatch(WHOLE_MARKET[code]);
        expect(page.hero.title).not.toMatch(SELLS_EVERYTHING[code]);
        expect(page.hero.quickAnswerTitle).not.toMatch(SELLS_EVERYTHING[code]);
        expect(page.finalCta.title).not.toMatch(SELLS_EVERYTHING[code]);
    });

    it("never says Vinted sells: its members do, on the marketplace", () => {
        expect(vintedSide).toHaveLength(6);
        for (const [path, text] of entries) {
            expect(text, path).not.toMatch(VINTED_SELLS[code]);
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

    it("carries no figure but the year of Vinted's release and its 500,000 pick-up and drop-off points", () => {
        for (const text of [...copy, ...searchResultCopy]) {
            for (const [digits] of text.replace(C2C, "").matchAll(/\d+/g)) {
                expect(ALLOWED_NUMBERS.has(digits), `${digits} in "${text}"`).toBe(true);
            }
        }
        expect(pathsMatching(/\b500\b/)).toEqual(["scorecard.rows.shippingAndPayment.competitor"]);
        // Every string with the year cites the release, and the year appears nowhere else.
        expect(pathsMatching(/\b2025\b/).sort()).toEqual([...RELEASE_PATHS].sort());
    });

    it("names Vinted's release and its year wherever a string cites it", () => {
        for (const path of RELEASE_PATHS) {
            expect(textAt(path), path).toMatch(RELEASE[code]);
        }
    });

    it("names Vinted in every scorecard cell that cites its release, because cells are quoted on their own", () => {
        const cells = vintedSide.filter(([path]) => path.startsWith("scorecard.rows."));
        expect(cells).toHaveLength(5);
        for (const [path, text] of cells) {
            expect(text, path).toContain("Vinted");
        }
        expect(textAt("hero.quickAnswerDescription")).toContain("Vinted");
    });

    it("attributes Vinted's own claims instead of stating them in the page's voice, paraphrased and never quoted", () => {
        for (const path of RELEASE_PATHS) {
            expect(textAt(path), path).toMatch(ATTRIBUTION[code]);
        }
        // The release was read through a tool that cuts quotes short.
        for (const [path, text] of vintedSide) {
            expect(text, path).not.toMatch(/["“”„«»]/);
            // Nothing the release does not say: its sellers' status, and fashion as a "base".
            expect(text, path).not.toMatch(SELLER_STATUS[code]);
            expect(text, path).not.toMatch(FASHION_BASE[code]);
        }
    });

    it("says nothing about Vinted's buyer protection, saved searches or alerts, or about its interfaces", () => {
        for (const text of [...copy, ...searchResultCopy]) {
            expect(text).not.toMatch(BUYER_PROTECTION[code]);
            expect(text).not.toMatch(/(MCP|llms\.txt|\bAPI\b|\bAI\b|\bKI\b)/);
            expect(text).not.toMatch(/(agent|assistant|assistent)/i);
        }
        for (const [path, text] of vintedSide) {
            expect(text, path).not.toMatch(VINTED_MONITORING[code]);
        }
        expect(VINTED_COMPARISON.scorecardRows.map((row) => row.key)).not.toContain("monitoring");
        expect(VINTED_COMPARISON.scorecardRows.map((row) => row.key)).not.toContain(
            "buyerProtection",
        );
        expect(page.quickVerdicts.monitoring.value).toBe("Aura Historia");
    });

    it("keeps the Aura Historia side within the Handbook's scope and the live index: dealers only, no designer vintage, no overlap with Vinted", () => {
        for (const [path, text] of entries) {
            expect(text, path).not.toMatch(OUT_OF_SCOPE_PROVIDERS[code]);
            expect(text, path).not.toMatch(/vintage/i);
        }
        for (const [path, text] of entries.filter(([path]) => VINTED_FREE_PATHS(path))) {
            expect(text, path).not.toContain("Vinted");
        }
        // The categories the scorecard names are the scope list's, down to the last word.
        expect(page.downstream.sources.coinsStampsMilitaria).toMatch(/militaria/i);
        expect(page.scorecard.rows.categoryFocus.auraHistoria).toMatch(/militaria/i);
        expect(Object.keys(page.downstream.sources)).toEqual(VINTED_COMPARISON.sources.sourceKeys);
    });

    it("rates languages a tie with 'no difference documented' and says what the release does not describe", () => {
        const { languagesAndTerminology } = page.scorecard.rows;

        expect(languagesAndTerminology.verdict).toMatch(
            /(No difference documented|Kein dokumentierter Unterschied|Sin diferencia documentada|Aucune différence documentée|Nessuna differenza documentata)/,
        );
        // Aura Historia's side lists its five languages and claims no advantage.
        expect(languagesAndTerminology.auraHistoria).toMatch(/\((?:[^,()]+,){4}[^,()]+\)/);
        // The competitor's cell says the release is silent on terminology and cross-language search.
        const silent: Record<LocaleCode, RegExp> = {
            en: /The release does not describe terminology or search across languages/,
            de: /Terminologie oder Suche über Sprachen hinweg beschreibt die Mitteilung nicht/,
            es: /El comunicado no describe la terminología ni la búsqueda entre idiomas/,
            fr: /Le communiqué ne décrit ni la terminologie ni la recherche d’une langue à l’autre/,
            it: /Il comunicato non descrive la terminologia né la ricerca tra le lingue/,
        };
        expect(languagesAndTerminology.competitor).toMatch(silent[code]);
    });

    it("states the cross-language claim as what a search can do, never as a win over Vinted", () => {
        const can: Record<LocaleCode, RegExp> = {
            en: /can return objects catalogued in another/,
            de: /Objekte finden kann, die in einer anderen katalogisiert sind/,
            es: /puede devolver objetos catalogados en otro/,
            fr: /peut donc renvoyer des objets catalogués dans une autre/,
            it: /può restituire oggetti catalogati in un’altra/,
        };

        expect(page.advantages.cards.terminologyAcrossLanguages.description).toMatch(can[code]);
        expect(Object.keys(page.quickVerdicts)).not.toContain("languages");
        for (const verdict of Object.values(page.quickVerdicts)) {
            expect(verdict.label).not.toMatch(/(language|Sprach|idioma|langue|lingu)/i);
        }
    });

    it("names the listing page's own 'Go to provider' label where it says what happens next", () => {
        expect(page.together.paragraph1).toContain(locale.product.toMerchant);
    });

    it("says Aura Historia is not affiliated with Vinted and does not sell objects or take payments for them", () => {
        const affiliation: Record<LocaleCode, RegExp> = {
            en: /not affiliated with Vinted/,
            de: /in keiner Verbindung zu Vinted/,
            es: /no está vinculada a Vinted/,
            fr: /n’est pas affiliée à Vinted/,
            it: /non è affiliata a Vinted/,
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
        expect(page.scorecard.rows.marketplaceModel.auraHistoria).toMatch(forObjects[code]);
    });

    it("answers that Aura Historia hosts no listings from individuals, and concedes everyday second-hand goods to Vinted in the first word", () => {
        const noListings: Record<LocaleCode, RegExp> = {
            en: /does not host listings from individuals/,
            de: /nimmt keine Angebote von Privatpersonen auf/,
            es: /aloja anuncios de particulares/,
            fr: /n’héberge pas d’annonces de particuliers/,
            it: /non ospita annunci di privati/,
        };
        const no: Record<LocaleCode, string> = {
            en: "No.",
            de: "Nein.",
            es: "No.",
            fr: "Non.",
            it: "No.",
        };

        expect(page.faq.items.sellOwnItems.answer.startsWith(no[code])).toBe(true);
        expect(page.faq.items.sellOwnItems.answer).toMatch(noListings[code]);
        expect(page.scorecard.rows.providerTypes.auraHistoria).toMatch(noListings[code]);
        expect(page.faq.items.everydayGoods.answer.startsWith("Vinted.")).toBe(true);
        expect(page.quickVerdicts.secondHandTrading.value).toBe("Vinted");
    });

    it("writes Vinted as a plain name, in the competitor column header and the verdict value", () => {
        expect(page.scorecard.headers.competitor).toBe("Vinted");
        expect(page.quickVerdicts.secondHandTrading.value).toBe("Vinted");
        for (const key of ["marketplaceModel", "shippingAndPayment"] as const) {
            expect(page.scorecard.rows[key].verdict).toBe("Vinted");
        }
    });
});
