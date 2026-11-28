/**
 * Query keys for protected shipping management (profiles, the source default) and listing
 * delivery configuration. Every key carries the viewer and the source, and the root is
 * registered as viewer-scoped, so sign-in, sign-out and viewer changes remove the entries and no
 * viewer sees another's authorization-dependent reads. Reads use `cache: "no-store"`, the query
 * `signal` and no retries; a `409` refetches rather than retrying.
 *
 * Listing reads, including their public `item.shipping` and private `userState.shipping`, stay
 * under `productListingQueryKeys`: a listing search key holds the complete shipping predicate
 * (see `shippingSearchQueryKeyPart`) next to the currency, and destination changes invalidate
 * the listing root.
 */
export type ShippingProfileListFilter = {
    /** Stable producer identity; matches zero or one profile, including retired ones. */
    readonly objectKey?: string;
    readonly integrationMethod?: "SHOPIFY" | "WOOCOMMERCE";
};

const all = ["shipping"] as const;

export const shippingQueryKeys = {
    all,
    /** Every cached shipping read of one source for one viewer. */
    source(viewerCacheKey: string, listingSourceId: string) {
        return [...all, viewerCacheKey, listingSourceId] as const;
    },
    profiles(viewerCacheKey: string, listingSourceId: string) {
        return [...this.source(viewerCacheKey, listingSourceId), "profiles"] as const;
    },
    /** Keyset pages (`after` is the last profile ID of the previous page). */
    profileList(
        viewerCacheKey: string,
        listingSourceId: string,
        filter: ShippingProfileListFilter = {},
    ) {
        return [
            ...this.profiles(viewerCacheKey, listingSourceId),
            "list",
            filter.objectKey ?? null,
            filter.integrationMethod ?? null,
        ] as const;
    },
    profile(viewerCacheKey: string, listingSourceId: string, shippingProfileId: string) {
        return [
            ...this.profiles(viewerCacheKey, listingSourceId),
            "detail",
            shippingProfileId,
        ] as const;
    },
    sourceDefault(viewerCacheKey: string, listingSourceId: string) {
        return [...this.source(viewerCacheKey, listingSourceId), "default"] as const;
    },
    /** Keyed by the source-owned listing identity the delivery operations address. */
    listingDelivery(viewerCacheKey: string, listingSourceId: string, sourceListingId: string) {
        return [
            ...this.source(viewerCacheKey, listingSourceId),
            "delivery",
            sourceListingId,
        ] as const;
    },
};

/** Roots to add to the viewer-scoped query registry. */
export const SHIPPING_VIEWER_SCOPED_QUERY_ROOTS = [all[0]] as const;
