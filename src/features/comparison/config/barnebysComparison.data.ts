/** The page's chapters: every h2 has one of these ids, and the jump links point at them. */
export const BARNEBYS_COMPARISON_SECTION_IDS = {
    summary: "summary",
    respect: "respect",
    advantages: "advantages",
    scorecard: "scorecard",
    sources: "sources",
    alerts: "alerts",
    faq: "faq",
    verdict: "verdict",
} as const;

export type BarnebysComparisonSectionId =
    (typeof BARNEBYS_COMPARISON_SECTION_IDS)[keyof typeof BARNEBYS_COMPARISON_SECTION_IDS];

/** "On this page" links in page order, with the chapter numeral the phone list shows beside each. */
export const BARNEBYS_COMPARISON_NAV = [
    { id: BARNEBYS_COMPARISON_SECTION_IDS.summary, marker: "I" },
    { id: BARNEBYS_COMPARISON_SECTION_IDS.advantages, marker: "III" },
    { id: BARNEBYS_COMPARISON_SECTION_IDS.scorecard, marker: "IV" },
    { id: BARNEBYS_COMPARISON_SECTION_IDS.sources, marker: "V" },
    { id: BARNEBYS_COMPARISON_SECTION_IDS.alerts, marker: "VI" },
    { id: BARNEBYS_COMPARISON_SECTION_IDS.faq, marker: "VII" },
    { id: BARNEBYS_COMPARISON_SECTION_IDS.verdict, marker: "→" },
] as const;

/** Which service a verdict favours: Aura Historia's carry the oxblood mark, Barnebys' stay outlined. */
export type ComparisonWinner = "aura" | "barnebys";

export const BARNEBYS_QUICK_VERDICTS = [
    { key: "auctionDiscovery", winner: "barnebys" },
    { key: "marketSearch", winner: "aura" },
    { key: "multilingualDiscovery", winner: "aura" },
    { key: "realTimeMonitoring", winner: "aura" },
] as const satisfies readonly { key: string; winner: ComparisonWinner }[];

export const BARNEBYS_ADVANTAGE_KEYS = [
    "marketBeyondAuctions",
    "nearRealTimeAlerts",
    "languagePenalties",
    "aiForwardMatching",
] as const;

export const BARNEBYS_SCORECARD_ROWS = [
    { key: "auctionHeritage", winner: "barnebys" },
    { key: "sourceCoverage", winner: "aura" },
    { key: "alertSpeed", winner: "aura" },
    { key: "languageHandling", winner: "aura" },
    { key: "alertRelevance", winner: "aura" },
    { key: "technologyDirection", winner: "aura" },
] as const satisfies readonly { key: string; winner: ComparisonWinner }[];

export const BARNEBYS_SOURCE_KEYS = [
    "auctionHouses",
    "auctionPlatforms",
    "antiqueDealers",
    "privateSellers",
    "marketplaces",
] as const;

export const BARNEBYS_DOWNSTREAM_KEYS = [
    "underRadarInventory",
    "realMarket",
    "beforeDigest",
    "acrossBorders",
] as const;

/** FAQ items with their stable anchors (`#faq-alternative` …); the answers are always in the DOM. */
export const BARNEBYS_FAQ_ITEMS = [
    { key: "alternative", anchor: "faq-alternative" },
    { key: "replace", anchor: "faq-replace" },
    { key: "fasterAlerts", anchor: "faq-faster-alerts" },
    { key: "multilingualSearch", anchor: "faq-multilingual-search" },
    { key: "outsideAuctions", anchor: "faq-outside-auctions" },
] as const;

export const BARNEBYS_STRUCTURED_DATA_TOPICS = [
    "searchEngine",
    "auctionAggregation",
    "multilingualSearch",
    "realTimeAlerts",
    "aiDiscovery",
] as const;
