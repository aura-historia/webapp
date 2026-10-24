import type { TFunction } from "i18next";
import { formatPrice } from "@/data/internal/price/Price.ts";
import type { ListingPriceEstimate } from "@/data/internal/product/ProductListingDomain.ts";

/** A listing's estimate as shown on the detail page: a range, or one open end. */
export function formatPriceEstimate(
    min: ListingPriceEstimate | null | undefined,
    max: ListingPriceEstimate | null | undefined,
    t: TFunction,
    locale: string,
): string | undefined {
    if (min && max) {
        return t("product.estimate.range", {
            min: formatPrice(min, locale),
            max: formatPrice(max, locale),
        });
    }
    if (min) return t("product.estimate.from", { price: formatPrice(min, locale) });
    if (max) return t("product.estimate.upTo", { price: formatPrice(max, locale) });
    return undefined;
}
