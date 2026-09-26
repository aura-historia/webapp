import type { CurrencyData, LanguageData } from "@/client";

export type ProductListingIdentity = {
    readonly productListingId: string;
    readonly listingSourceId: string;
    readonly sourceListingId: string;
};

export type ProductListingQueryContext = {
    readonly language: LanguageData;
    readonly currency: CurrencyData;
    /** Stable, non-secret cache partition for a signed-in account. Omit for anonymous data. */
    readonly viewerCacheKey?: string;
};

/** ProductListing IDs and source IDs are opaque API strings; preserve them verbatim. */
export function getProductListingIdentity(
    identity: ProductListingIdentity,
): ProductListingIdentity {
    return {
        productListingId: identity.productListingId,
        listingSourceId: identity.listingSourceId,
        sourceListingId: identity.sourceListingId,
    };
}

function viewerPartition(
    viewerCacheKey?: string,
): readonly ["anonymous"] | readonly ["viewer", string] {
    return viewerCacheKey === undefined ? ["anonymous"] : ["viewer", viewerCacheKey];
}

/** Stable query keys for listing data, with viewer state isolated by account cache partition. */
export const productListingQueryKeys = {
    all: ["productListings"] as const,
    summaries(context: ProductListingQueryContext) {
        return [
            ...this.all,
            "summary",
            context.language,
            context.currency,
            ...viewerPartition(context.viewerCacheKey),
        ] as const;
    },
    summary(productListingId: string, context: ProductListingQueryContext) {
        return [
            ...this.all,
            "summary",
            productListingId,
            context.language,
            context.currency,
            ...viewerPartition(context.viewerCacheKey),
        ] as const;
    },
    detail(productListingId: string, context: ProductListingQueryContext) {
        return [
            ...this.all,
            "detail",
            productListingId,
            context.language,
            context.currency,
            ...viewerPartition(context.viewerCacheKey),
        ] as const;
    },
    history(productListingId: string) {
        return [...this.all, "history", productListingId] as const;
    },
};
