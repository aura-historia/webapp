import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { clearViewerScopedQueries } from "../clearViewerScopedQueries.ts";
import { simpleSearchProductListingsQueryKey } from "@/client/@tanstack/react-query.gen.ts";

describe("clearViewerScopedQueries", () => {
    it("removes viewer-scoped and personalized listing queries while keeping public queries", () => {
        const queryClient = new QueryClient();
        const viewerScopedQueryKeys = [
            ["watchlist", "user-1"],
            ["search", { term: "chair" }],
            ["similarProductListings", "listing-1"],
            ["dealerProducts", "dealer-1"],
            ["productListings", "recent"],
            ["sourceProductListings", "source-1"],
            ["searchFilterMatchedProducts", "filter-1"],
            ["searchFilterPreviewProducts", "filter-1"],
            ["getNotifications", "user-1"],
            ["userAccount", "user-1"],
            ["userSearchFilters", "user-1"],
            ["userSearchFilter", "filter-1"],
            [{ _id: "getProductListingByTitleSlug" }, "chair"],
            [{ _id: "getProductListing" }, "listing-1"],
            simpleSearchProductListingsQueryKey({
                query: {
                    sort: "created",
                    order: "desc",
                    size: 12,
                    language: "de",
                    currency: "EUR",
                },
            }),
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
});
