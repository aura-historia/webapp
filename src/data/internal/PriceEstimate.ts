import type { PriceData } from "@/client";
import { parsePrice, type Price } from "@/data/internal/Price.ts";

export type PriceEstimate = {
    readonly min?: Price;
    readonly max?: Price;
};

export function parsePriceEstimate(min?: PriceData, max?: PriceData): PriceEstimate | undefined {
    if (!min && !max) {
        return undefined;
    }

    const minPrice = min && parsePrice(min);
    const maxPrice = max && parsePrice(max);

    return {
        min: minPrice,
        max: maxPrice,
    };
}
