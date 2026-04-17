import type { Currency } from "@/data/internal/common/Currency.ts";

export interface PricingFeature {
    readonly key: string;
    readonly isAccent?: boolean;
}

export interface PricingTier {
    readonly id: "free" | "pro" | "ultimate";
    readonly nameKey: string;
    readonly descKey: string;
    readonly features: readonly PricingFeature[];
    readonly priceLabelKey?: string;
    readonly prices?: Readonly<Record<Currency, number>>;
    readonly isHighlighted?: boolean;
}

export const PRICING_TIERS: readonly PricingTier[] = [
    {
        id: "free",
        nameKey: "landingPage.pricing.free.name",
        descKey: "landingPage.pricing.free.description",
        priceLabelKey: "landingPage.pricing.free.name",
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
        id: "pro",
        nameKey: "landingPage.pricing.pro.name",
        descKey: "landingPage.pricing.pro.description",
        prices: {
            EUR: 13.9,
            GBP: 11.9,
            USD: 15.9,
            AUD: 24.9,
            CAD: 21.9,
            NZD: 26.9,
            CNY: 99.9,
            BRL: 69.9,
            PLN: 59.9,
            TRY: 549.9,
            JPY: 1900,
            CZK: 349.9,
            RUB: 1390,
            AED: 59.9,
            SAR: 59.9,
            HKD: 119.9,
            SGD: 21.9,
            CHF: 14.9,
        },
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
        id: "ultimate",
        nameKey: "landingPage.pricing.ultimate.name",
        descKey: "landingPage.pricing.ultimate.description",
        prices: {
            EUR: 34.9,
            GBP: 29.9,
            USD: 39.9,
            AUD: 59.9,
            CAD: 54.9,
            NZD: 64.9,
            CNY: 249.9,
            BRL: 179.9,
            PLN: 149.9,
            TRY: 1399,
            JPY: 4900,
            CZK: 899.9,
            RUB: 3490,
            AED: 149.9,
            SAR: 149.9,
            HKD: 299.9,
            SGD: 54.9,
            CHF: 37.9,
        },
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
