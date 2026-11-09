import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import {
    getComparisonChapters,
    getComparisonFaq,
    getComparisonNav,
} from "@/features/comparison/config/comparisonDefinition.ts";
import { COMPARISON_REGISTRY } from "@/features/comparison/config/comparisonRegistry.ts";
import { LIVE_AUCTIONEERS_COMPARISON } from "@/features/comparison/config/liveAuctioneersComparison.ts";
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
        result = renderWithRouter(<ComparisonPage definition={LIVE_AUCTIONEERS_COMPARISON} />);
    });
    return result as ReturnType<typeof renderWithRouter>;
}

describe("ComparisonPage with the LiveAuctioneers definition", () => {
    it("renders one h1 and an h2 with an id for every chapter, with 'together' instead of 'alerts'", async () => {
        const { container } = await renderPage();

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: plain("compareLiveauctioneersPage.hero.title"),
            }),
        ).toBeInTheDocument();

        const ids = getComparisonChapters(LIVE_AUCTIONEERS_COMPARISON);
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
                name: plain("compareLiveauctioneersPage.nav.items.together"),
            }),
        ).toHaveAttribute("href", "#together");
        expect(getComparisonNav(LIVE_AUCTIONEERS_COMPARISON).map((item) => item.marker)).toEqual([
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
            plain("compareLiveauctioneersPage.together.title"),
        );
        expect(together).toHaveTextContent(t("compareLiveauctioneersPage.together.paragraph1"));
        expect(together).toHaveTextContent(t("compareLiveauctioneersPage.together.paragraph2"));
    });

    it("concedes the bidding verdict to LiveAuctioneers in the quick answer", async () => {
        await renderPage();

        const quickAnswer = screen.getByRole("region", {
            name: plain("compareLiveauctioneersPage.hero.quickAnswerTitle"),
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
        expect(badges[0]).toHaveTextContent("LiveAuctioneers");
    });

    it("concedes bidding and the self-described audience, rates languages a tie and gives Aura Historia the scope rows", async () => {
        await renderPage();

        const table = screen.getByRole("table", {
            name: t("compareLiveauctioneersPage.scorecard.caption"),
        });
        const columnHeaders = within(table).getAllByRole("columnheader");
        expect(columnHeaders).toHaveLength(3);
        expect(columnHeaders[1]).toHaveTextContent("LiveAuctioneers");
        const rowHeaders = within(table).getAllByRole("rowheader");
        expect(rowHeaders).toHaveLength(6);

        // The rendered badge in each criterion cell pins who the row goes to.
        const winners = ["competitor", "competitor", "aura", "aura", "tie", "aura"];
        LIVE_AUCTIONEERS_COMPARISON.scorecardRows.forEach((row, index) => {
            const header = rowHeaders[index];
            expect(row.winner).toBe(winners[index]);
            expect(header).toHaveTextContent(
                t(`compareLiveauctioneersPage.scorecard.rows.${row.key}.criterion`),
            );
            expect(header).toHaveTextContent(
                t(`compareLiveauctioneersPage.scorecard.rows.${row.key}.verdict`),
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
                t(`compareLiveauctioneersPage.scorecard.rows.${row.key}.competitor`),
            );
            expect(cells[1]).toHaveTextContent(
                t(`compareLiveauctioneersPage.scorecard.rows.${row.key}.auraHistoria`),
            );
        });
    });

    it("prints the fixed review date in a time element", async () => {
        const { container } = await renderPage();

        const time = container.querySelector("time");
        expect(time).toHaveAttribute("datetime", "2026-11-09");
        expect(time).toHaveTextContent("9. November 2026");
    });

    it("states the dated shared operator in the respect chapter", async () => {
        const { container } = await renderPage();

        const respect = container.querySelector("section#respect");
        expect(respect).toHaveTextContent(t("comparison.statusLabel"));
        expect(respect).toHaveTextContent(t("compareLiveauctioneersPage.respect.status"));
        expect(t("compareLiveauctioneersPage.respect.status")).toContain("30. September 2025");
    });

    it("keeps the five FAQ answers in the DOM under stable anchors, one question for each brand and no AI-assistants entry", async () => {
        const { container } = await renderPage();

        const faq = getComparisonFaq(LIVE_AUCTIONEERS_COMPARISON);
        expect(faq.map((item) => item.anchor)).toEqual([
            "faq-alternative",
            "faq-the-saleroom",
            "faq-lot-tissimo",
            "faq-bid",
            "faq-related",
        ]);
        for (const item of faq) {
            const entry = container.querySelector(`#${item.anchor}`);
            expect(entry).not.toBeNull();
            expect(entry).toHaveTextContent(t(item.questionKey));
            expect(entry).toHaveTextContent(t(item.answerKey));
        }
        // Each query ("LiveAuctioneers / The Saleroom / Lot-tissimo alternative") finds its own question.
        expect(t(faq[0].questionKey)).toContain("LiveAuctioneers");
        expect(t(faq[1].questionKey)).toContain("The Saleroom");
        expect(t(faq[2].questionKey)).toContain("Lot-tissimo");
        // The maintainer dropped the shared AI-assistants side-note and entry in #1274.
        expect(container.querySelector("#faq-ai-assistants")).toBeNull();
        expect(container.querySelector("#agents")).toBeNull();
    });

    it("lists the provider types of its own copy, the same ruled list as Barnebys", async () => {
        await renderPage();

        expect(LIVE_AUCTIONEERS_COMPARISON.sources.sourceKeys).toEqual(
            BARNEBYS_COMPARISON.sources.sourceKeys,
        );
        const list = screen.getByRole("list", {
            name: t("compareLiveauctioneersPage.downstream.sourcesLabel"),
        });
        const items = within(list).getAllByRole("listitem");
        expect(items).toHaveLength(LIVE_AUCTIONEERS_COMPARISON.sources.sourceKeys.length);
        LIVE_AUCTIONEERS_COMPARISON.sources.sourceKeys.forEach((key, index) => {
            expect(items[index]).toHaveTextContent(
                t(`compareLiveauctioneersPage.downstream.sources.${key}`),
            );
        });
    });

    it("links to every other comparison in the cross-link block, never to itself or an external site", async () => {
        const { container } = await renderPage();

        const block = screen.getByRole("region", {
            name: plain("comparison.otherComparisons.title"),
        });
        const links = within(block).getAllByRole("link");
        const others = COMPARISON_REGISTRY.filter((entry) => entry.slug !== "liveauctioneers");
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
            screen.getByRole("link", { name: t("compareLiveauctioneersPage.hero.primaryCta") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(
            screen.getByRole("link", { name: t("compareLiveauctioneersPage.hero.secondaryCta") }),
        ).toHaveAttribute("href", "#scorecard");
        expect(
            screen.getByRole("link", { name: t("compareLiveauctioneersPage.finalCta.button") }),
        ).toHaveAttribute("href", "/de#hero-search");
        for (const name of ["liveauctioneers", "saleroom", "lot-tissimo"]) {
            expect(container.querySelectorAll(`a[href*="${name}" i]`)).toHaveLength(0);
        }
        expect(container.querySelectorAll('a[href^="http" i]')).toHaveLength(0);
    });
});

/**
 * Wording that states who operates the three brands. The page states it twice, as a dated fact
 * attributed to the group's annual report: in the respect chapter's status line and in the FAQ
 * answer on whether the three are related (FAQ answers are quoted on their own). Elsewhere the
 * page only refers to "the group" or "the same group" and states nothing more about it.
 */
const OWNERSHIP_WORDING: Record<LocaleCode, RegExp> = {
    en: /(acquir|acquisition|bought|\bowned\b|\bowns\b|\bowner|ownership|purchased|takeover|taken over|parent company|subsidiar|merger|merged|\bsold\b)/i,
    de: /(übernahm|übernehm|übernommen|erwirbt|erwarb|besitzer|eigentümer|gehört|\bverkauft\b|fusion|tochterunternehmen|muttergesellschaft)/i,
    es: /(adquisici|adquir|compró|comprada|absorb|pertenece|propiedad|propietari|fusi[oó]n|filial|matriz|\bvendida\b)/i,
    fr: /(rachat|racheté|acquisition|acquér|propriétaire|appartient|\bvendue\b|fusion|filiale)/i,
    it: /(acquisizion|acquistat[oa]|rilevat|appartiene|propriet|\bvenduta\b|fusione|controllata)/i,
};

const OWNERSHIP_PATHS = ["respect.status", "faq.items.related.answer"];

/**
 * The group's name appears where a quoted text relies on its annual report: the respect status
 * line, the FAQ answer and the one scorecard cell that cites the report. Everywhere else the page
 * says "the group".
 */
const GROUP_NAME = /Auction Technology Group/;
const GROUP_NAME_PATHS = [
    "respect.status",
    "scorecard.rows.bidderAudience.competitor",
    "faq.items.related.answer",
];

/** The self-description the page concedes, with the verb that attributes it. */
const LARGEST_AUDIENCE: Record<LocaleCode, RegExp> = {
    en: /largest/i,
    de: /größt/i,
    es: /\bmayor\b/i,
    fr: /le plus grand/i,
    it: /il più grande/i,
};
const DESCRIBES_ITS_AUDIENCE: Record<LocaleCode, RegExp> = {
    en: /describes its bidder audience as the largest in North America/,
    de: /beschreibt sein Bieterpublikum als das größte in Nordamerika/,
    es: /describe su público de postores como el mayor de Norteamérica/,
    fr: /décrit son public d’enchérisseurs comme le plus grand d’Amérique du Nord/,
    it: /descrive il proprio pubblico di offerenti come il più grande del Nord America/,
};
const AUDIENCE_PATHS = ["respect.paragraph1", "scorecard.rows.bidderAudience.competitor"];

/**
 * Self-description in the page's own voice ("leading", "most trusted", "world's"): LiveAuctioneers
 * and the group call themselves that, and the page only attributes what it concedes.
 */
const SELF_DESCRIPTIONS: Record<LocaleCode, RegExp> = {
    en: /(\bleading\b|most trusted|world['’]s)/i,
    de: /(führend|vertrauenswürdigst|weltweit größt)/i,
    es: /(\blíder\b|más confiable|más fiable|mayor del mundo)/i,
    fr: /(\bleader\b|le plus fiable|le plus digne de confiance|premier au monde)/i,
    it: /(\bleader\b|più affidabile|più fidato|più grande del mondo)/i,
};

/**
 * Figures the page must not carry: the group's and the network's numbers (3,900 auction houses,
 * 106M buyers, 28M visits, 26.8m lots, 457m sessions), LiveAuctioneers' conflicting counts (1,600,
 * 4,000 and 5,000 auction houses) and the group's "three times" market claim.
 */
const UNUSED_FIGURES =
    /((?<![\d.,])(106|3[.,\s  ]?900|1[.,\s  ]?600|4[.,\s  ]?000|5[.,\s  ]?000|26[.,]8|457)(?!\d)|\b(three times|dreimal|tres veces|trois fois|tre volte)\b)/i;

/** Group finances, other brands and the takeover approach of early 2026: not for this page. */
const OFF_TOPIC: RegExp =
    /(FitzWalter|Fitzwalter|Nasdaq|\bLSE\b|FTSE|EBITDA|\bGMV\b|\bTHV\b|hammer|Chairish|Pamono|Proxibid|BidSpotter|i-bidder|EstateSales)/i;

/**
 * The issue's draft names the UK as The Saleroom's market, which no primary page supports; the
 * page names no country for The Saleroom.
 */
const UK_MARKET: Record<LocaleCode, RegExp> = {
    en: /(\bUK\b|British|United Kingdom|Britain)/,
    de: /(\bUK\b|britisch|Großbritannien|Vereinigten Königreich)/,
    es: /(\bUK\b|británic|Reino Unido)/,
    fr: /(\bUK\b|britannique|Royaume-Uni)/,
    it: /(\bUK\b|britannic|Regno Unito)/,
};

/** Never imply that platforms rank or promote by payment, and never state Aura Historia's policy. */
const PAYMENT_AND_RANKING: Record<LocaleCode, RegExp> = {
    en: /(sponsor|paid placement|promot|ranking|\brank|advertis|boost)/i,
    de: /(gesponsert|bezahlte Platzierung|Ranking|Werbung|bewirbt|Sponsor)/i,
    es: /(patrocin|posicionamiento de pago|ranking|publicidad|promoci)/i,
    fr: /(sponsoris|placement payant|classement|publicité|promotion)/i,
    it: /(sponsoriz|posizionamento a pagamento|ranking|pubblicit|promozion)/i,
};

/** No alert cadence for any of the three: a one-sided cadence invites a speed comparison. */
const CADENCE: Record<LocaleCode, RegExp> = {
    en: /(daily|every day|hourly|every hour|each day)/i,
    de: /(täglich|stündlich|jeden Tag)/i,
    es: /(diari|cada día|cada hora)/i,
    fr: /(quotidien|chaque jour|toutes les heures)/i,
    it: /(giornalier|ogni giorno|ogni ora|quotidian)/i,
};

/**
 * Cross-listing is a group tool in the annual report that does not say which brands take part, so
 * the page credits it to no brand and does not mention it.
 */
const CROSS_LISTING =
    /(cross-?listing|atgXL|publicación cruzada|publication croisée|pubblicazione incrociata)/i;

/** The h1 does not claim the "whole market", which nobody can verify. */
const WHOLE_MARKET: Record<LocaleCode, RegExp> = {
    en: /whole market|entire market/i,
    de: /gesamten Markt|ganzen Markt/i,
    es: /todo el mercado|mercado entero/i,
    fr: /tout le marché|marché entier/i,
    it: /tutto il mercato|intero mercato/i,
};

/** Where the Buy Now cell cites its source: the resource centre for auction houses. */
const RESOURCE_CENTRE: Record<LocaleCode, RegExp> = {
    en: /resource centre for auction houses/,
    de: /Ressourcenbereich für Auktionshäuser/,
    es: /centro de recursos para casas de subastas/,
    fr: /centre de ressources pour les maisons de ventes/,
    it: /centro risorse per le case d’asta/,
};

describe.each(Object.entries(LOCALES))("LiveAuctioneers comparison copy in %s", (lng, locale) => {
    const code = lng as LocaleCode;
    const page = locale.compareLiveauctioneersPage;
    const entries = leafEntries(page);
    const copy = entries.map(([, text]) => text);
    // The meta title and description are the search-result text, so they follow the same rules.
    const searchResultCopy = leaves(locale.meta.compareLiveauctioneers);
    const pathsMatching = (pattern: RegExp) =>
        entries.filter(([, text]) => pattern.test(text)).map(([path]) => path);

    it("keeps the rules' banned wording, hype, group figures and payment or ranking talk off the page and its meta text", () => {
        expect(copy.length).toBeGreaterThan(60);
        expect(searchResultCopy).toHaveLength(2);
        for (const text of [...copy, ...searchResultCopy]) {
            expect(text).not.toMatch(BANNED_WORDING[code]);
            expect(text).not.toMatch(SELF_DESCRIPTIONS[code]);
            expect(text).not.toMatch(UNUSED_FIGURES);
            expect(text).not.toMatch(OFF_TOPIC);
            expect(text).not.toMatch(UK_MARKET[code]);
            expect(text).not.toMatch(PAYMENT_AND_RANKING[code]);
            expect(text).not.toMatch(CADENCE[code]);
            expect(text).not.toMatch(CROSS_LISTING);
            expect(text).not.toMatch(/!/);
        }
        expect(page.hero.title).not.toMatch(WHOLE_MARKET[code]);
    });

    it("states who operates the three brands twice, dated and attributed to the annual report", () => {
        const { status } = page.respect;
        const { answer } = page.faq.items.related;

        for (const text of [status, answer]) {
            expect(text).toContain("Auction Technology Group (ATG)");
            expect(text).toContain("30");
            expect(text).toContain("2025");
            expect(text).toContain("2018");
            expect(text).toContain("2021");
            expect(text).toMatch(OWNERSHIP_WORDING[code]);
            for (const brand of ["LiveAuctioneers", "Lot-tissimo"]) {
                expect(text).toContain(brand);
            }
        }
        expect(status).toContain("The Saleroom");

        expect(pathsMatching(OWNERSHIP_WORDING[code])).toEqual(OWNERSHIP_PATHS);
        expect(pathsMatching(GROUP_NAME)).toEqual(GROUP_NAME_PATHS);
        // The FAQ answer keeps the date and source with the claim; it does not repeat the group's
        // three-brand list as a status line of its own.
        expect(answer.startsWith(status)).toBe(false);
    });

    it("concedes the self-described bidder audience in two places, always attributed to LiveAuctioneers", () => {
        expect(pathsMatching(LARGEST_AUDIENCE[code])).toEqual(AUDIENCE_PATHS);
        for (const path of AUDIENCE_PATHS) {
            const text = entries.find(([entryPath]) => entryPath === path)?.[1] ?? "";
            // The sentence names LiveAuctioneers and says it is the brand's own description.
            expect(text, path).toContain("LiveAuctioneers");
            expect(text, path).toMatch(DESCRIBES_ITS_AUDIENCE[code]);
        }
        // No audience figure at all: LiveAuctioneers' own counts conflict between its pages.
        expect(page.scorecard.rows.bidderAudience.competitor).not.toMatch(/\d{2,}[.,\s]?\d{3}/);
    });

    it("says Buy Now items exist on LiveAuctioneers and rests Aura Historia's claim on dealers' own websites", () => {
        const { dealersAndFixedPrice } = page.scorecard.rows;

        expect(pathsMatching(/Buy Now/)).toEqual([
            "scorecard.rows.dealersAndFixedPrice.competitor",
        ]);
        expect(dealersAndFixedPrice.competitor).toContain("Buy Now");
        // The source is the resource centre's description of unsold lots, not a search filter.
        expect(dealersAndFixedPrice.competitor).toMatch(RESOURCE_CENTRE[code]);
        // The Aura Historia side is about stock on the dealers' own websites, not fixed prices alone.
        expect(dealersAndFixedPrice.verdict).toMatch(
            /(across websites|über Websites hinweg|entre sitios web|sur plusieurs sites|su più siti web)/,
        );
    });

    it("attributes the language claim to LiveAuctioneers and names the other two brands' site languages", () => {
        const { competitor } = page.scorecard.rows.languageHandling;

        for (const brand of ["LiveAuctioneers", "The Saleroom", "Lot-tissimo"]) {
            expect(competitor).toContain(brand);
        }
        // The 50-countries figure of its About page is left out.
        expect(competitor).not.toMatch(/\b50\b/);
        // LiveAuctioneers' claim names no languages, so the verdict only says nothing separates them.
        expect(page.scorecard.rows.languageHandling.verdict).toMatch(/(document|dokument)/i);
    });

    it("names each brand in its own FAQ question and in the meta description", () => {
        const { items } = page.faq;

        expect(items.alternative.question).toContain("LiveAuctioneers");
        expect(items.saleroomAlternative.question).toContain("The Saleroom");
        expect(items.lotTissimoAlternative.question).toContain("Lot-tissimo");
        for (const brand of ["LiveAuctioneers", "The Saleroom", "Lot-tissimo"]) {
            expect(items.related.question).toContain(brand);
            expect(locale.meta.compareLiveauctioneers.description).toContain(brand);
        }
    });

    it("names the listing page's own 'Go to provider' label where it says what happens next", () => {
        const label = locale.product.toMerchant;

        expect(page.together.paragraph1).toContain(label);
        expect(page.faq.items.bid.answer).toContain(label);
        expect(page.scorecard.rows.liveBidding.auraHistoria).toContain(label);
    });

    it("says Aura Historia takes no bids and is not affiliated with the three brands", () => {
        const affiliation: Record<LocaleCode, RegExp> = {
            en: /not affiliated with LiveAuctioneers, The Saleroom or Lot-tissimo/,
            de: /in keiner Verbindung zu LiveAuctioneers, The Saleroom oder Lot-tissimo/,
            es: /no está vinculada a LiveAuctioneers, The Saleroom ni Lot-tissimo/,
            fr: /n’est pas affiliée à LiveAuctioneers, The Saleroom ni Lot-tissimo/,
            it: /non è affiliata a LiveAuctioneers, The Saleroom né a Lot-tissimo/,
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
    });

    it("lists the same provider types as the Barnebys comparison in this language", () => {
        expect(page.downstream.sources).toEqual(locale.compareBarnebysPage.downstream.sources);
    });

    it("writes LiveAuctioneers as a plain name and says nothing about agent interfaces", () => {
        expect(page.scorecard.headers.competitor).toBe("LiveAuctioneers");
        expect(page.quickVerdicts.liveBidding.value).toBe("LiveAuctioneers");
        for (const text of [...copy, ...searchResultCopy]) {
            expect(text).not.toMatch(/MCP|llms\.txt|\bAPI\b/);
        }
    });
});
