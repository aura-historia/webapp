import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";

const viewerScopedQueryPrefixes = new Set([
    "oauthClient",
    "ownListingSources",
    "own-partnership-applications",
    "admin",
    "access-tokens",
    // Every listing query carries personalized `userState`; see `productListingQueryKeys`.
    productListingQueryKeys.all[0],
    "getNotifications",
    "userAccount",
    "userSearchFilters",
    "userSearchFilter",
]);

export function clearViewerScopedQueries(queryClient: QueryClient) {
    queryClient.removeQueries({
        predicate: ({ queryKey }) => isViewerScopedQuery(queryKey),
    });
    // Pending listing writes (e.g. watchlist toggles) must not overlay the next viewer's state.
    const mutationCache = queryClient.getMutationCache();
    for (const mutation of mutationCache.findAll({ mutationKey: productListingQueryKeys.all })) {
        mutationCache.remove(mutation);
    }
}

export function isViewerScopedQuery(queryKey: QueryKey): boolean {
    return typeof queryKey[0] === "string" && viewerScopedQueryPrefixes.has(queryKey[0]);
}
