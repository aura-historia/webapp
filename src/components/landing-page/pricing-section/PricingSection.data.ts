export interface PricingTier {
    readonly nameKey: string;
    readonly descKey: string;
    readonly featureKeys: readonly string[];
    readonly isHighlighted?: boolean;
}

export const PRICING_TIERS: readonly PricingTier[] = [
    {
        nameKey: "landingPage.pricing.free.name",
        descKey: "landingPage.pricing.free.description",
        featureKeys: [
            "landingPage.pricing.free.features.watchlistItems",
            "landingPage.pricing.free.features.searchAlerts",
            "landingPage.pricing.free.features.alertMatches",
            "landingPage.pricing.free.features.alertType",
            "landingPage.pricing.free.features.notificationSpeed",
            "landingPage.pricing.free.features.searchType",
        ],
    },
    {
        nameKey: "landingPage.pricing.pro.name",
        descKey: "landingPage.pricing.pro.description",
        featureKeys: [
            "landingPage.pricing.pro.features.watchlistItems",
            "landingPage.pricing.pro.features.searchAlerts",
            "landingPage.pricing.pro.features.alertMatches",
            "landingPage.pricing.pro.features.alertType",
            "landingPage.pricing.pro.features.notificationSpeed",
            "landingPage.pricing.pro.features.searchType",
        ],
        isHighlighted: true,
    },
    {
        nameKey: "landingPage.pricing.ultimate.name",
        descKey: "landingPage.pricing.ultimate.description",
        featureKeys: [
            "landingPage.pricing.ultimate.features.watchlistItems",
            "landingPage.pricing.ultimate.features.searchAlerts",
            "landingPage.pricing.ultimate.features.alertMatches",
            "landingPage.pricing.ultimate.features.alertType",
            "landingPage.pricing.ultimate.features.notificationSpeed",
            "landingPage.pricing.ultimate.features.searchType",
            "landingPage.pricing.ultimate.features.aiAgent",
        ],
    },
];
