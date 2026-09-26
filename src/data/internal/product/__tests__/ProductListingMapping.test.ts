import type {
    PersonalizedProductListingDetailsData,
    PersonalizedProductListingSummaryData,
    ProductListingDetailsData,
    ProductListingSummaryData,
} from "@/client";
import { describe, expect, it } from "vitest";
import { mapPersonalizedProductListingSummary } from "../ProductListing.ts";
import { mapToProductListingDetail } from "../ProductListingDetail.ts";

const source = { listingSourceId: "ls_opaque:01", name: "Atelier", slugId: "source-slug" };
const baseSummary: ProductListingSummaryData = {
    productListingId: "plist_opaque:01",
    eventId: "evt_opaque:01",
    source,
    sourceListingId: "vendor/item/01",
    title: { text: "Silver bowl", language: "en" },
    displayPrice: { type: "MONETARY", amount: 1099, currency: "USD" },
    priceValuation: { type: "CURRENT", fxRateId: "fx_01", capturedAt: "2026-09-01T00:00:00Z" },
    availability: "AVAILABLE",
    lifecycle: "ACTIVE",
    url: "https://example.com/item",
    viewUrl: "https://example.com/view",
    images: [{ url: "https://example.com/image.jpg" }],
    updated: "2026-09-01T00:00:00Z",
};

const baseDetails: ProductListingDetailsData = {
    productListingId: "plist_opaque:01",
    eventId: "evt_opaque:01",
    source,
    sourceListingId: "vendor/item/01",
    title: { text: "Silver bowl", language: "en" },
    pricing: {
        source: { price: { type: "MONETARY", amount: 1200, currency: "GBP" } },
        display: { price: { type: "MONETARY", amount: 1099, currency: "USD" } },
        valuation: { type: "CURRENT", fxRateId: "fx_01", capturedAt: "2026-09-01T00:00:00Z" },
    },
    availability: "AVAILABLE",
    lifecycle: "ACTIVE",
    url: "https://example.com/item",
    viewUrl: "https://example.com/view",
    images: [{ url: "https://example.com/image.jpg" }],
    auction: null,
    lot: null,
    created: "2026-08-01T00:00:00Z",
    updated: "2026-09-01T00:00:00Z",
};

const personalized = <TItem>(item: TItem) => ({
    item,
    userState: {
        watchlist: { watching: true, notifications: true },
        contentVisibility: { showUnassessedOrSensitiveContent: false },
        notification: { unseenNotificationIds: ["ntf_01", "ntf_02"] },
        searchFilter: { matched: false, hidden: false },
    },
});

describe("ProductListing mappers", () => {
    it("maps opaque identity, nested source, summary price metadata and viewer state", () => {
        const data: PersonalizedProductListingSummaryData = personalized(baseSummary);
        const result = mapPersonalizedProductListingSummary(data, "en-US");

        expect(result.productListingId).toBe("plist_opaque:01");
        expect(result.sourceListingId).toBe("vendor/item/01");
        expect(result.source).toEqual(source);
        expect(result.price).toEqual(baseSummary.displayPrice);
        expect(result.priceValuation).toBe("CURRENT");
        expect(result.valuation).toEqual(baseSummary.priceValuation);
        expect(result.userState?.notification).toEqual({
            unseenNotificationIds: ["ntf_01", "ntf_02"],
            hasUnseenNotification: true,
        });
        expect(result.userState?.contentVisibility.showUnassessedOrSensitiveContent).toBe(false);
    });

    it("keeps redacted summary text, slug and image URLs absent without inventing values", () => {
        const summary: ProductListingSummaryData = {
            ...baseSummary,
            productListingTitleSlugId: undefined,
            title: null,
            displayPrice: null,
            availability: null,
            images: [{ url: null }],
        };
        const result = mapPersonalizedProductListingSummary({ item: summary }, "en");

        expect(result.title).toBeUndefined();
        expect(result.productListingTitleSlugId).toBeUndefined();
        expect(result.price).toBeNull();
        expect(result.availability).toBeNull();
        expect(result.images).toEqual([{ url: undefined, prohibitedContentType: "UNKNOWN" }]);
    });

    it("keeps ON_REQUEST distinct from missing price", () => {
        const onRequest = mapPersonalizedProductListingSummary(
            { item: { ...baseSummary, displayPrice: { type: "ON_REQUEST" } } },
            "en",
        );
        const missing = mapPersonalizedProductListingSummary(
            { item: { ...baseSummary, displayPrice: null } },
            "en",
        );

        expect(onRequest.price).toEqual({ type: "ON_REQUEST" });
        expect(onRequest.formattedPrice).toBeUndefined();
        expect(missing.price).toBeNull();
        expect(missing.formattedPrice).toBeUndefined();
    });

    it("preserves a summary SALE_OBSERVATION valuation", () => {
        const result = mapPersonalizedProductListingSummary(
            {
                item: {
                    ...baseSummary,
                    priceValuation: {
                        type: "SALE_OBSERVATION",
                        fxRateId: "fx_sale",
                        observedAt: "2026-08-30T00:00:00Z",
                    },
                },
            },
            "en",
        );

        expect(result.priceValuation).toBe("SALE_OBSERVATION");
        expect(result.valuation).toEqual({
            type: "SALE_OBSERVATION",
            fxRateId: "fx_sale",
            observedAt: "2026-08-30T00:00:00Z",
        });
    });

    it("preserves all availability values and unknown values independently of lifecycle", () => {
        const availabilities = [
            "AVAILABLE",
            "IN_STOCK",
            "LIMITED_AVAILABILITY",
            "BACK_ORDER",
            "MADE_TO_ORDER",
            "PRE_ORDER",
            "PRE_SALE",
            "UNAVAILABLE",
            "RESERVED",
            "OUT_OF_STOCK",
            "SOLD_OUT",
        ] as const;

        for (const availability of availabilities) {
            const result = mapPersonalizedProductListingSummary(
                { item: { ...baseSummary, availability, lifecycle: "WITHDRAWN" } },
                "en",
            );
            expect(result.availability).toBe(availability);
            expect(result.lifecycle).toBe("WITHDRAWN");
        }

        const unknown = "FUTURE_VALUE" as ProductListingSummaryData["availability"];
        expect(
            mapPersonalizedProductListingSummary(
                { item: { ...baseSummary, availability: unknown } },
                "en",
            ).availability,
        ).toBe(unknown);
    });

    it("keeps summary auctionId as an identifier without hydrating auction metadata", () => {
        const result = mapPersonalizedProductListingSummary(
            { item: { ...baseSummary, auctionId: "auc_opaque:01" } },
            "en",
        );

        expect(result.auctionId).toBe("auc_opaque:01");
        expect("auction" in result).toBe(false);
    });

    it("maps detail source and display prices plus CURRENT valuation metadata", () => {
        const details: PersonalizedProductListingDetailsData = personalized(baseDetails);
        const result = mapToProductListingDetail(details, "en-US");

        expect(result.pricing.source.price).toEqual({
            type: "MONETARY",
            amount: 1200,
            currency: "GBP",
        });
        expect(result.pricing.display.price).toEqual({
            type: "MONETARY",
            amount: 1099,
            currency: "USD",
        });
        expect(result.priceValuation).toBe("CURRENT");
        expect(result.valuation).toEqual(baseDetails.pricing.valuation);
        expect(result.auction).toBeNull();
        expect(result.lot).toBeNull();
    });

    it("preserves SALE_OBSERVATION metadata, ON_REQUEST, and lot facts without a parent auction", () => {
        const details: ProductListingDetailsData = {
            ...baseDetails,
            productTitle: null,
            title: null,
            description: null,
            pricing: {
                source: { price: { type: "ON_REQUEST" } },
                display: { price: { type: "ON_REQUEST" } },
                valuation: {
                    type: "SALE_OBSERVATION",
                    fxRateId: "fx_sale",
                    capturedAt: "2026-08-31T00:00:00Z",
                    observedAt: "2026-08-30T00:00:00Z",
                },
            },
            auction: null,
            lot: {
                lotNumber: "42",
                cataloguePosition: 7,
                biddingOpens: null,
                scheduledCloses: null,
                reportedClosedAt: null,
            },
        };
        const result = mapToProductListingDetail({ item: details }, "en");

        expect(result.title).toBeUndefined();
        expect(result.description).toBeUndefined();
        expect(result.price).toEqual({ type: "ON_REQUEST" });
        expect(result.displayPrice).toBeUndefined();
        expect(result.priceValuation).toBe("SALE_OBSERVATION");
        expect(result.valuation).toEqual(details.pricing.valuation);
        expect(result.auction).toBeNull();
        expect(result.lot).toEqual(details.lot);
    });

    it("preserves a parent auction and nullable lot facts without deriving schedule values", () => {
        const details: ProductListingDetailsData = {
            ...baseDetails,
            auction: {
                auctionId: "auc_opaque:01",
                schedule: {
                    biddingOpens: "2026-09-01T00:00:00Z",
                    liveStarts: null,
                    lotsBeginClosing: null,
                    scheduledEnd: null,
                },
            },
            lot: null,
        };
        const result = mapToProductListingDetail({ item: details }, "en");

        expect(result.auction).toEqual(details.auction);
        expect(result.lot).toBeNull();
    });

    it("preserves a parent auction and listing-owned lot facts independently", () => {
        const details: ProductListingDetailsData = {
            ...baseDetails,
            auction: {
                auctionId: "auc_opaque:01",
                schedule: {
                    biddingOpens: null,
                    liveStarts: null,
                    lotsBeginClosing: null,
                    scheduledEnd: null,
                },
            },
            lot: {
                lotNumber: "42",
                cataloguePosition: null,
                biddingOpens: "2026-09-02T10:00:00Z",
                scheduledCloses: null,
                reportedClosedAt: null,
            },
        };
        const result = mapToProductListingDetail({ item: details }, "en");

        expect(result.auction?.auctionId).toBe("auc_opaque:01");
        expect(result.lot).toEqual(details.lot);
    });

    it("keeps missing detail prices distinct from ON_REQUEST", () => {
        const details: ProductListingDetailsData = {
            ...baseDetails,
            pricing: {
                source: {},
                display: {},
                valuation: {
                    type: "CURRENT",
                    fxRateId: "fx_01",
                    capturedAt: "2026-09-01T00:00:00Z",
                },
            },
        };
        const result = mapToProductListingDetail({ item: details }, "en");

        expect(result.pricing.source.price).toBeUndefined();
        expect(result.pricing.display.price).toBeUndefined();
        expect(result.price).toBeUndefined();
        expect(result.displayPrice).toBeUndefined();
    });
});
