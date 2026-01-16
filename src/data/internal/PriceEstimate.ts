import type { PriceData } from "@/client";
import { formatPrice, parsePrice } from "@/data/internal/Price.ts";

export type PriceEstimate = {
    readonly min?: string;
    readonly max?: string;
};

export function parsePriceEstimate(
    min?: PriceData,
    max?: PriceData,
    locale?: string,
): PriceEstimate | undefined {
    if (!min && !max) {
        return undefined;
    }

    const minPrice = min && parsePrice(min);
    const maxPrice = max && parsePrice(max);

    return {
        min: minPrice && formatPrice(minPrice, locale),
        max: maxPrice && formatPrice(maxPrice, locale),
    };
}
