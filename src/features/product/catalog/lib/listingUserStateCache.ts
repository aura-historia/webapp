import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";

/**
 * Viewer state shared by mapped listings (`ProductListing.userState`) and the raw personalized
 * detail DTO cached for SSR (`{ item, userState }`). `hasUnseenNotification` exists only on mapped
 * listings; updates preserve whichever shape they receive.
 */
export type ListingUserStateShape = {
    readonly watchlist: { readonly watching: boolean; readonly notifications: boolean };
    readonly notification: {
        readonly unseenNotificationIds: readonly string[];
        readonly hasUnseenNotification?: boolean;
    };
    readonly searchFilter: {
        readonly matched: boolean;
        readonly hidden: boolean;
        readonly userSearchFilterId?: string;
        readonly userSearchFilterName?: string;
        readonly matchFeedback?: boolean;
    };
};

/** Return the same reference when nothing changes so untouched caches are not rewritten. */
export type ListingUserStateUpdate = <TState extends ListingUserStateShape>(
    state: TState,
) => TState;

export type ListingTarget = { readonly productListingId: string } | "allListings";

type ListingCarrier = { readonly userState?: ListingUserStateShape | null };

const LISTING_COLLECTION_KEYS = ["pages", "products", "items"] as const;

function getCarrierListingId(value: object): string | undefined {
    if ("productListingId" in value && typeof value.productListingId === "string") {
        return value.productListingId;
    }
    if (
        "item" in value &&
        typeof value.item === "object" &&
        value.item !== null &&
        "productListingId" in value.item &&
        typeof value.item.productListingId === "string"
    ) {
        return value.item.productListingId;
    }
    return undefined;
}

function isTargeted(listingId: string, target: ListingTarget): boolean {
    return target === "allListings" || target.productListingId === listingId;
}

/** Walks listing collections, single listings and infinite pages without knowing the query. */
function updateListings(
    value: unknown,
    target: ListingTarget,
    update: (listing: ListingCarrier) => ListingCarrier | null,
): unknown {
    if (Array.isArray(value)) {
        let changed = false;
        const next = value.flatMap((item) => {
            const updated = updateListings(item, target, update);
            if (updated !== item) changed = true;
            return updated === null ? [] : [updated];
        });
        return changed ? next : value;
    }

    if (typeof value !== "object" || value === null) return value;

    const listingId = "userState" in value ? getCarrierListingId(value) : undefined;
    if (listingId !== undefined) {
        return isTargeted(listingId, target) ? update(value as ListingCarrier) : value;
    }

    let changed = false;
    const next: Record<string, unknown> = { ...value };
    for (const key of LISTING_COLLECTION_KEYS) {
        if (!(key in value)) continue;
        const current = (value as Record<string, unknown>)[key];
        const updated = updateListings(current, target, update);
        if (updated !== current) {
            next[key] = updated;
            changed = true;
        }
    }
    return changed ? next : value;
}

/** Keys partitioned to another account (e.g. a watchlist) are never touched for this viewer. */
function belongsToViewer(queryKey: QueryKey, viewerId: string | undefined): boolean {
    const index = queryKey.indexOf("viewer");
    return index === -1 || viewerId === undefined || queryKey[index + 1] === viewerId;
}

function findListingQueries(queryClient: QueryClient, queryKey: QueryKey, viewerId?: string) {
    return queryClient
        .getQueryCache()
        .findAll({ queryKey })
        .filter((query) => belongsToViewer(query.queryKey, viewerId));
}

function rewriteListingQueries(
    queryClient: QueryClient,
    queryKey: QueryKey,
    target: ListingTarget,
    update: (listing: ListingCarrier) => ListingCarrier | null,
    viewerId?: string,
) {
    for (const query of findListingQueries(queryClient, queryKey, viewerId)) {
        const data = query.state.data;
        const next = updateListings(data, target, update);
        if (next !== data) queryClient.setQueryData(query.queryKey, next);
    }
}

/**
 * Apply a viewer-state update to every cached copy of the targeted listings. Pass the mutation's
 * `viewerId` to leave caches partitioned to another account untouched.
 */
export function patchListingUserState(
    queryClient: QueryClient,
    target: ListingTarget,
    update: ListingUserStateUpdate,
    viewerId?: string,
) {
    rewriteListingQueries(
        queryClient,
        productListingQueryKeys.all,
        target,
        (listing) => {
            if (!listing.userState) return listing;
            const userState = update(listing.userState);
            return userState === listing.userState ? listing : { ...listing, userState };
        },
        viewerId,
    );
}

/** Drop a listing from the collections under `queryKey`, e.g. after removing it from the watchlist. */
export function removeListingFromQueries(
    queryClient: QueryClient,
    queryKey: QueryKey,
    productListingId: string,
) {
    rewriteListingQueries(queryClient, queryKey, { productListingId }, () => null);
}

/** Stop older listing responses from overwriting a confirmed update. */
export function cancelListingQueries(queryClient: QueryClient, viewerId?: string) {
    return queryClient.cancelQueries({
        queryKey: productListingQueryKeys.all,
        predicate: ({ queryKey }) => belongsToViewer(queryKey, viewerId),
    });
}

export function invalidateListingQueries(queryClient: QueryClient, viewerId?: string) {
    return queryClient.invalidateQueries({
        queryKey: productListingQueryKeys.all,
        predicate: ({ queryKey }) => belongsToViewer(queryKey, viewerId),
    });
}

export function withWatchlistState(patch: {
    readonly watching?: boolean;
    readonly notifications?: boolean;
}): ListingUserStateUpdate {
    return (state) => {
        const watching = patch.watching ?? state.watchlist.watching;
        const notifications = patch.notifications ?? state.watchlist.notifications;
        if (
            watching === state.watchlist.watching &&
            notifications === state.watchlist.notifications
        ) {
            return state;
        }
        return { ...state, watchlist: { ...state.watchlist, watching, notifications } };
    };
}

/** Remove seen notification IDs from the unread projection; `undefined` means every ID. */
export function withoutUnseenNotifications(
    notificationIds: ReadonlySet<string> | undefined,
): ListingUserStateUpdate {
    return (state) => {
        const current = state.notification.unseenNotificationIds;
        const unseenNotificationIds =
            notificationIds === undefined ? [] : current.filter((id) => !notificationIds.has(id));
        if (unseenNotificationIds.length === current.length) return state;
        return {
            ...state,
            notification: {
                ...state.notification,
                unseenNotificationIds,
                ...("hasUnseenNotification" in state.notification
                    ? { hasUnseenNotification: unseenNotificationIds.length > 0 }
                    : {}),
            },
        };
    };
}

function forSearchFilter(
    userSearchFilterId: string,
    update: (
        searchFilter: ListingUserStateShape["searchFilter"],
    ) => ListingUserStateShape["searchFilter"],
): ListingUserStateUpdate {
    return (state) => {
        if (state.searchFilter.userSearchFilterId !== userSearchFilterId) return state;
        return { ...state, searchFilter: update(state.searchFilter) };
    };
}

export function withSearchFilterMatchFeedback(
    userSearchFilterId: string,
    matchFeedback: boolean | undefined,
): ListingUserStateUpdate {
    return forSearchFilter(userSearchFilterId, (searchFilter) => {
        const { matchFeedback: _previous, ...rest } = searchFilter;
        return matchFeedback === undefined ? rest : { ...rest, matchFeedback };
    });
}

export function withSearchFilterName(
    userSearchFilterId: string,
    userSearchFilterName: string,
): ListingUserStateUpdate {
    return forSearchFilter(userSearchFilterId, (searchFilter) => ({
        ...searchFilter,
        userSearchFilterName,
    }));
}

/** A deleted saved search no longer matches; the following refetch supplies any other match. */
export function withoutSearchFilterMatch(userSearchFilterId: string): ListingUserStateUpdate {
    return forSearchFilter(userSearchFilterId, () => ({ matched: false, hidden: false }));
}
