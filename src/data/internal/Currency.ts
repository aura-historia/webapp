import type { CurrencyData } from "@/client";

export type Currency = "EUR" | "GBP" | "USD" | "AUD" | "CAD" | "NZD";

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
