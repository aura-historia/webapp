import type { Currency } from "@/data/internal/common/Currency.ts";

export type BillingInterval = "monthly" | "yearly";

export interface PricingFeature {
    readonly key: string;
    readonly isAccent?: boolean;
}

/**
 * Configured subscription prices in major units, one per supported currency. These are the
 * fixed Stripe catalogue amounts, never listing FX conversions; the yearly charge is ten
 * monthly charges. The full `Record` makes a newly supported currency a type error here
 * until both paid plans are priced in it.
 */
export type SubscriptionPrices = Readonly<Record<Currency, number>>;

interface PricingTierBase {
    readonly nameKey: string;
    readonly descKey: string;
    readonly features: readonly PricingFeature[];
    readonly isHighlighted?: boolean;
}

export interface FreePricingTier extends PricingTierBase {
    readonly id: "free";
}

export interface PaidPricingTier extends PricingTierBase {
    readonly id: "pro" | "ultimate";
    readonly prices: SubscriptionPrices;
    readonly yearlyPrices: SubscriptionPrices;
}

export type PricingTier = FreePricingTier | PaidPricingTier;

const PRO_MONTHLY_PRICES: SubscriptionPrices = {
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
    ZAR: 229.9,
    SEK: 169.9,
    DKK: 109.9,
    NOK: 159.9,
    KRW: 21900,
    INR: 1299,
    TWD: 549,
    HUF: 4990,
    RON: 69.9,
    MXN: 249.9,
    THB: 499,
    ARS: 21990,
};

const PRO_YEARLY_PRICES: SubscriptionPrices = {
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
    ZAR: 2299,
    SEK: 1699,
    DKK: 1099,
    NOK: 1599,
    KRW: 219000,
    INR: 12990,
    TWD: 5490,
    HUF: 49900,
    RON: 699,
    MXN: 2499,
    THB: 4990,
    ARS: 219900,
};

const ULTIMATE_MONTHLY_PRICES: SubscriptionPrices = {
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
    ZAR: 599.9,
    SEK: 429.9,
    DKK: 279.9,
    NOK: 399.9,
    KRW: 54900,
    INR: 3299,
    TWD: 1399,
    HUF: 11990,
    RON: 179.9,
    MXN: 649.9,
    THB: 1199,
    ARS: 54990,
};

const ULTIMATE_YEARLY_PRICES: SubscriptionPrices = {
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
    ZAR: 5999,
    SEK: 4299,
    DKK: 2799,
    NOK: 3999,
    KRW: 549000,
    INR: 32990,
    TWD: 13990,
    HUF: 119900,
    RON: 1799,
    MXN: 6499,
    THB: 11990,
    ARS: 549900,
};

/** Feature rows follow the backend entitlements; keep them in step with its tier policies. */
export const PRICING_TIERS: readonly PricingTier[] = [
    {
        id: "free",
        nameKey: "landingPage.pricing.free.name",
        descKey: "landingPage.pricing.free.description",
        features: [
            { key: "landingPage.pricing.free.features.search" },
            { key: "landingPage.pricing.free.features.watchlistItems" },
            { key: "landingPage.pricing.free.features.searchAlerts" },
            { key: "landingPage.pricing.free.features.alertMatches" },
            { key: "landingPage.pricing.free.features.alertCriteria" },
            { key: "landingPage.pricing.free.features.matching" },
        ],
    },
    {
        id: "pro",
        nameKey: "landingPage.pricing.pro.name",
        descKey: "landingPage.pricing.pro.description",
        prices: PRO_MONTHLY_PRICES,
        yearlyPrices: PRO_YEARLY_PRICES,
        features: [
            { key: "landingPage.pricing.pro.features.search" },
            { key: "landingPage.pricing.pro.features.watchlistItems" },
            { key: "landingPage.pricing.pro.features.searchAlerts" },
            { key: "landingPage.pricing.pro.features.alertMatches" },
            { key: "landingPage.pricing.pro.features.alertCriteria" },
            { key: "landingPage.pricing.pro.features.matching" },
        ],
        isHighlighted: true,
    },
    {
        id: "ultimate",
        nameKey: "landingPage.pricing.ultimate.name",
        descKey: "landingPage.pricing.ultimate.description",
        prices: ULTIMATE_MONTHLY_PRICES,
        yearlyPrices: ULTIMATE_YEARLY_PRICES,
        features: [
            { key: "landingPage.pricing.ultimate.features.search" },
            { key: "landingPage.pricing.ultimate.features.watchlistItems" },
            { key: "landingPage.pricing.ultimate.features.searchAlerts" },
            { key: "landingPage.pricing.ultimate.features.alertMatches" },
            { key: "landingPage.pricing.ultimate.features.alertCriteria" },
            { key: "landingPage.pricing.ultimate.features.matching" },
            {
                key: "landingPage.pricing.ultimate.features.searchInstructions",
                isAccent: true,
            },
        ],
    },
];
