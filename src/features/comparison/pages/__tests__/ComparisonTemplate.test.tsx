import { act, render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeAll, describe, expect, it } from "vitest";

import { WinnerBadge } from "@/features/comparison/components/ComparisonLayout.tsx";
import { ComparisonOtherComparisonsSection } from "@/features/comparison/components/sections/ComparisonOtherComparisonsSection.tsx";
import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import { getComparisonNav } from "@/features/comparison/config/comparisonDefinition.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";
import {
    FIXTURE_COMPARISON,
    FIXTURE_COMPETITOR,
    registerFixtureTranslations,
} from "@/features/comparison/pages/__tests__/comparisonFixture.ts";
import i18n from "@/i18n/i18nForTests";
import { renderWithRouter } from "@/test/utils";

async function renderWithin(node: ReactElement) {
    let result: ReturnType<typeof renderWithRouter> | undefined;
    await act(async () => {
        result = renderWithRouter(node);
    });
    return result as ReturnType<typeof renderWithRouter>;
}

beforeAll(() => {
    registerFixtureTranslations();
});

describe("ComparisonPage with a second definition", () => {
    it("renders the other competitor from its own namespace", async () => {
        await renderWithin(<ComparisonPage definition={FIXTURE_COMPARISON} />);

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            `Aura Historia und ${FIXTURE_COMPETITOR}`,
        );
        const table = screen.getByRole("table");
        expect(within(table).getAllByRole("columnheader")[1]).toHaveTextContent(FIXTURE_COMPETITOR);
        expect(within(table).getAllByRole("rowheader")).toHaveLength(3);
    });

    it("omits the optional chapters and derives the nav without them", async () => {
        const { container } = await renderWithin(
            <ComparisonPage definition={FIXTURE_COMPARISON} />,
        );

        expect(container.querySelector("section#sources")).toBeNull();
        expect(container.querySelector("section#alerts")).toBeNull();
        expect(container.querySelector("section#respect")).not.toHaveTextContent(
            i18n.t("comparison.statusLabel"),
        );

        const nav = screen.getByRole("navigation", { name: i18n.t("comparison.nav.label") });
        expect(
            within(nav)
                .getAllByRole("link")
                .map((link) => link.getAttribute("href")),
        ).toEqual(["#agents", "#summary", "#advantages", "#scorecard", "#faq", "#verdict"]);
        expect(getComparisonNav(FIXTURE_COMPARISON).map((item) => item.marker)).toEqual([
            "MCP",
            "I",
            "III",
            "IV",
            "V",
            "→",
        ]);
    });

    it("keeps the shared side-note and the AI-assistants FAQ item", async () => {
        const { container } = await renderWithin(
            <ComparisonPage definition={FIXTURE_COMPARISON} />,
        );

        expect(container.querySelector("section#agents")).not.toBeNull();
        expect(container.querySelector("#faq-ai-assistants")).toHaveTextContent(
            i18n.t("comparison.faq.aiAssistants.question"),
        );
        expect(container.querySelectorAll("#faq li")).toHaveLength(2);
    });

    it("links to the other published comparisons, never to itself", async () => {
        await renderWithin(<ComparisonPage definition={FIXTURE_COMPARISON} />);

        const block = screen.getByRole("region", { name: "Weitere Vergleiche" });
        const links = within(block).getAllByRole("link");
        expect(links).toHaveLength(1);
        expect(links[0]).toHaveAttribute("href", "/de/compare/barnebys");
        expect(links[0]).toHaveTextContent("Aura Historia vs. Barnebys");
        expect(links[0]).toHaveTextContent(i18n.t(BARNEBYS_COMPARISON.positioningKey));
        expect(within(block).queryByText(new RegExp(FIXTURE_COMPETITOR))).toBeNull();
    });

    it("renders nothing when no other comparison is published", async () => {
        const { container } = await renderWithin(
            <ComparisonOtherComparisonsSection
                currentSlug="barnebys"
                registry={[BARNEBYS_COMPARISON]}
            />,
        );

        expect(container).toBeEmptyDOMElement();
    });
});

describe("WinnerBadge", () => {
    it("marks Aura Historia with a check, the competitor with an outline and a tie neutrally", () => {
        render(
            <>
                <WinnerBadge winner="aura">Aura Historia</WinnerBadge>
                <WinnerBadge winner="competitor">{FIXTURE_COMPETITOR}</WinnerBadge>
                <WinnerBadge winner="tie">Beide</WinnerBadge>
            </>,
        );

        const aura = screen.getByText("Aura Historia");
        const competitor = screen.getByText(FIXTURE_COMPETITOR);
        const tie = screen.getByText("Beide");

        expect(aura).toHaveClass("bg-oxblood");
        expect(aura.querySelector("svg")).not.toBeNull();
        expect(competitor).not.toHaveClass("bg-oxblood");
        expect(competitor.querySelector("svg")).toBeNull();
        expect(tie).toHaveAttribute("data-winner", "tie");
        expect(tie).not.toHaveClass("bg-oxblood");
        expect(tie).toHaveClass("text-ink-secondary");
        expect(tie.querySelector("svg")).not.toBeNull();
    });
});
