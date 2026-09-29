import type { QueryClient } from "@tanstack/react-query";

const viewerScopedQueryPrefixes = new Set([
    "watchlist",
    "search",
    "similarProductListings",
    "dealerProducts",
    "searchFilterMatchedProducts",
    "searchFilterPreviewProducts",
    "getNotifications",
    "userAccount",
    "userSearchFilters",
    "userSearchFilter",
]);

const productListingQueryIds = new Set(["getProductListingByTitleSlug", "getProductListing"]);

export function clearViewerScopedQueries(queryClient: QueryClient) {
    queryClient.removeQueries({
        predicate: ({ queryKey }) =>
            (typeof queryKey[0] === "string" && viewerScopedQueryPrefixes.has(queryKey[0])) ||
            queryKey.some(
                (part) =>
                    typeof part === "object" &&
                    part !== null &&
                    "_id" in part &&
                    productListingQueryIds.has(String((part as { _id?: unknown })._id)),
            ),
    });
}
