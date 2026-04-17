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
] as const;
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
};

export function parseCurrency(currency?: string): Currency {
    const uppercasedCurrency = currency?.toUpperCase() ?? "EUR";

    switch (uppercasedCurrency) {
        case "EUR":
        case "GBP":
        case "USD":
        case "AUD":
        case "CAD":
        case "NZD":
        case "CNY":
        case "BRL":
        case "PLN":
        case "TRY":
        case "JPY":
        case "CZK":
        case "RUB":
        case "AED":
        case "SAR":
        case "HKD":
        case "SGD":
        case "CHF":
            return uppercasedCurrency;
        default:
            return "EUR";
    }
}

export function inferCurrencyFromLocale(locale: string): Currency {
    return parseCurrency(getCurrency(locale) ?? undefined);
}

export function mapToBackendCurrency(currency?: Currency): CurrencyData | null {
    if (!currency) return null;

    switch (currency) {
        case "EUR":
        case "GBP":
        case "USD":
        case "AUD":
        case "CAD":
        case "NZD":
        case "CNY":
        case "BRL":
        case "PLN":
        case "TRY":
        case "JPY":
        case "CZK":
        case "RUB":
        case "AED":
        case "SAR":
        case "HKD":
        case "SGD":
        case "CHF":
            return currency;
    }
}
