import type { Currency } from "@/data/internal/common/Currency.ts";
import type { Language } from "@/data/internal/common/Language.ts";

export type ProductListingIdentity = {
    readonly productListingId: string;
    readonly listingSourceId: string;
    readonly sourceListingId: string;
};

export type ProductListingQueryContext = {
    readonly language: Language;
    readonly currency: Currency;
};

export type ProductListingDetailQueryContext = {
    readonly language: Language;
    readonly currency: Currency | undefined;
};

export type ViewerProductListingQueryContext = ProductListingQueryContext & {
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

const all = ["productListings"] as const;

/**
 * Every query whose data contains listings, and therefore personalized `userState`, lives under
 * one root. Cache updates, invalidation and viewer clearing address listings through `all`.
 */
export const productListingQueryKeys = {
    all,
    /** The SSR loader may lack a preferred currency; the API then uses its default. */
    detailBySlug(productListingTitleSlugId: string, context: ProductListingDetailQueryContext) {
        return [
            ...all,
            "detail",
            productListingTitleSlugId,
            context.language,
            context.currency,
        ] as const;
    },
    search(criteria: object, context: ProductListingQueryContext) {
        return [...all, "search", criteria, context.language, context.currency] as const;
    },
    recentlyAdded(context: ProductListingQueryContext) {
        return [...all, "recentlyAdded", context.language, context.currency] as const;
    },
    similar(productListingId: string, context: ProductListingQueryContext) {
        return [...all, "similar", productListingId, context.language, context.currency] as const;
    },
    dealer(
        listingSourceId: string,
        excludeProductListingId: string,
        context: ProductListingQueryContext,
    ) {
        return [
            ...all,
            "dealer",
            listingSourceId,
            excludeProductListingId,
            context.language,
            context.currency,
        ] as const;
    },
    source(listingSourceId: string, pageSize: number, context: ProductListingQueryContext) {
        return [
            ...all,
            "source",
            listingSourceId,
            pageSize,
            context.language,
            context.currency,
        ] as const;
    },
    watchlistOf(viewerCacheKey: string | undefined) {
        return [...all, "watchlist", ...viewerPartition(viewerCacheKey)] as const;
    },
    watchlist(context: ViewerProductListingQueryContext) {
        return [
            ...this.watchlistOf(context.viewerCacheKey),
            context.language,
            context.currency,
        ] as const;
    },
    savedSearchMatches(userSearchFilterId: string) {
        return [...all, "savedSearchMatches", userSearchFilterId] as const;
    },
    savedSearchMatchesPage(userSearchFilterId: string, context: ProductListingQueryContext) {
        return [
            ...this.savedSearchMatches(userSearchFilterId),
            context.language,
            context.currency,
        ] as const;
    },
    savedSearchPreview(search: object, context: ProductListingQueryContext) {
        return [...all, "savedSearchPreview", search, context.language, context.currency] as const;
    },
};
