import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ARTSY_COMPARISON } from "@/features/comparison/config/artsyComparison.ts";
import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import {
    getComparisonChapters,
    getComparisonFaq,
    getComparisonNav,
} from "@/features/comparison/config/comparisonDefinition.ts";
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
        result = renderWithRouter(<ComparisonPage definition={ARTSY_COMPARISON} />);
    });
    return result as ReturnType<typeof renderWithRouter>;
}

describe("ComparisonPage with the Artsy definition", () => {
    it("renders one h1 and an h2 with an id for every chapter", async () => {
        const { container } = await renderPage();

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(
            screen.getByRole("heading", { level: 1, name: plain("compareArtsyPage.hero.title") }),
        ).toBeInTheDocument();

        const ids = getComparisonChapters(ARTSY_COMPARISON);
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
    });

    it("derives the nav from the definition and labels the monitoring chapter from its copy", async () => {
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
        expect(within(nav).getByRole("link", { name: /Beobachtung/ })).toHaveAttribute(
            "href",
            "#alerts",
        );
        expect(getComparisonNav(ARTSY_COMPARISON).map((item) => item.marker)).toEqual([
            "I",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "→",
        ]);
    });

    it("concedes the contemporary gallery verdict to Artsy in the quick answer", async () => {
        await renderPage();

        const quickAnswer = screen.getByRole("region", {
            name: plain("compareArtsyPage.hero.quickAnswerTitle"),
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
        expect(badges[0]).toHaveTextContent("Artsy");
    });

    it("concedes the gallery and context rows to Artsy in a real scorecard table", async () => {
        await renderPage();

        const table = screen.getByRole("table", { name: t("compareArtsyPage.scorecard.caption") });
        const columnHeaders = within(table).getAllByRole("columnheader");
        expect(columnHeaders).toHaveLength(3);
        expect(columnHeaders[1]).toHaveTextContent("Artsy");
        const rowHeaders = within(table).getAllByRole("rowheader");
        expect(rowHeaders).toHaveLength(6);

        // The verdict line under each criterion carries the check for Aura Historia and nothing
        // for the competitor, so the rendered marks pin who each row goes to.
        const winners = ["competitor", "competitor", "aura", "aura", "aura", "aura"];
        ARTSY_COMPARISON.scorecardRows.forEach((row, index) => {
            const header = rowHeaders[index];
            expect(row.winner).toBe(winners[index]);
            expect(header).toHaveTextContent(
                t(`compareArtsyPage.scorecard.rows.${row.key}.criterion`),
            );
            expect(header).toHaveTextContent(
                t(`compareArtsyPage.scorecard.rows.${row.key}.verdict`),
            );
            expect(header.querySelector("svg") !== null).toBe(row.winner === "aura");

            const cells = within(header.closest("tr") as HTMLElement).getAllByRole("cell");
            expect(cells[0]).toHaveTextContent(
                t(`compareArtsyPage.scorecard.rows.${row.key}.competitor`),
            );
            expect(cells[1]).toHaveTextContent(
                t(`compareArtsyPage.scorecard.rows.${row.key}.auraHistoria`),
            );
        });
    });

    it("prints the fixed review date in a time element", async () => {
        const { container } = await renderPage();

        const time = container.querySelector("time");
        expect(time).toHaveAttribute("datetime", "2026-11-08");
        expect(time).toHaveTextContent("8. November 2026");
    });

    it("states the dated Artnet announcement in the respect chapter", async () => {
        const { container } = await renderPage();

        const respect = container.querySelector("section#respect");
        expect(respect).toHaveTextContent(t("comparison.statusLabel"));
        expect(respect).toHaveTextContent(t("compareArtsyPage.respect.status"));
        expect(t("compareArtsyPage.respect.status")).toContain("15. April 2026");
    });

    it("keeps the five FAQ answers in the DOM under stable anchors", async () => {
        const { container } = await renderPage();

        const faq = getComparisonFaq(ARTSY_COMPARISON);
        expect(faq.map((item) => item.anchor)).toEqual([
            "faq-alternative",
            "faq-replace",
            "faq-antiques-design",
            "faq-gallery-art",
            "faq-artnet",
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

        expect(ARTSY_COMPARISON.sources.sourceKeys).toEqual(BARNEBYS_COMPARISON.sources.sourceKeys);
        const list = screen.getByRole("list", {
            name: t("compareArtsyPage.downstream.sourcesLabel"),
        });
        const items = within(list).getAllByRole("listitem");
        expect(items).toHaveLength(ARTSY_COMPARISON.sources.sourceKeys.length);
        ARTSY_COMPARISON.sources.sourceKeys.forEach((key, index) => {
            expect(items[index]).toHaveTextContent(t(`compareArtsyPage.downstream.sources.${key}`));
        });
    });

    it("links to Barnebys in the cross-link block, never to itself, and to no external site", async () => {
        const { container } = await renderPage();

        const block = screen.getByRole("region", {
            name: plain("comparison.otherComparisons.title"),
        });
        const links = within(block).getAllByRole("link");
        expect(links).toHaveLength(1);
        expect(links[0]).toHaveAttribute("href", "/de/compare/barnebys");

        expect(
            screen.getByRole("link", { name: t("compareArtsyPage.hero.primaryCta") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(
            screen.getByRole("link", { name: t("compareArtsyPage.hero.secondaryCta") }),
        ).toHaveAttribute("href", "#scorecard");
        expect(
            screen.getByRole("link", { name: t("compareArtsyPage.finalCta.button") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(container.querySelectorAll('a[href*="artsy" i]')).toHaveLength(0);
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
    en: /\b(faster|slower|cheaper|quickly|instant\w*|immediate\w*|fast|outdated|broken|struggling|layoffs?|bankrupt\w*|insolven\w*|commissions?|fees?|more accurate|more complete|real-time|guaranteed|the only|no other|cutting-edge)\b/i,
    de: /(schneller|langsamer|sofort|umgehend|günstiger|veraltet|insolvenz|entlassung|kommission|gebühr|genauer|vollständiger|echtzeit|garantiert|der einzige|einzigartig)/i,
    es: /(más rápid|más lent|al instante|inmediat|más barat|obsolet|despidos|quiebra|comisi[oó]n|tarifa|más preciso|más complet|tiempo real|garantiz|el único)/i,
    fr: /(plus rapide|plus lent|instantan|immédiat|moins cher|plus cher|obsolète|licenci|faillite|commission|\bfrais\b|plus précis|plus complet|temps réel|garanti|le seul)/i,
    it: /(più veloce|più lent|istantane|immediat|più economic|obsolet|licenziament|fallimento|commission|\bcosti\b|più accurat|più complet|tempo reale|garantit|l[’']unico)/i,
};

/**
 * The announcement says "shared leadership"; the wire release even corrected "ownership" to
 * "leadership". The statement must use that phrase in every language and nothing that reads as a
 * sale, merger or parent company.
 */
const SHARED_LEADERSHIP: Record<keyof typeof LOCALES, string> = {
    en: "shared leadership",
    de: "gemeinsamer Leitung",
    es: "dirección conjunta",
    fr: "direction commune",
    it: "guida condivisa",
};

const OWNERSHIP_WORDING: Record<keyof typeof LOCALES, RegExp> = {
    en: /(acquir|bought|\bowned\b|\bowner|ownership|took over|taken over|takeover|parent company|subsidiar|merger|merged)/i,
    de: /(übernahm|übernimmt|übernehm|übernommen|kauft|gekauft|erwirbt|besitz|eigentümer|fusion|tochter|muttergesellschaft)/i,
    es: /(adquir|compra|compró|absorb|propiedad|propietari|fusi[oó]n|filial|matriz)/i,
    fr: /(rachat|rachète|racheté|acquis|acquér|propriétaire|appartient|fusion|filiale)/i,
    it: /(acquis|acquist|rilevat|propriet|fusione|controllata)/i,
};

function leaves(value: unknown): string[] {
    if (typeof value === "string") return [value];
    if (value && typeof value === "object") return Object.values(value).flatMap(leaves);
    return [];
}

describe.each(Object.entries(LOCALES))("Artsy comparison copy in %s", (lng, locale) => {
    const code = lng as keyof typeof LOCALES;
    const copy = leaves(locale.compareArtsyPage);

    it("keeps the rules' banned wording and hype off the page", () => {
        expect(copy.length).toBeGreaterThan(60);
        for (const text of copy) {
            expect(text).not.toMatch(BANNED_WORDING[code]);
            expect(text).not.toMatch(/!/);
        }
    });

    it("keeps the Artnet announcement to what the primary source says", () => {
        const { status } = locale.compareArtsyPage.respect;
        const answer = locale.compareArtsyPage.faq.items.artnet.answer;

        for (const text of [status, answer]) {
            expect(text).toContain("2026");
            expect(text).toContain(SHARED_LEADERSHIP[code]);
            expect(text).not.toMatch(OWNERSHIP_WORDING[code]);
            // Who leads or owns either company is perishable and not needed to state the fact.
            expect(text).not.toMatch(/Yin|Wolff|Beowolff/);
        }
        expect(answer).toContain("Artnet");
    });

    it("lists the same provider types as the Barnebys comparison in this language", () => {
        expect(locale.compareArtsyPage.downstream.sources).toEqual(
            locale.compareBarnebysPage.downstream.sources,
        );
    });

    it("writes Artsy as a plain name and says nothing about agent interfaces", () => {
        expect(locale.compareArtsyPage.scorecard.headers.competitor).toBe("Artsy");
        expect(locale.compareArtsyPage.quickVerdicts.contemporaryGalleryArt.value).toBe("Artsy");
        for (const text of copy) {
            expect(text).not.toMatch(/MCP|llms\.txt|\bAPI\b/);
        }
    });
});
