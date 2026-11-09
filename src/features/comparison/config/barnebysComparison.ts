import { Bell, Clock, Globe, Languages, SearchCheck, Store, Sun, Telescope } from "lucide-react";

import type { ComparisonDefinition } from "@/features/comparison/config/comparisonDefinition.ts";
import { BARNEBYS_COMPARISON_LAST_REVIEWED } from "@/features/comparison/config/barnebysComparisonReview.ts";

/*
 * Sources for the claims about Barnebys (all accessed 2026-11-08). Never render these as links:
 * calls to action stay internal and the page never links to a competitor.
 *
 * - Status: Barnebys Group AB (556839-6062) declared bankrupt by Stockholms tingsrätt on
 *   11 March 2026, on its own application.
 *   https://www.realtid.se/bors-finans/auktionssajt-i-konkurs-ett-ar-efter-lyckad-nyemission/
 *   https://www.placera.se/telegram/auktionssajten-barnebys-har-gatt-i-konkurs-di-digital-20260312
 *   https://www.dagensps.se/foretag/konkurs-for-hardsatsande-auktionssajt/
 *   https://www.allabolag.se/foretag/barnebys-group-ab/stockholm/detaljhandel/2K3A1WEI63ILU
 * - Continuation: "Boje Group AB … has acquired and continues to operate the business previously
 *   conducted by Barnebys Group AB" (privacy policy, "latest updated 2026-08-03"); the terms of use
 *   name Boje Group AB as the provider; barnebys.com and its country sites list current auctions.
 *   https://www.barnebys.com/page/cookies-consent
 *   https://www.barnebys.com/page/terms-of-use
 * - Alerts: "By creating a search alert, you'll get an email notification when new items matching
 *   your saved searches are listed on Barnebys." No frequency or time of day is published, so the
 *   page makes no alert-speed comparison.
 *   https://www.barnebys.com/page/faq
 * - Coverage: "an online auction search engine" (site title); "items from auction houses and
 *   dealers all over the world" (FAQ); "2,000+ trusted sellers" (homepage).
 *   https://www.barnebys.com/
 */

/** Aura Historia vs Barnebys: `/{lng}/compare/barnebys`, copy in `compareBarnebysPage.*`. */
export const BARNEBYS_COMPARISON = {
    slug: "barnebys",
    routePath: "/$lng/compare/barnebys",
    competitorName: "Barnebys",
    namespace: "compareBarnebysPage",
    metaKey: "compareBarnebys",
    lastReviewed: BARNEBYS_COMPARISON_LAST_REVIEWED,
    statusNote: true,
    quickVerdicts: [
        { key: "auctionDiscovery", winner: "competitor" },
        { key: "marketSearch", winner: "aura" },
        { key: "multilingualDiscovery", winner: "aura" },
        { key: "searchAlerts", winner: "tie" },
    ],
    advantages: [
        { key: "marketBeyondAuctions", icon: Store },
        { key: "nearRealTimeAlerts", icon: Bell },
        { key: "languagePenalties", icon: Languages },
        { key: "aiForwardMatching", icon: Sun },
    ],
    scorecardRows: [
        { key: "auctionHeritage", winner: "competitor" },
        { key: "sourceCoverage", winner: "aura" },
        { key: "searchAlerts", winner: "tie" },
        { key: "languageHandling", winner: "aura" },
        { key: "alertRelevance", winner: "aura" },
        { key: "technologyDirection", winner: "aura" },
    ],
    sources: {
        sourceKeys: [
            "auctionHouses",
            "auctionPlatforms",
            "antiqueDealers",
            "privateSellers",
            "marketplaces",
        ],
        cards: [
            { key: "underRadarInventory", icon: Telescope },
            { key: "realMarket", icon: SearchCheck },
            { key: "actEarly", icon: Clock },
            { key: "acrossBorders", icon: Globe },
        ],
    },
    alerts: { icon: Bell },
    faqItems: [
        { key: "alternative", anchor: "faq-alternative" },
        { key: "replace", anchor: "faq-replace" },
        { key: "status", anchor: "faq-status" },
        // The anchor keeps its first name so existing deep links still resolve.
        { key: "alerts", anchor: "faq-faster-alerts" },
        { key: "multilingualSearch", anchor: "faq-multilingual-search" },
        { key: "outsideAuctions", anchor: "faq-outside-auctions" },
    ],
    structuredDataTopics: [
        "searchEngine",
        "auctionAggregation",
        "multilingualSearch",
        "realTimeAlerts",
        "aiDiscovery",
    ],
    positioningKey: "compareBarnebysPage.positioning",
} as const satisfies ComparisonDefinition;
