import type { QueryClient, QueryKey } from "@tanstack/react-query";

const viewerScopedQueryPrefixes = new Set([
    "oauthClient",
    "ownListingSources",
    "own-partnership-applications",
    "admin",
    "auctionCatalogues",
    "access-tokens",
    "watchlist",
    "search",
    "similarProductListings",
    "dealerProducts",
    "productListings",
    "sourceProductListings",
    "searchFilterMatchedProducts",
    "searchFilterPreviewProducts",
    "getNotifications",
    "userAccount",
    "userSearchFilters",
    "userSearchFilter",
]);

const productListingQueryIds = new Set([
    "getProductListingByTitleSlug",
    "getProductListing",
    "simpleSearchProductListings",
]);

export function clearViewerScopedQueries(queryClient: QueryClient) {
    queryClient.removeQueries({
        predicate: ({ queryKey }) => isViewerScopedQuery(queryKey),
    });
}

export function isViewerScopedQuery(queryKey: QueryKey): boolean {
    return (
        (typeof queryKey[0] === "string" && viewerScopedQueryPrefixes.has(queryKey[0])) ||
        queryKey.some(
            (part) =>
                typeof part === "object" &&
                part !== null &&
                "_id" in part &&
                productListingQueryIds.has(String((part as { _id?: unknown })._id)),
        )
    );
}
