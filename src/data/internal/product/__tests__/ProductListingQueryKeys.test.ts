import { describe, expect, it } from "vitest";
import { getProductListingIdentity, productListingQueryKeys } from "../ProductListingQueryKeys.ts";

describe("ProductListing identity and query keys", () => {
    const context = { language: "en", currency: "EUR" } as const;

    it("preserves prefixed IDs as opaque strings", () => {
        expect(
            getProductListingIdentity({
                productListingId: "plist_opaque:01",
                listingSourceId: "ls_opaque:02",
                sourceListingId: "vendor/item/03",
            }),
        ).toEqual({
            productListingId: "plist_opaque:01",
            listingSourceId: "ls_opaque:02",
            sourceListingId: "vendor/item/03",
        });
    });

    it("places every listing query under one root", () => {
        const keys = [
            productListingQueryKeys.detailBySlug("vase", context),
            productListingQueryKeys.search({ q: "vase" }, context),
            productListingQueryKeys.recentlyAdded(context),
            productListingQueryKeys.similar("plist_01", context),
            productListingQueryKeys.dealer("ls_01", "plist_01", context),
            productListingQueryKeys.source("ls_01", 20, context),
            productListingQueryKeys.watchlist({ ...context, viewerCacheKey: "account-1" }),
            productListingQueryKeys.savedSearchMatchesPage("sf_01", context),
            productListingQueryKeys.savedSearchPreview({ q: "vase" }, context),
        ];

        for (const key of keys) {
            expect(key.slice(0, 1)).toEqual(productListingQueryKeys.all);
        }
    });

    it("isolates watchlist data by viewer cache key", () => {
        expect(productListingQueryKeys.watchlist(context)).not.toEqual(
            productListingQueryKeys.watchlist({ ...context, viewerCacheKey: "account-1" }),
        );
        expect(
            productListingQueryKeys.watchlist({ ...context, viewerCacheKey: "account-1" }),
        ).not.toEqual(
            productListingQueryKeys.watchlist({ ...context, viewerCacheKey: "account-2" }),
        );
        expect(
            productListingQueryKeys.watchlist({ ...context, viewerCacheKey: "account-1" }),
        ).toEqual([...productListingQueryKeys.watchlistOf("account-1"), "en", "EUR"]);
    });

    it("includes locale and currency in presentation keys", () => {
        expect(productListingQueryKeys.detailBySlug("vase", context)).not.toEqual(
            productListingQueryKeys.detailBySlug("vase", { ...context, language: "de" }),
        );
        expect(productListingQueryKeys.similar("plist_01", context)).not.toEqual(
            productListingQueryKeys.similar("plist_01", { ...context, currency: "USD" }),
        );
    });

    it("lets saved-search match pages be addressed by filter", () => {
        expect(
            productListingQueryKeys.savedSearchMatchesPage("sf_01", context).slice(0, 3),
        ).toEqual(productListingQueryKeys.savedSearchMatches("sf_01"));
    });
});
