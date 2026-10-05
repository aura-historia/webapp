import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import type { ProductListingUserState } from "@/data/internal/product/UserProductData.ts";
import type { PublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";

export function makeProductListingUserState(
    overrides: Partial<ProductListingUserState> = {},
): ProductListingUserState {
    return {
        watchlist: { watching: false, notifications: false },
        contentVisibility: { showUnassessedOrSensitiveContent: false },
        notification: { unseenNotificationIds: [], hasUnseenNotification: false },
        searchFilter: { matched: false, hidden: false },
        ...overrides,
    };
}

export function makeProductListing(overrides: Partial<ProductListing> = {}): ProductListing {
    return {
        productListingId: "pl_01TESTLISTING",
        productListingTitleSlugId: "antique-chair-listing-1",
        source: {
            listingSourceId: "ls_01TESTSOURCE",
            slugId: "antique-store",
            name: "Antique Store",
        },
        sourceListingId: "chair-1",
        title: "Antique Chair",
        price: { type: "MONETARY", amount: 25000, currency: "EUR" },
        formattedPrice: "250,00 €",
        priceValuation: "CURRENT",
        valuation: {
            type: "CURRENT",
            fxRateId: "fxr_01TESTFX",
            capturedAt: new Date("2024-01-01T00:00:00Z"),
        },
        availability: "IN_STOCK",
        lifecycle: "ACTIVE",
        url: new URL("https://example.com/chair"),
        images: [],
        contentPolicy: { decision: "ALLOWED" },
        updated: new Date("2024-01-01T00:00:00Z"),
        userState: makeProductListingUserState(),
        ...overrides,
    };
}

export function makeProductListingDetail(
    overrides: Partial<ProductListingDetail> = {},
): ProductListingDetail {
    const listing = makeProductListing();
    return {
        ...listing,
        displayPrice: listing.formattedPrice,
        pricing: {
            source: { price: listing.price },
            display: { price: listing.price },
            valuation: listing.valuation,
        },
        auction: null,
        lot: null,
        created: new Date("2024-01-01T00:00:00Z"),
        ...overrides,
    };
}

export function makePublicListingSource(
    overrides: Partial<PublicListingSource> = {},
): PublicListingSource {
    return {
        listingSourceId: "ls_01TESTSOURCE",
        slugId: "antique-store",
        name: "Antique Store",
        operatorName: "Antique Operator",
        url: "https://example.com",
        ...overrides,
    };
}
