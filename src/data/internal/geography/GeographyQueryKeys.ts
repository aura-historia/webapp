import type { GeographicSearchData } from "@/client";

/**
 * Query keys for geography reads. Every root is registered as viewer-scoped, so sign-in, sign-out
 * and viewer changes remove these entries: addresses and destinations are private, management
 * views are authorization-dependent and discovery origins can be a user's own coordinates.
 * Private reads also use `cache: "no-store"`, the query `signal` and no retries.
 */
export const geographyQueryKeys = {
    userAddresses: ["userAddresses"] as const,
    userAddressPage(viewerCacheKey: string, after?: string) {
        return [...this.userAddresses, viewerCacheKey, "page", after ?? null] as const;
    },
    userAddress(viewerCacheKey: string, addressId: string) {
        return [...this.userAddresses, viewerCacheKey, "detail", addressId] as const;
    },
    browsingDestination(viewerCacheKey: string) {
        return ["browsingDestination", viewerCacheKey] as const;
    },
    partyLocations: ["partyLocations"] as const,
    partyLocationPage(viewerCacheKey: string, partyId: string, after?: string) {
        return [...this.partyLocations, viewerCacheKey, partyId, "page", after ?? null] as const;
    },
    partyLocation(viewerCacheKey: string, partyId: string, locationId: string) {
        return [...this.partyLocations, viewerCacheKey, partyId, "detail", locationId] as const;
    },
    sourceLocationDefault(viewerCacheKey: string, listingSourceId: string) {
        return ["sourceLocationDefault", viewerCacheKey, listingSourceId] as const;
    },
    /** Administrator reads live under the `admin` root that viewer changes already clear. */
    adminSourceLocationDefault(listingSourceId: string) {
        return ["admin", "sourceLocationDefault", listingSourceId] as const;
    },
    partyLocationDiscovery(geography: GeographicSearchData) {
        return ["partyLocationDiscovery", geography] as const;
    },
};

/** Roots to add to the viewer-scoped query registry. */
export const GEOGRAPHY_VIEWER_SCOPED_QUERY_ROOTS = [
    "userAddresses",
    "browsingDestination",
    "partyLocations",
    "sourceLocationDefault",
    "partyLocationDiscovery",
] as const;
