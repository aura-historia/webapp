import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";
import {
    invalidateListingQueries,
    patchListingUserState,
    removeListingFromQueries,
    withoutSearchFilterMatch,
    withoutUnseenNotifications,
    withSearchFilterMatchFeedback,
    withWatchlistState,
} from "../listingUserStateCache.ts";

const context = { language: "en", currency: "EUR" } as const;

function userState(overrides: { watching?: boolean; unseen?: string[]; filterId?: string } = {}) {
    return {
        watchlist: { watching: overrides.watching ?? false, notifications: false },
        contentVisibility: { showUnassessedOrSensitiveContent: false },
        notification: {
            unseenNotificationIds: overrides.unseen ?? [],
            hasUnseenNotification: (overrides.unseen ?? []).length > 0,
        },
        searchFilter: overrides.filterId
            ? {
                  matched: true,
                  hidden: false,
                  userSearchFilterId: overrides.filterId,
                  userSearchFilterName: "Vases",
              }
            : { matched: false, hidden: false },
    };
}

function listing(productListingId: string, state = userState()) {
    return { productListingId, source: { listingSourceId: "source-1" }, userState: state };
}

describe("listingUserStateCache", () => {
    let queryClient: QueryClient;
    const listKey = productListingQueryKeys.dealer("source-1", "listing-9", context);
    const pagesKey = productListingQueryKeys.search({ q: "vase" }, context);
    const matchesKey = productListingQueryKeys.savedSearchMatchesPage("filter-1", context);
    const similarKey = productListingQueryKeys.similar("listing-9", context);
    const detailKey = productListingQueryKeys.detailBySlug("vase", context);

    beforeEach(() => {
        queryClient = new QueryClient();
        queryClient.setQueryData(listKey, [listing("listing-1"), listing("listing-2")]);
        queryClient.setQueryData(pagesKey, {
            pages: [{ products: [listing("listing-1")] }, { products: [listing("listing-3")] }],
            pageParams: [undefined, "cursor"],
        });
        queryClient.setQueryData(matchesKey, {
            pages: [{ items: [listing("listing-1")] }],
            pageParams: [undefined],
        });
        queryClient.setQueryData(similarKey, {
            products: [listing("listing-1")],
            isEmbeddingsPending: false,
        });
        const { hasUnseenNotification: _, ...rawNotification } = userState().notification;
        queryClient.setQueryData(detailKey, {
            item: { productListingId: "listing-1" },
            userState: { ...userState(), notification: rawNotification },
        });
    });

    it("updates every cache shape that holds the targeted listing", () => {
        patchListingUserState(
            queryClient,
            { productListingId: "listing-1" },
            withWatchlistState({ watching: true }),
        );

        const watching = (value: { userState: { watchlist: { watching: boolean } } }) =>
            value.userState.watchlist.watching;
        type Listing = Parameters<typeof watching>[0];
        expect(queryClient.getQueryData<Listing[]>(listKey)?.map(watching)).toEqual([true, false]);
        expect(
            queryClient
                .getQueryData<{ pages: { products: Listing[] }[] }>(pagesKey)
                ?.pages.flatMap((page) => page.products.map(watching)),
        ).toEqual([true, false]);
        expect(
            queryClient.getQueryData<{ pages: { items: Listing[] }[] }>(matchesKey)?.pages[0]
                .items[0],
        ).toMatchObject({ userState: { watchlist: { watching: true } } });
        expect(
            queryClient.getQueryData<{ products: Listing[] }>(similarKey)?.products[0],
        ).toMatchObject({ userState: { watchlist: { watching: true } } });
        expect(watching(queryClient.getQueryData<Listing>(detailKey) as Listing)).toBe(true);
    });

    it("keeps untouched caches and listings referentially stable", () => {
        const pages = queryClient.getQueryData(pagesKey);
        const list = queryClient.getQueryData<unknown[]>(listKey);

        patchListingUserState(
            queryClient,
            { productListingId: "listing-2" },
            withWatchlistState({ watching: true }),
        );

        expect(queryClient.getQueryData(pagesKey)).toBe(pages);
        expect(queryClient.getQueryData<unknown[]>(listKey)?.[0]).toBe(list?.[0]);
    });

    it("ignores queries outside the listing namespace", () => {
        const unrelated = { products: [listing("listing-1")] };
        queryClient.setQueryData(["publicCatalog"], unrelated);

        patchListingUserState(queryClient, "allListings", withWatchlistState({ watching: true }));

        expect(queryClient.getQueryData(["publicCatalog"])).toBe(unrelated);
    });

    it("leaves caches partitioned to another viewer untouched", () => {
        const otherViewerKey = productListingQueryKeys.watchlist({
            ...context,
            viewerCacheKey: "user-2",
        });
        const ownKey = productListingQueryKeys.watchlist({ ...context, viewerCacheKey: "user-1" });
        const other = { pages: [{ products: [listing("listing-1")] }], pageParams: [undefined] };
        queryClient.setQueryData(otherViewerKey, other);
        queryClient.setQueryData(ownKey, other);

        patchListingUserState(
            queryClient,
            { productListingId: "listing-1" },
            withWatchlistState({ watching: true }),
            "user-1",
        );

        expect(queryClient.getQueryData(otherViewerKey)).toBe(other);
        expect(queryClient.getQueryData(ownKey)).not.toBe(other);
    });

    it("removes seen notification IDs and keeps each shape's unread flag", () => {
        queryClient.setQueryData(listKey, [
            listing("listing-1", userState({ unseen: ["n-1", "n-2"] })),
        ]);
        queryClient.setQueryData(detailKey, {
            item: { productListingId: "listing-1" },
            userState: { ...userState(), notification: { unseenNotificationIds: ["n-1"] } },
        });

        patchListingUserState(
            queryClient,
            "allListings",
            withoutUnseenNotifications(new Set(["n-1"])),
        );

        expect(
            queryClient.getQueryData<{ userState: unknown }[]>(listKey)?.[0].userState,
        ).toMatchObject({
            notification: { unseenNotificationIds: ["n-2"], hasUnseenNotification: true },
        });
        expect(
            queryClient.getQueryData<{ userState: { notification: object } }>(detailKey)?.userState
                .notification,
        ).toEqual({ unseenNotificationIds: [] });

        patchListingUserState(queryClient, "allListings", withoutUnseenNotifications(undefined));
        expect(
            queryClient.getQueryData<{ userState: unknown }[]>(listKey)?.[0].userState,
        ).toMatchObject({
            notification: { unseenNotificationIds: [], hasUnseenNotification: false },
        });
    });

    it("applies saved-search updates only to listings matched by that filter", () => {
        queryClient.setQueryData(listKey, [
            listing("listing-1", userState({ filterId: "filter-1" })),
            listing("listing-2", userState({ filterId: "filter-2" })),
        ]);

        patchListingUserState(
            queryClient,
            "allListings",
            withSearchFilterMatchFeedback("filter-1", true),
        );
        patchListingUserState(queryClient, "allListings", withoutSearchFilterMatch("filter-2"));

        const [first, second] =
            queryClient.getQueryData<{ userState: { searchFilter: object } }[]>(listKey) ?? [];
        expect(first.userState.searchFilter).toMatchObject({ matched: true, matchFeedback: true });
        expect(second.userState.searchFilter).toEqual({ matched: false, hidden: false });
    });

    it("removes a listing only from the given queries", () => {
        removeListingFromQueries(queryClient, pagesKey, "listing-1");

        expect(
            queryClient.getQueryData<{ pages: { products: unknown[] }[] }>(pagesKey)?.pages[0]
                .products,
        ).toEqual([]);
        expect(queryClient.getQueryData<unknown[]>(listKey)).toHaveLength(2);
    });

    it("invalidates every listing query except other viewers' partitions", async () => {
        const otherViewerKey = productListingQueryKeys.watchlist({
            ...context,
            viewerCacheKey: "user-2",
        });
        queryClient.setQueryData(otherViewerKey, []);

        await invalidateListingQueries(queryClient, "user-1");

        expect(queryClient.getQueryState(pagesKey)?.isInvalidated).toBe(true);
        expect(queryClient.getQueryState(detailKey)?.isInvalidated).toBe(true);
        expect(queryClient.getQueryState(otherViewerKey)?.isInvalidated).toBe(false);
    });
});
