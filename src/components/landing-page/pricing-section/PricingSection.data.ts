export interface PricingFeature {
    readonly key: string;
    readonly isAccent?: boolean;
}

export interface PricingTier {
    readonly nameKey: string;
    readonly descKey: string;
    readonly features: readonly PricingFeature[];
    readonly isHighlighted?: boolean;
}

export const PRICING_TIERS: readonly PricingTier[] = [
    {
        nameKey: "landingPage.pricing.free.name",
        descKey: "landingPage.pricing.free.description",
        features: [
            { key: "landingPage.pricing.free.features.watchlistItems" },
            { key: "landingPage.pricing.free.features.searchAlerts" },
            { key: "landingPage.pricing.free.features.alertMatches" },
            { key: "landingPage.pricing.free.features.alertType" },
            { key: "landingPage.pricing.free.features.notificationSpeed" },
            { key: "landingPage.pricing.free.features.searchType" },
        ],
    },
    {
        nameKey: "landingPage.pricing.pro.name",
        descKey: "landingPage.pricing.pro.description",
        features: [
            { key: "landingPage.pricing.pro.features.watchlistItems" },
            { key: "landingPage.pricing.pro.features.searchAlerts" },
            { key: "landingPage.pricing.pro.features.alertMatches" },
            { key: "landingPage.pricing.pro.features.alertType" },
            { key: "landingPage.pricing.pro.features.notificationSpeed" },
            { key: "landingPage.pricing.pro.features.searchType" },
        ],
        isHighlighted: true,
    },
    {
        nameKey: "landingPage.pricing.ultimate.name",
        descKey: "landingPage.pricing.ultimate.description",
        features: [
            { key: "landingPage.pricing.ultimate.features.watchlistItems" },
            { key: "landingPage.pricing.ultimate.features.searchAlerts" },
            { key: "landingPage.pricing.ultimate.features.alertMatches" },
            { key: "landingPage.pricing.ultimate.features.alertType" },
            { key: "landingPage.pricing.ultimate.features.notificationSpeed" },
            { key: "landingPage.pricing.ultimate.features.searchType" },
            { key: "landingPage.pricing.ultimate.features.aiAgent", isAccent: true },
        ],
    },
];
