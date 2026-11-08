import { Bell, Store } from "lucide-react";

import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import i18n from "@/i18n/i18nForTests";
import translationDE from "@/i18n/locales/de/translation.json";

/** A namespace that exists only in tests; it reuses the Barnebys copy with another competitor. */
export const FIXTURE_NAMESPACE = "compareFixturePage";
export const FIXTURE_COMPETITOR = "Beispielhaus";

/**
 * A second comparison built only from a definition and copy, as the "Adding a comparison" recipe
 * describes: no `sources` or `alerts` chapter, a tie in the quick answer, a different competitor.
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

/** Adds the fixture's copy to the test i18n instance: Barnebys' German copy, renamed. */
export function registerFixtureTranslations() {
    const copy = structuredClone(translationDE.compareBarnebysPage);
    copy.hero.title = `Aura Historia und <em>${FIXTURE_COMPETITOR}</em>`;
    copy.scorecard.headers.competitor = FIXTURE_COMPETITOR;
    copy.positioning = "Ein Testdienst für die Vorlage.";
    i18n.addResourceBundle("de", "translation", { [FIXTURE_NAMESPACE]: copy }, true, true);
}
