import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import {
    COMPARISON_AGENTS_SECTION_ID,
    type ComparisonDefinition,
    getComparisonChapters,
    getComparisonFaq,
    getComparisonNav,
} from "@/features/comparison/config/comparisonDefinition.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";
import i18n from "@/i18n/i18nForTests";
import { renderWithRouter } from "@/test/utils";

function t(key: string) {
    return i18n.t(key);
}

function plain(key: string) {
    return t(key).replace(/<\/?(em|strong)>/g, "");
}

async function renderPage(definition: ComparisonDefinition = BARNEBYS_COMPARISON) {
    let result: ReturnType<typeof renderWithRouter> | undefined;
    await act(async () => {
        result = renderWithRouter(<ComparisonPage definition={definition} />);
    });
    return result as ReturnType<typeof renderWithRouter>;
}

describe("ComparisonPage with the Barnebys definition", () => {
    it("renders one h1 and an h2 with an id for every chapter and the side-note", async () => {
        const { container } = await renderPage();

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: plain("compareBarnebysPage.hero.title"),
            }),
        ).toBeInTheDocument();

        const ids = [COMPARISON_AGENTS_SECTION_ID, ...getComparisonChapters(BARNEBYS_COMPARISON)];
        expect(ids).toEqual([
            "agents",
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

    it("sets the closing phrase of a headline in italics", async () => {
        await renderPage();

        const heading = screen.getByRole("heading", {
            level: 2,
            name: plain("compareBarnebysPage.summary.title"),
        });
        expect(heading.querySelector("em")).toHaveTextContent("Kurzfassung");
    });

    it("links the side-note and every chapter in the nav, derived from the definition", async () => {
        await renderPage();

        const nav = screen.getByRole("navigation", { name: t("comparison.nav.label") });
        const links = within(nav).getAllByRole("link");

        expect(links.map((link) => link.getAttribute("href"))).toEqual([
            "#agents",
            "#summary",
            "#advantages",
            "#scorecard",
            "#sources",
            "#alerts",
            "#faq",
            "#verdict",
        ]);
        expect(links[0]).toHaveTextContent(t("comparison.nav.agents"));
        expect(within(nav).getByRole("link", { name: /Vergleichstabelle/ })).toHaveAttribute(
            "href",
            "#scorecard",
        );
    });

    it("places the side-note as a section right after the jump nav, before the first chapter", async () => {
        const { container } = await renderPage();

        const sideNote = screen.getByRole("region", { name: plain("comparison.agents.title") });
        expect(sideNote.tagName).toBe("SECTION");
        expect(sideNote.id).toBe("agents");
        expect(container.querySelector("aside")).toBeNull();
        expect(sideNote.previousElementSibling?.tagName).toBe("NAV");
        expect(sideNote.nextElementSibling?.id).toBe("summary");

        expect(sideNote).toHaveTextContent(t("comparison.agents.body"));
        expect(sideNote).toHaveTextContent("https://mcp.aura-historia.com/v1");
        expect(sideNote).toHaveTextContent(t("comparison.agents.closing"));
        expect(
            within(sideNote).getByRole("link", { name: t("comparison.agents.docsLink") }),
        ).toHaveAttribute("href", "https://docs.api.aura-historia.com/mcp.md");
        // A note, not a verdict: no winner badge inside it.
        expect(sideNote.querySelector("[data-winner]")).toBeNull();
    });

    it("shows the quick answer as a section that leads with the verdict, with a tie badge", async () => {
        await renderPage();

        const quickAnswer = screen.getByRole("region", {
            name: plain("compareBarnebysPage.hero.quickAnswerTitle"),
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
        expect(badges[3]).toHaveTextContent(
            t("compareBarnebysPage.quickVerdicts.searchAlerts.value"),
        );
    });

    it("prints the fixed review date in a time element", async () => {
        const { container } = await renderPage();

        const time = container.querySelector("time");
        expect(time).toHaveAttribute("datetime", BARNEBYS_COMPARISON.lastReviewed);
        expect(time).toHaveTextContent("8. November 2026");
    });

    it("shows the dated status note in the respect chapter", async () => {
        const { container } = await renderPage();

        const respect = container.querySelector("section#respect");
        expect(respect).toHaveTextContent(t("comparison.statusLabel"));
        expect(respect).toHaveTextContent(t("compareBarnebysPage.respect.status"));
    });

    it("keeps the scorecard a real table with row and column headers", async () => {
        await renderPage();

        const table = screen.getByRole("table", {
            name: t("compareBarnebysPage.scorecard.caption"),
        });
        const columnHeaders = within(table).getAllByRole("columnheader");
        expect(columnHeaders).toHaveLength(3);
        expect(columnHeaders[1]).toHaveTextContent("Barnebys");
        expect(within(table).getAllByRole("rowheader")).toHaveLength(
            BARNEBYS_COMPARISON.scorecardRows.length,
        );
        expect(
            within(table).getByText(
                t("compareBarnebysPage.scorecard.rows.searchAlerts.auraHistoria"),
            ),
        ).toBeInTheDocument();
        expect(
            within(table).getByText(
                t("compareBarnebysPage.scorecard.rows.auctionHeritage.competitor"),
            ),
        ).toBeInTheDocument();
    });

    it("keeps every FAQ answer in the DOM under a stable anchor, ending with AI assistants", async () => {
        const { container } = await renderPage();

        const faq = getComparisonFaq(BARNEBYS_COMPARISON);
        expect(faq.map((item) => item.anchor)).toEqual([
            "faq-alternative",
            "faq-replace",
            "faq-status",
            "faq-faster-alerts",
            "faq-multilingual-search",
            "faq-outside-auctions",
            "faq-ai-assistants",
        ]);
        for (const item of faq) {
            const entry = container.querySelector(`#${item.anchor}`);
            expect(entry).not.toBeNull();
            expect(entry).toHaveTextContent(t(item.questionKey));
            expect(entry).toHaveTextContent(t(item.answerKey));
        }
    });

    it("lists the source types", async () => {
        await renderPage();

        const sources = screen.getByRole("list", {
            name: t("compareBarnebysPage.downstream.sourcesLabel"),
        });
        expect(within(sources).getAllByRole("listitem")).toHaveLength(5);
    });

    it("leaves out the other comparisons block while Barnebys is the only comparison", async () => {
        const { container } = await renderPage();

        expect(container.querySelector("#other-comparisons")).toBeNull();
    });

    it("uses internal calls to action and never links to Barnebys", async () => {
        const { container } = await renderPage();

        expect(
            screen.getByRole("link", { name: t("compareBarnebysPage.hero.primaryCta") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(
            screen.getByRole("link", { name: t("compareBarnebysPage.hero.secondaryCta") }),
        ).toHaveAttribute("href", "#scorecard");
        expect(
            screen.getByRole("link", { name: t("compareBarnebysPage.finalCta.button") }),
        ).toHaveAttribute("href", "/de#hero-search");
        expect(container.querySelectorAll('a[href*="barnebys" i]')).toHaveLength(0);
    });

    it("derives the nav markers from the chapters", () => {
        expect(getComparisonNav(BARNEBYS_COMPARISON).map((item) => item.marker)).toEqual([
            "MCP",
            "I",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "→",
        ]);
    });
});
