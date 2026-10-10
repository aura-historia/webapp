import type { CurrencyData } from "@/client";
import { getCurrency } from "locale-currency";

export const CURRENCIES = [
    "EUR",
    "GBP",
    "USD",
    "AUD",
    "CAD",
    "NZD",
    "CNY",
    "BRL",
    "PLN",
    "TRY",
    "JPY",
    "CZK",
    "RUB",
    "AED",
    "SAR",
    "HKD",
    "SGD",
    "CHF",
    "ZAR",
    "SEK",
    "DKK",
    "NOK",
    "KRW",
    "INR",
    "TWD",
    "HUF",
    "RON",
    "MXN",
    "THB",
] as const satisfies readonly CurrencyData[];
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS = {
    EUR: "€",
    GBP: "£",
    USD: "$",
    AUD: "A$",
    CAD: "C$",
    NZD: "NZ$",
    CNY: "CN¥",
    BRL: "R$",
    PLN: "zł",
    TRY: "₺",
    JPY: "¥",
    CZK: "Kč",
    RUB: "₽",
    AED: "د.إ",
    SAR: "ر.س",
    HKD: "HK$",
    SGD: "S$",
    CHF: "CHF",
    ZAR: "R",
    SEK: "SEK",
    DKK: "DKK",
    NOK: "NOK",
    KRW: "₩",
    INR: "₹",
    TWD: "NT$",
    HUF: "Ft",
    RON: "lei",
    MXN: "MX$",
    THB: "฿",
} as const satisfies Record<Currency, string>;

/**
 * ISO 4217 minor-unit exponents used by the backend for `amount` values. This is the single
 * arithmetic policy: never derive it from `Intl`, which reports cash digits for some currencies
 * (e.g. 0 for HUF) that disagree with the backend contract.
 */
export const CURRENCY_MINOR_UNIT_EXPONENTS = {
    EUR: 2,
    GBP: 2,
    USD: 2,
    AUD: 2,
    CAD: 2,
    NZD: 2,
    CNY: 2,
    BRL: 2,
    PLN: 2,
    TRY: 2,
    JPY: 0,
    CZK: 2,
    RUB: 2,
    AED: 2,
    SAR: 2,
    HKD: 2,
    SGD: 2,
    CHF: 2,
    ZAR: 2,
    SEK: 2,
    DKK: 2,
    NOK: 2,
    KRW: 0,
    INR: 2,
    TWD: 2,
    HUF: 2,
    RON: 2,
    MXN: 2,
    THB: 2,
} as const satisfies Record<Currency, number>;

export function isCurrency(value: unknown): value is Currency {
    return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value);
}

/**
 * Normalises a currency code to a supported `Currency`, or `undefined` if unsupported.
 * Use this for payloads where an unsupported code must not be replaced by a default.
 */
export function toSupportedCurrency(currency?: string | null): Currency | undefined {
    const uppercasedCurrency = currency?.trim().toUpperCase();
    return isCurrency(uppercasedCurrency) ? uppercasedCurrency : undefined;
}

/** Preference helper: falls back to EUR for absent or unsupported input. */
export function parseCurrency(currency?: string): Currency {
    return toSupportedCurrency(currency) ?? "EUR";
}

export function inferCurrencyFromLocale(locale: string): Currency {
    return parseCurrency(getCurrency(locale) ?? undefined);
}

export function mapToBackendCurrency(currency?: Currency): CurrencyData | null {
    return currency ?? null;
}
