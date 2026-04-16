import type { PriceData } from "@/client";
import { CURRENCY_SYMBOLS, type Currency } from "@/data/internal/common/Currency.ts";

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

export function formatPrice(data: Price, locale?: string): string {
    const formatted = new Intl.NumberFormat(locale ?? navigator.language, {
        style: "currency",
        currency: data.currency,
    }).format(data.amount / 100);

    const sym = CURRENCY_SYMBOLS[data.currency as Currency];
    return sym ? formatted.replace(data.currency, sym) : formatted;
}
