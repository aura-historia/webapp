import { act, render, screen, within } from "@testing-library/react";
import { Bell } from "lucide-react";
import type { ReactElement } from "react";
import { beforeAll, describe, expect, it } from "vitest";

import { WinnerBadge } from "@/features/comparison/components/ComparisonLayout.tsx";
import { ComparisonOtherComparisonsSection } from "@/features/comparison/components/sections/ComparisonOtherComparisonsSection.tsx";
import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import {
    type ComparisonDefinition,
    getComparisonNav,
} from "@/features/comparison/config/comparisonDefinition.ts";
import { COMPARISON_REGISTRY } from "@/features/comparison/config/comparisonRegistry.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";
import {
    FIXTURE_COMPARISON,
    FIXTURE_COMPARISON_WITH_TOGETHER,
    FIXTURE_COMPETITOR,
    FIXTURE_NAMESPACE,
    FIXTURE_TOGETHER_LABEL,
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
        expect(container.querySelector("section#together")).toBeNull();
        expect(container.querySelector("section#respect")).not.toHaveTextContent(
            i18n.t("comparison.statusLabel"),
        );

        const nav = screen.getByRole("navigation", { name: i18n.t("comparison.nav.label") });
        expect(
            within(nav)
                .getAllByRole("link")
                .map((link) => link.getAttribute("href")),
        ).toEqual(["#summary", "#advantages", "#scorecard", "#faq", "#verdict"]);
        expect(getComparisonNav(FIXTURE_COMPARISON).map((item) => item.marker)).toEqual([
            "I",
            "III",
            "IV",
            "V",
            "→",
        ]);
    });

    it("renders the optional 'together' chapter after 'alerts', from its own copy and ids", async () => {
        const withBoth = {
            ...FIXTURE_COMPARISON_WITH_TOGETHER,
            alerts: { icon: Bell },
        } as const satisfies ComparisonDefinition;
        const { container } = await renderWithin(<ComparisonPage definition={withBoth} />);

        const order = [...container.querySelectorAll("section[id]")].map((section) => section.id);
        expect(order.indexOf("alerts")).toBeGreaterThan(order.indexOf("scorecard"));
        expect(order.indexOf("together")).toBe(order.indexOf("alerts") + 1);
        expect(order.indexOf("faq")).toBe(order.indexOf("together") + 1);

        // Each chapter renders its own copy and nothing of the other's.
        const alerts = container.querySelector("section#alerts");
        const together = container.querySelector("section#together");
        for (const part of ["paragraph1", "paragraph2"] as const) {
            const alertsCopy = i18n.t(`${FIXTURE_NAMESPACE}.alerts.${part}`);
            const togetherCopy = i18n.t(`${FIXTURE_NAMESPACE}.together.${part}`);
            expect(togetherCopy).not.toBe(alertsCopy);
            expect(alerts).toHaveTextContent(alertsCopy);
            expect(alerts).not.toHaveTextContent(togetherCopy);
            expect(together).toHaveTextContent(togetherCopy);
            expect(together).not.toHaveTextContent(alertsCopy);
        }
        expect(together?.querySelector("h2#comparison-together-heading")).toHaveTextContent(
            i18n.t(`${FIXTURE_NAMESPACE}.together.title`).replace(/<\/?em>/g, ""),
        );
        expect(alerts?.querySelector("h2#comparison-alerts-heading")).toHaveTextContent(
            i18n.t(`${FIXTURE_NAMESPACE}.alerts.title`).replace(/<\/?em>/g, ""),
        );
        expect(together?.getAttribute("aria-labelledby")).toBe("comparison-together-heading");
        expect(alerts?.getAttribute("aria-labelledby")).toBe("comparison-alerts-heading");

        const nav = screen.getByRole("navigation", { name: i18n.t("comparison.nav.label") });
        expect(
            within(nav).getByRole("link", { name: new RegExp(FIXTURE_TOGETHER_LABEL) }),
        ).toHaveAttribute("href", "#together");
        expect(getComparisonNav(withBoth).map((item) => item.marker)).toEqual([
            "I",
            "III",
            "IV",
            "V",
            "VI",
            "VII",
            "→",
        ]);
    });

    it.each(COMPARISON_REGISTRY.map((entry) => [entry.slug, entry] as const))(
        "renders the %s page without a raw translation key",
        async (_slug, definition) => {
            const { container } = await renderWithin(<ComparisonPage definition={definition} />);

            // A missing or mis-addressed key renders as its own path, e.g. "compareXPage.faq.title".
            expect(container.textContent).not.toMatch(/\bcompare[A-Za-z0-9]+Page\.[a-z]/i);
            expect(container.textContent).not.toMatch(
                /\bcomparison\.(nav|lastReviewed|statusLabel|otherComparisons)\b/,
            );
        },
    );

    it("links to the other published comparisons, never to itself", async () => {
        await renderWithin(<ComparisonPage definition={FIXTURE_COMPARISON} />);

        const block = screen.getByRole("region", { name: "Weitere Vergleiche" });
        const links = within(block).getAllByRole("link");
        expect(links.map((link) => link.getAttribute("href"))).toEqual(
            COMPARISON_REGISTRY.map((entry) => `/de/compare/${entry.slug}`),
        );
        const barnebys = links.find((link) => link.getAttribute("href") === "/de/compare/barnebys");
        expect(barnebys).toHaveTextContent("Aura Historia vs. Barnebys");
        expect(barnebys).toHaveTextContent(i18n.t(BARNEBYS_COMPARISON.positioningKey));
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
