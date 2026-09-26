import { describe, expect, it } from "vitest";
import { getProductListingIdentity, productListingQueryKeys } from "../ProductListingQueryKeys.ts";

describe("ProductListing identity and query keys", () => {
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

    it("isolates personalized listing data by viewer cache key", () => {
        const context = { language: "en", currency: "EUR" } as const;

        expect(productListingQueryKeys.detail("plist_01", context)).not.toEqual(
            productListingQueryKeys.detail("plist_01", { ...context, viewerCacheKey: "account-1" }),
        );
        expect(
            productListingQueryKeys.detail("plist_01", { ...context, viewerCacheKey: "account-1" }),
        ).not.toEqual(
            productListingQueryKeys.detail("plist_01", { ...context, viewerCacheKey: "account-2" }),
        );
    });

    it("includes locale and currency in presentation keys and separates history", () => {
        expect(
            productListingQueryKeys.summary("plist_01", { language: "en", currency: "EUR" }),
        ).not.toEqual(
            productListingQueryKeys.summary("plist_01", { language: "de", currency: "EUR" }),
        );
        expect(productListingQueryKeys.history("plist_01")).toEqual([
            "productListings",
            "history",
            "plist_01",
        ]);
    });
});
