import { getProductListingIdentity } from "@/data/internal/product/ProductListingQueryKeys.ts";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import type { QueryClient, QueryKey } from "@tanstack/react-query";

const listingStateQueryPrefixes = [
    ["watchlist"],
    ["search"],
    ["similarProductListings"],
    ["dealerProducts"],
    ["searchFilterMatchedProducts"],
    ["searchFilterPreviewProducts"],
] as const;

function isListingStateQuery(queryKey: QueryKey): boolean {
    return listingStateQueryPrefixes.some(([prefix]) => queryKey[0] === prefix);
}

function isProductListing(value: unknown): value is ProductListing {
    return (
        typeof value === "object" &&
        value !== null &&
        "productListingId" in value &&
        "source" in value
    );
}

function updateListingCollections(
    value: unknown,
    productListingId: string,
    update: (listing: ProductListing) => ProductListing | null,
): unknown {
    if (Array.isArray(value)) {
        return value.flatMap((item) => {
            if (isProductListing(item)) {
                const identity = getProductListingIdentity({
                    productListingId: item.productListingId,
                    listingSourceId: item.source.listingSourceId,
                    sourceListingId: item.sourceListingId,
                });
                if (identity.productListingId !== productListingId) {
                    return [item];
                }
                const updated = update(item);
                return updated ? [updated] : [];
            }
            return [updateListingCollections(item, productListingId, update)];
        });
    }

    if (typeof value !== "object" || value === null) return value;

    let changed = false;
    const next: Record<string, unknown> = { ...value };
    for (const [key, item] of Object.entries(value)) {
        if (key === "products" || key === "items" || key === "pages") {
            const updated = updateListingCollections(item, productListingId, update);
            if (updated !== item) {
                next[key] = updated;
                changed = true;
            }
        }
    }
    return changed ? next : value;
}

export function snapshotWatchlistListingCaches(queryClient: QueryClient) {
    return queryClient
        .getQueryCache()
        .findAll({ predicate: ({ queryKey }) => isListingStateQuery(queryKey) })
        .map(({ queryKey }) => [queryKey, queryClient.getQueryData(queryKey)] as const);
}

export function updateWatchlistListingCaches(
    queryClient: QueryClient,
    productListingId: string,
    update: (listing: ProductListing) => ProductListing | null,
) {
    for (const [queryKey, data] of snapshotWatchlistListingCaches(queryClient)) {
        const next = updateListingCollections(data, productListingId, update);
        if (next !== data) queryClient.setQueryData(queryKey, next);
    }
}

export function removeListingFromWatchlistCache(
    queryClient: QueryClient,
    productListingId: string,
) {
    for (const [queryKey, data] of snapshotWatchlistListingCaches(queryClient)) {
        if (queryKey[0] !== "watchlist") continue;
        const next = updateListingCollections(data, productListingId, () => null);
        if (next !== data) queryClient.setQueryData(queryKey, next);
    }
}

export function restoreWatchlistListingCaches(
    queryClient: QueryClient,
    snapshots: ReturnType<typeof snapshotWatchlistListingCaches> | undefined,
) {
    for (const [queryKey, data] of snapshots ?? []) {
        queryClient.setQueryData(queryKey, data);
    }
}

export function isProductListingDetailQuery(queryKey: QueryKey): boolean {
    return queryKey.some(
        (part) =>
            typeof part === "object" &&
            part !== null &&
            "_id" in part &&
            ["getProductListingByTitleSlug", "getProductListing"].includes(
                String((part as { _id?: unknown })._id),
            ),
    );
}

export async function invalidateWatchlistRelatedQueries(queryClient: QueryClient) {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
        queryClient.invalidateQueries({ queryKey: ["search"] }),
        queryClient.invalidateQueries({ queryKey: ["similarProductListings"] }),
        queryClient.invalidateQueries({ queryKey: ["dealerProducts"] }),
        queryClient.invalidateQueries({ queryKey: ["searchFilterMatchedProducts"] }),
        queryClient.invalidateQueries({ queryKey: ["searchFilterPreviewProducts"] }),
        queryClient.invalidateQueries({
            predicate: ({ queryKey }) => isProductListingDetailQuery(queryKey),
        }),
    ]);
}

export function updateListingWatchlistState(
    listing: ProductListing,
    patch: { readonly watching?: boolean; readonly notifications?: boolean },
): ProductListing {
    if (!listing.userState) return listing;

    return {
        ...listing,
        userState: {
            ...listing.userState,
            watchlist: {
                ...listing.userState.watchlist,
                ...(patch.watching === undefined ? {} : { watching: patch.watching }),
                ...(patch.notifications === undefined
                    ? {}
                    : { notifications: patch.notifications }),
            },
        },
    };
}

export async function cancelWatchlistRelatedQueries(queryClient: QueryClient) {
    await Promise.all([
        ...listingStateQueryPrefixes.map(([queryKey]) =>
            queryClient.cancelQueries({ queryKey: [queryKey] }),
        ),
        queryClient.cancelQueries({
            predicate: ({ queryKey }) => isProductListingDetailQuery(queryKey),
        }),
    ]);
}
