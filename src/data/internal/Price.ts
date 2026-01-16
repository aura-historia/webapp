import type { PriceData } from "@/client";

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
    return new Intl.NumberFormat(locale ?? navigator.language, {
        style: "currency",
        currency: data.currency,
    }).format(data.amount / 100);
}
