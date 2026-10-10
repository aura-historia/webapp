import type { PriceData } from "@/client";
import {
    CURRENCY_MINOR_UNIT_EXPONENTS,
    CURRENCY_SYMBOLS,
    toSupportedCurrency,
} from "@/data/internal/common/Currency.ts";

export type Price = {
    readonly amount: number;
    readonly currency: string;
};

export function parsePrice(apiPayload: PriceData): Price {
    return {
        amount: apiPayload.amount,
        currency: apiPayload.currency,
    };
}

export function toMajorCurrencyAmount(amount: number, currency: string): number {
    return amount / currencyMinorUnitFactor(currency);
}

export function toMinorCurrencyAmount(amount: number, currency: string): number {
    return Math.round(amount * currencyMinorUnitFactor(currency));
}

/**
 * ISO 4217 minor-unit exponent of a currency, independent of any display locale. Supported
 * currencies use the backend contract; unknown codes fall back to the `Intl` currency digits.
 */
export function currencyMinorUnitDigits(currency: string): number {
    const supportedCurrency = toSupportedCurrency(currency);
    if (supportedCurrency) return CURRENCY_MINOR_UNIT_EXPONENTS[supportedCurrency];
    try {
        return (
            new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions()
                .maximumFractionDigits ?? 2
        );
    } catch {
        return 2;
    }
}

function currencyMinorUnitFactor(currency: string): number {
    return 10 ** currencyMinorUnitDigits(currency);
}

/** Currency format options whose fraction digits follow the backend minor-unit policy. */
export function currencyFormatOptions(currency: string): Intl.NumberFormatOptions {
    const digits = currencyMinorUnitDigits(currency);
    return {
        style: "currency",
        currency,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    };
}

export function formatPrice(data: Price, locale?: string): string {
    const formatted = new Intl.NumberFormat(
        locale ?? navigator.language,
        currencyFormatOptions(data.currency),
    ).format(toMajorCurrencyAmount(data.amount, data.currency));

    return replaceCurrencyCodeWithSymbol(formatted, data.currency);
}

export function replaceCurrencyCodeWithSymbol(formatted: string, currency: string): string {
    const supportedCurrency = toSupportedCurrency(currency);
    return supportedCurrency
        ? formatted.replace(supportedCurrency, CURRENCY_SYMBOLS[supportedCurrency])
        : formatted;
}
