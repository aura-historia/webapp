import { Bell, Route, Store } from "lucide-react";

import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import i18n from "@/i18n/i18nForTests";
import translationDE from "@/i18n/locales/de/translation.json";

/** A namespace that exists only in tests; it reuses the Barnebys copy with another competitor. */
export const FIXTURE_NAMESPACE = "compareFixturePage";
export const FIXTURE_COMPETITOR = "Beispielhaus";

/**
 * A second comparison built only from a definition and copy, as the "Adding a comparison" recipe
 * describes: no `sources`, `alerts` or `together` chapter, a tie in the quick answer, a different
 * competitor.
 * It is never registered or routed, so no fake page ships.
 */
export const FIXTURE_COMPARISON = {
    slug: "beispielhaus",
    // A fixture needs some real compare route for its type; it is never rendered as a link here.
    routePath: "/$lng/compare/barnebys",
    competitorName: FIXTURE_COMPETITOR,
    namespace: FIXTURE_NAMESPACE,
    metaKey: "compareBarnebys",
    lastReviewed: "2026-01-15",
    quickVerdicts: [
        { key: "auctionDiscovery", winner: "competitor" },
        { key: "marketSearch", winner: "aura" },
        { key: "searchAlerts", winner: "tie" },
    ],
    advantages: [
        { key: "marketBeyondAuctions", icon: Store },
        { key: "nearRealTimeAlerts", icon: Bell },
    ],
    scorecardRows: [
        { key: "auctionHeritage", winner: "competitor" },
        { key: "searchAlerts", winner: "tie" },
        { key: "sourceCoverage", winner: "aura" },
    ],
    faqItems: [{ key: "alternative", anchor: "faq-alternative" }],
    structuredDataTopics: ["searchEngine", "aiDiscovery"],
    positioningKey: `${FIXTURE_NAMESPACE}.positioning`,
} as const satisfies ComparisonDefinition;

/** The fixture with the optional "how the two fit together" chapter (`#together`) added. */
export const FIXTURE_COMPARISON_WITH_TOGETHER = {
    ...FIXTURE_COMPARISON,
    together: { icon: Route },
} as const satisfies ComparisonDefinition;

/** The jump-link label of the fixture's `together` chapter. */
export const FIXTURE_TOGETHER_LABEL = "Zusammenspiel";

/**
 * Adds the fixture's copy to the test i18n instance: Barnebys' German copy, renamed, with its
 * alerts chapter copied as the `together` chapter.
 */
export function registerFixtureTranslations() {
    const base = structuredClone(translationDE.compareBarnebysPage);
    base.hero.title = `Aura Historia und <em>${FIXTURE_COMPETITOR}</em>`;
    base.scorecard.headers.competitor = FIXTURE_COMPETITOR;
    base.positioning = "Ein Testdienst für die Vorlage.";
    const copy = {
        ...base,
        together: structuredClone(base.alerts),
        nav: { items: { ...base.nav.items, together: FIXTURE_TOGETHER_LABEL } },
    };
    i18n.addResourceBundle("de", "translation", { [FIXTURE_NAMESPACE]: copy }, true, true);
}
