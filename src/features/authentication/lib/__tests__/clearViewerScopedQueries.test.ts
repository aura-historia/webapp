import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { clearViewerScopedQueries } from "../clearViewerScopedQueries.ts";
import { productListingQueryKeys } from "@/data/internal/product/ProductListingQueryKeys.ts";

const listingContext = { language: "de", currency: "EUR" } as const;

describe("clearViewerScopedQueries", () => {
    it("removes viewer-scoped and personalized listing queries while keeping public queries", () => {
        const queryClient = new QueryClient();
        const viewerScopedQueryKeys = [
            ["oauthClient", "oc_test"],
            ["ownListingSources"],
            ["own-partnership-applications"],
            ["own-partnership-applications", "detail", "application-1"],
            ["admin", "partnership-applications", "detail", "application-1"],
            ["access-tokens"],
            productListingQueryKeys.watchlist({ ...listingContext, viewerCacheKey: "user-1" }),
            productListingQueryKeys.search({ term: "chair" }, listingContext),
            productListingQueryKeys.similar("listing-1", listingContext),
            productListingQueryKeys.dealer("dealer-1", "listing-1", listingContext),
            productListingQueryKeys.recentlyAdded(listingContext),
            productListingQueryKeys.source("source-1", 20, listingContext),
            productListingQueryKeys.savedSearchMatchesPage("filter-1", listingContext),
            productListingQueryKeys.savedSearchPreview({ term: "chair" }, listingContext),
            productListingQueryKeys.detailBySlug("chair", listingContext),
            ["getNotifications", "user-1"],
            ["userAccount", "user-1"],
            ["userSearchFilters", "user-1"],
            ["userSearchFilter", "filter-1"],
        ] as const;
        const publicQueryKey = ["publicCatalog"] as const;
        const publicDetailQueryKey = [{ _id: "getShopDetail" }, "shop-1"] as const;

        for (const queryKey of viewerScopedQueryKeys) {
            queryClient.setQueryData(queryKey, { viewerData: true });
        }
        queryClient.setQueryData(publicQueryKey, { publicData: true });
        queryClient.setQueryData(publicDetailQueryKey, { publicData: true });

        clearViewerScopedQueries(queryClient);

        for (const queryKey of viewerScopedQueryKeys) {
            expect(queryClient.getQueryData(queryKey)).toBeUndefined();
        }
        expect(queryClient.getQueryData(publicQueryKey)).toEqual({ publicData: true });
        expect(queryClient.getQueryData(publicDetailQueryKey)).toEqual({ publicData: true });
    });

    it("discards pending listing writes so they cannot overlay the next viewer's state", () => {
        const queryClient = new QueryClient();
        const mutationCache = queryClient.getMutationCache();
        const listingWrite = mutationCache.build(queryClient, {
            mutationKey: [...productListingQueryKeys.all, "watchlistMutation", "listing-1"],
        });
        const otherWrite = mutationCache.build(queryClient, { mutationKey: ["newsletter"] });

        clearViewerScopedQueries(queryClient);

        expect(mutationCache.getAll()).not.toContain(listingWrite);
        expect(mutationCache.getAll()).toContain(otherWrite);
    });

    it("cancels pending private requests so late responses cannot restore the previous viewer", async () => {
        const queryClient = new QueryClient();
        const queryKey = ["own-partnership-applications", "detail", "application-1"];
        let completeRequest!: (value: { privateEmail: string }) => void;
        let requestSignal!: AbortSignal;
        const request = queryClient
            .fetchQuery({
                queryKey,
                queryFn: ({ signal }) => {
                    requestSignal = signal;
                    return new Promise<{ privateEmail: string }>((resolve) => {
                        completeRequest = resolve;
                    });
                },
            })
            .catch(() => undefined);

        clearViewerScopedQueries(queryClient);
        expect(requestSignal.aborted).toBe(true);
        completeRequest({ privateEmail: "previous-viewer@example.com" });
        await request;
        expect(queryClient.getQueryData(queryKey)).toBeUndefined();
    });
});
