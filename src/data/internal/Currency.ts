import type { CurrencyData } from "@/client";

export const CURRENCIES = ["EUR", "GBP", "USD", "AUD", "CAD", "NZD"] as const;
export type Currency = (typeof CURRENCIES)[number]; // Create something like that: "EUR" | "GBP" | "USD" | ....

export function parseCurrency(currency?: string): Currency {
    const uppercasedCurrency = currency?.toUpperCase() ?? "EUR";

    switch (uppercasedCurrency) {
        case "EUR":
        case "GBP":
        case "USD":
        case "AUD":
        case "CAD":
        case "NZD":
            return uppercasedCurrency;
        default:
            return "EUR";
    }
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
            return currency;
    }
}
