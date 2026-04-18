import type { Currency } from "@/data/internal/common/Currency.ts";

export type BillingInterval = "monthly" | "yearly";

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
    readonly yearlyPrices?: Readonly<Record<Currency, number>>;
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
            USD: 17.9,
            AUD: 22.9,
            CAD: 22.9,
            NZD: 27.9,
            CNY: 109.9,
            BRL: 79.9,
            PLN: 54.9,
            TRY: 689.9,
            JPY: 1900,
            CZK: 329.9,
            RUB: 1289.9,
            AED: 59.9,
            SAR: 59.9,
            HKD: 119.9,
            SGD: 19.9,
            CHF: 15.9,
        },
        yearlyPrices: {
            EUR: 139,
            GBP: 119,
            USD: 179,
            AUD: 229,
            CAD: 229,
            NZD: 279,
            CNY: 1099,
            BRL: 799,
            PLN: 549,
            TRY: 6899,
            JPY: 19000,
            CZK: 3299,
            RUB: 12899,
            AED: 599,
            SAR: 599,
            HKD: 1199,
            SGD: 199,
            CHF: 159,
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
            CAD: 59.9,
            NZD: 69.9,
            CNY: 279.9,
            BRL: 199.9,
            PLN: 149.9,
            TRY: 1899.9,
            JPY: 6499,
            CZK: 899.9,
            RUB: 3299.9,
            AED: 149.9,
            SAR: 149.9,
            HKD: 319.9,
            SGD: 54.9,
            CHF: 39.9,
        },
        yearlyPrices: {
            EUR: 349,
            GBP: 299,
            USD: 399,
            AUD: 599,
            CAD: 599,
            NZD: 699,
            CNY: 2799,
            BRL: 1999,
            PLN: 1499,
            TRY: 18999,
            JPY: 64990,
            CZK: 8999,
            RUB: 32999,
            AED: 1499,
            SAR: 1499,
            HKD: 3199,
            SGD: 549,
            CHF: 399,
        },
        features: [
            { key: "landingPage.pricing.ultimate.features.watchlistItems" },
            { key: "landingPage.pricing.ultimate.features.searchAlerts" },
            { key: "landingPage.pricing.ultimate.features.alertMatches" },
            { key: "landingPage.pricing.ultimate.features.alertType" },
            { key: "landingPage.pricing.ultimate.features.notificationSpeed" },
            { key: "landingPage.pricing.ultimate.features.searchType" },
            {
                key: "landingPage.pricing.ultimate.features.aiAgent",
                isAccent: true,
            },
        ],
    },
];
