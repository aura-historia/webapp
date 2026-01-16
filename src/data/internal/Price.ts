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
