import { act, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { ARTSY_COMPARISON } from "@/features/comparison/config/artsyComparison.ts";
import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import { COMPARISON_REGISTRY } from "@/features/comparison/config/comparisonRegistry.ts";
import { FIRST_DIBS_COMPARISON } from "@/features/comparison/config/firstDibsComparison.ts";
import { INVALUABLE_COMPARISON } from "@/features/comparison/config/invaluableComparison.ts";
import i18n from "@/i18n/i18nForTests";
import { Route as FirstDibsRoute } from "@/routes/$lng.compare.1stdibs.tsx";
import { Route as ArtsyRoute } from "@/routes/$lng.compare.artsy.tsx";
import { Route as BarnebysRoute } from "@/routes/$lng.compare.barnebys.tsx";
import { Route as InvaluableRoute } from "@/routes/$lng.compare.invaluable.tsx";
import { renderWithRouter } from "@/test/utils";

vi.mock("@/env", () => ({ env: { VITE_APP_URL: "https://aura-historia.com" } }));

const ROUTES = [
    ["artsy", ARTSY_COMPARISON, ArtsyRoute],
    ["barnebys", BARNEBYS_COMPARISON, BarnebysRoute],
    ["invaluable", INVALUABLE_COMPARISON, InvaluableRoute],
    ["1stdibs", FIRST_DIBS_COMPARISON, FirstDibsRoute],
] as const;

type HeadResult = {
    meta?: Array<Record<string, string>>;
    links?: Array<{ rel: string; href: string }>;
    scripts?: Array<{ type: string; children: string }>;
};

function headOf(route: (typeof ROUTES)[number][2]): HeadResult {
    const head = route.options.head;
    expect(head).toBeDefined();
    return (head as (context: unknown) => HeadResult)({});
}

it("has a route test entry for every registered comparison", () => {
    expect(ROUTES.map(([slug]) => slug).sort()).toEqual(
        COMPARISON_REGISTRY.map((entry) => entry.slug).sort(),
    );
    for (const [, definition] of ROUTES) {
        expect(COMPARISON_REGISTRY).toContain(definition);
    }
});

describe.each(ROUTES)("the %s comparison route", (slug, definition, route) => {
    it("is the thin route of its definition", () => {
        expect(definition.slug).toBe(slug);
        expect(definition.routePath).toBe(`/$lng/compare/${slug}`);
        expect(route.options.loader).toBeUndefined();
        expect(route.options.beforeLoad).toBeUndefined();
    });

    it("publishes a canonical link, the Article and the FAQPage for its own page", () => {
        const head = headOf(route);

        expect(head.links?.find((link) => link.rel === "canonical")?.href).toMatch(
            new RegExp(`/compare/${slug}$`),
        );
        expect(head.meta?.some((entry) => entry.property === "og:type")).toBe(true);
        expect(head.scripts).toHaveLength(2);

        const [article, faqPage] = (head.scripts ?? []).map((script) =>
            JSON.parse(script.children),
        );
        expect(article).toMatchObject({
            "@type": "Article",
            dateModified: definition.lastReviewed,
        });
        expect(article.url).toMatch(new RegExp(`/compare/${slug}$`));
        expect(faqPage["@type"]).toBe("FAQPage");
        expect(faqPage.mainEntity).toHaveLength(definition.faqItems.length);
    });

    it("renders the page of its definition", async () => {
        const Component = route.options.component as () => ReactElement;

        await act(async () => {
            renderWithRouter(<Component />);
        });

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            i18n.t(`${definition.namespace}.hero.title`).replace(/<\/?(em|strong)>/g, ""),
        );
    });
});
