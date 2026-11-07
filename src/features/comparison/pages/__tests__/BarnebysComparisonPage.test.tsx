import { act, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    BARNEBYS_COMPARISON_NAV,
    BARNEBYS_COMPARISON_SECTION_IDS,
    BARNEBYS_FAQ_ITEMS,
    BARNEBYS_SCORECARD_ROWS,
} from "@/features/comparison/config/barnebysComparison.data.ts";
import { BARNEBYS_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/barnebysComparisonReview.ts";
import { BarnebysComparisonPage } from "@/features/comparison/pages/BarnebysComparisonPage.tsx";
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
        result = renderWithRouter(<BarnebysComparisonPage />);
    });
    return result as ReturnType<typeof renderWithRouter>;
}

describe("BarnebysComparisonPage", () => {
    it("renders one h1 and an h2 with an id for every chapter", async () => {
        const { container } = await renderPage();

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(
            screen.getByRole("heading", {
                level: 1,
                name: plain("compareBarnebysPage.hero.title"),
            }),
        ).toBeInTheDocument();

        for (const sectionId of Object.values(BARNEBYS_COMPARISON_SECTION_IDS)) {
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

    it("links every chapter from the jump navigation", async () => {
        await renderPage();

        const nav = screen.getByRole("navigation", { name: t("compareBarnebysPage.nav.label") });
        const links = within(nav).getAllByRole("link");

        expect(links.map((link) => link.getAttribute("href"))).toEqual(
            BARNEBYS_COMPARISON_NAV.map((item) => `#${item.id}`),
        );
        expect(within(nav).getByRole("link", { name: /Vergleichstabelle/ })).toHaveAttribute(
            "href",
            "#scorecard",
        );
    });

    it("shows the quick answer as a section that leads with the verdict", async () => {
        await renderPage();

        const quickAnswer = screen.getByRole("region", {
            name: plain("compareBarnebysPage.hero.quickAnswerTitle"),
        });
        expect(quickAnswer.tagName).toBe("SECTION");
        expect(within(quickAnswer).getByText("Fazit:").tagName).toBe("STRONG");
        expect(within(quickAnswer).getAllByRole("definition")).toHaveLength(4);
    });

    it("prints the fixed review date in a time element", async () => {
        const { container } = await renderPage();

        const time = container.querySelector("time");
        expect(time).toHaveAttribute("datetime", BARNEBYS_COMPARISON_LAST_REVIEWED);
        expect(time).toHaveTextContent("7. November 2026");
    });

    it("keeps the scorecard a real table with row and column headers", async () => {
        await renderPage();

        const table = screen.getByRole("table", {
            name: t("compareBarnebysPage.scorecard.caption"),
        });
        expect(within(table).getAllByRole("columnheader")).toHaveLength(3);
        expect(within(table).getAllByRole("rowheader")).toHaveLength(
            BARNEBYS_SCORECARD_ROWS.length,
        );
        expect(
            within(table).getByText(
                t("compareBarnebysPage.scorecard.rows.alertSpeed.auraHistoria"),
            ),
        ).toBeInTheDocument();
    });

    it("keeps every FAQ answer in the DOM under a stable anchor", async () => {
        const { container } = await renderPage();

        for (const item of BARNEBYS_FAQ_ITEMS) {
            const entry = container.querySelector(`#${item.anchor}`);
            expect(entry).not.toBeNull();
            expect(entry).toHaveTextContent(
                t(`compareBarnebysPage.faq.items.${item.key}.question`),
            );
            expect(entry).toHaveTextContent(t(`compareBarnebysPage.faq.items.${item.key}.answer`));
        }
    });

    it("lists the source types", async () => {
        await renderPage();

        const sources = screen.getByRole("list", {
            name: t("compareBarnebysPage.downstream.sourcesLabel"),
        });
        expect(within(sources).getAllByRole("listitem")).toHaveLength(5);
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
});
