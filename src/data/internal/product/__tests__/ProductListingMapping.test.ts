import type {
    PersonalizedProductListingDetailsData,
    PersonalizedProductListingSummaryData,
    ProductListingCollectionDetailsData,
    ProductListingDetailsData,
    ProductListingSummaryData,
} from "@/client";
import { describe, expect, it } from "vitest";
import { SENSITIVE_CONTENT_CATEGORIES } from "@/test/fixtures.ts";
import { isRestrictedImage, type ProductImage } from "../ProductImageData.ts";
import {
    mapPersonalizedProductListingDetails,
    mapPersonalizedProductListingSummary,
} from "../ProductListing.ts";
import { mapToProductListingDetail } from "../ProductListingDetail.ts";

const source = {
    listingSourceId: "ls_opaque:01",
    name: "Atelier",
    slugId: "source-slug",
    operator: { name: "Atelier Operator", partner: false },
};
const baseSummary: ProductListingSummaryData = {
    productListingId: "plist_opaque:01",
    eventId: "evt_opaque:01",
    source,
    sourceListingId: "vendor/item/01",
    title: { localized: { text: "Silver bowl", language: "en" } },
    displayPrice: { type: "MONETARY", amount: 1099, currency: "USD" },
    priceValuation: { type: "CURRENT", fxRateId: "fx_01", capturedAt: "2026-09-01T00:00:00Z" },
    availability: "AVAILABLE",
    lifecycle: "ACTIVE",
    url: "https://example.com/item",
    viewUrl: "https://example.com/view",
    image: { url: "https://example.com/image.jpg" },
    updated: "2026-09-01T00:00:00Z",
};

const baseDetails: ProductListingDetailsData = {
    productListingId: "plist_opaque:01",
    eventId: "evt_opaque:01",
    source,
    sourceListingId: "vendor/item/01",
    title: { localized: { text: "Silver bowl", language: "en" } },
    pricing: {
        source: {
            price: { type: "MONETARY", amount: 1200, currency: "GBP" },
            priceEstimateMin: { amount: 800, currency: "GBP" },
            priceEstimateMax: { amount: 1600, currency: "GBP" },
        },
        display: {
            price: { type: "MONETARY", amount: 1099, currency: "USD" },
            priceEstimateMin: { amount: 700, currency: "USD" },
            priceEstimateMax: { amount: 1400, currency: "USD" },
        },
        valuation: { type: "CURRENT", fxRateId: "fx_01", capturedAt: "2026-09-01T00:00:00Z" },
    },
    availability: "AVAILABLE",
    lifecycle: "ACTIVE",
    url: "https://example.com/item",
    viewUrl: "https://example.com/view",
    images: [{ url: "https://example.com/image.jpg" }],
    created: "2026-08-01T00:00:00Z",
    updated: "2026-09-01T00:00:00Z",
};

function imageOf(listing: { readonly image?: ProductImage }): ProductImage {
    if (!listing.image) throw new Error("expected the listing to carry an image");
    return listing.image;
}

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
        expect(result.source).toEqual({
            listingSourceId: "ls_opaque:01",
            name: "Atelier",
            slugId: "source-slug",
            partner: false,
        });
        expect(result.price).toEqual(baseSummary.displayPrice);
        expect(result.priceValuation).toBe("CURRENT");
        expect(result.valuation).toEqual({
            type: "CURRENT",
            fxRateId: "fx_01",
            capturedAt: new Date("2026-09-01T00:00:00Z"),
        });
        expect(result.userState?.notification).toEqual({
            unseenNotificationIds: ["ntf_01", "ntf_02"],
            hasUnseenNotification: true,
        });
        expect(result.userState?.contentVisibility?.showUnassessedOrSensitiveContent).toBe(false);
    });

    it("keeps redacted summary text, slug and image URLs absent without inventing values", () => {
        const summary: ProductListingSummaryData = {
            ...baseSummary,
            productListingTitleSlugId: undefined,
            title: undefined,
            displayPrice: undefined,
            availability: undefined,
            image: {},
        };
        const result = mapPersonalizedProductListingSummary({ item: summary }, "en");

        expect(result.title).toBeUndefined();
        expect(result.productListingTitleSlugId).toBeUndefined();
        expect(result.price).toBeUndefined();
        expect(result.availability).toBeNull();
        expect(result.contentPolicy).toBeUndefined();
        expect(result.image).toEqual({ url: undefined, prohibitedContentType: "UNKNOWN" });
    });

    it.each(SENSITIVE_CONTENT_CATEGORIES)(
        "maps a %s summary assessment and hides its images without the preference",
        (category) => {
            const result = mapPersonalizedProductListingSummary(
                {
                    item: {
                        ...baseSummary,
                        contentPolicy: { decision: "REQUIRES_CONSENT", category },
                    },
                },
                "en",
            );

            expect(result.contentPolicy).toEqual({ decision: "REQUIRES_CONSENT", category });
            expect(result.image?.prohibitedContentType).toBe(category);
            expect(isRestrictedImage(imageOf(result), false)).toBe(true);
            expect(isRestrictedImage(imageOf(result), true)).toBe(false);
        },
    );

    it.each(SENSITIVE_CONTENT_CATEGORIES)(
        "maps a %s detail assessment and hides its images without the preference",
        (category) => {
            const result = mapToProductListingDetail(
                personalized({
                    ...baseDetails,
                    contentPolicy: { decision: "REQUIRES_CONSENT", category },
                }),
                "en-US",
            );

            expect(result.contentPolicy).toEqual({ decision: "REQUIRES_CONSENT", category });
            expect(result.images[0].prohibitedContentType).toBe(category);
            expect(isRestrictedImage(result.images[0], false)).toBe(true);
            expect(isRestrictedImage(result.images[0], true)).toBe(false);
        },
    );

    it("keeps images hidden for a category this client does not know", () => {
        const contentPolicy = {
            decision: "REQUIRES_CONSENT",
            category: "FUTURE_CATEGORY",
        } as unknown as ProductListingSummaryData["contentPolicy"];
        const result = mapPersonalizedProductListingSummary(
            { item: { ...baseSummary, contentPolicy } },
            "en",
        );

        expect(result.contentPolicy).toEqual(contentPolicy);
        expect(isRestrictedImage(imageOf(result), false)).toBe(true);
        expect(isRestrictedImage(imageOf(result), true)).toBe(false);
    });

    it("shows images of an allowed listing without the preference", () => {
        const result = mapPersonalizedProductListingSummary(
            { item: { ...baseSummary, contentPolicy: { decision: "ALLOWED" } } },
            "en",
        );

        expect(result.contentPolicy).toEqual({ decision: "ALLOWED" });
        expect(isRestrictedImage(imageOf(result), false)).toBe(false);
    });

    it("leaves the image absent when a summary omits it for a listing without images", () => {
        const { image: _image, ...withoutImage } = baseSummary;
        const result = mapPersonalizedProductListingSummary({ item: withoutImage }, "en");

        expect(result.image).toBeUndefined();
    });

    it("maps the single image of a collection detail and leaves it absent when omitted", () => {
        const { images: _images, shipping: _shipping, ...rest } = baseDetails;
        const collectionItem: ProductListingCollectionDetailsData = {
            ...rest,
            image: { url: "https://example.com/first.jpg" },
            contentPolicy: { decision: "ALLOWED" },
        };

        expect(mapPersonalizedProductListingDetails({ item: collectionItem }, "en").image).toEqual({
            url: new URL("https://example.com/first.jpg"),
            prohibitedContentType: "NONE",
        });

        const { image: _image, ...withoutImage } = collectionItem;
        expect(
            mapPersonalizedProductListingDetails({ item: withoutImage }, "en").image,
        ).toBeUndefined();
    });

    it("keeps ON_REQUEST distinct from missing price", () => {
        const onRequest = mapPersonalizedProductListingSummary(
            { item: { ...baseSummary, displayPrice: { type: "ON_REQUEST" } } },
            "en",
        );
        const missing = mapPersonalizedProductListingSummary(
            { item: { ...baseSummary, displayPrice: undefined } },
            "en",
        );

        expect(onRequest.price).toEqual({ type: "ON_REQUEST" });
        expect(onRequest.formattedPrice).toBeUndefined();
        expect(missing.price).toBeUndefined();
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
            observedAt: new Date("2026-08-30T00:00:00Z"),
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
        ).toBe("UNKNOWN");
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
        const details: PersonalizedProductListingDetailsData = personalized({
            ...baseDetails,
            contentPolicy: { decision: "REQUIRES_CONSENT", category: "NAZI_GERMANY" },
        });
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
        expect(result.pricing.source.priceEstimateMin).toEqual({ amount: 800, currency: "GBP" });
        expect(result.pricing.source.priceEstimateMax).toEqual({ amount: 1600, currency: "GBP" });
        expect(result.pricing.display.priceEstimateMin).toEqual({ amount: 700, currency: "USD" });
        expect(result.pricing.display.priceEstimateMax).toEqual({ amount: 1400, currency: "USD" });
        expect(result.priceValuation).toBe("CURRENT");
        expect(result.valuation).toEqual({
            type: "CURRENT",
            fxRateId: "fx_01",
            capturedAt: new Date("2026-09-01T00:00:00Z"),
        });
        expect(result.contentPolicy).toEqual({
            decision: "REQUIRES_CONSENT",
            category: "NAZI_GERMANY",
        });
        expect(result.auction).toBeNull();
        expect(result.lot).toBeNull();
    });

    it("shows the localized title, not the original text", () => {
        const details: PersonalizedProductListingDetailsData = personalized({
            ...baseDetails,
            title: {
                original: { text: "Antique Imari charger", language: "en" },
                localized: { text: "Antike Imari-Platte", language: "de" },
            },
        });

        const detail = mapToProductListingDetail(details, "de-DE");
        expect(detail.title).toBe("Antike Imari-Platte");
        expect(detail.translated).toBe(true);
        expect(mapPersonalizedProductListingDetails(details, "de-DE").title).toBe(
            "Antike Imari-Platte",
        );
    });

    it("shows a fallback-language title without claiming a translation", () => {
        const details: PersonalizedProductListingDetailsData = personalized({
            ...baseDetails,
            title: {
                original: { text: "Antique Imari charger", language: "en" },
                localized: { text: "Antique Imari charger", language: "en" },
            },
        });

        const detail = mapToProductListingDetail(details, "de-DE");
        expect(detail.title).toBe("Antique Imari charger");
        expect(detail.translated).toBe(false);
    });

    it("carries no description, even from a backend that still returns one", () => {
        const details = personalized({
            ...baseDetails,
            description: {
                original: { text: "Original description", language: "en" },
                localized: { text: "Lokalisierte Beschreibung", language: "de" },
            },
        } as unknown as ProductListingDetailsData);

        expect(mapToProductListingDetail(details, "de-DE")).not.toHaveProperty("description");
    });

    it("preserves SALE_OBSERVATION metadata, ON_REQUEST, and lot facts without a parent auction", () => {
        const details: ProductListingDetailsData = {
            ...baseDetails,
            title: undefined,
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
            lot: {
                lotNumber: "42",
                cataloguePosition: 7,
            },
        };
        const result = mapToProductListingDetail({ item: details }, "en");

        expect(result.title).toBeUndefined();
        expect(result.price).toEqual({ type: "ON_REQUEST" });
        expect(result.displayPrice).toBeUndefined();
        expect(result.priceValuation).toBe("SALE_OBSERVATION");
        expect(result.valuation).toEqual({
            type: "SALE_OBSERVATION",
            fxRateId: "fx_sale",
            capturedAt: new Date("2026-08-31T00:00:00Z"),
            observedAt: new Date("2026-08-30T00:00:00Z"),
        });
        expect(result.auction).toBeNull();
        expect(result.lot).toEqual({
            lotNumber: "42",
            cataloguePosition: 7,
            biddingOpens: null,
            scheduledCloses: null,
            reportedClosedAt: null,
        });
    });

    it("preserves a parent auction and nullable lot facts without deriving schedule values", () => {
        const details: ProductListingDetailsData = {
            ...baseDetails,
            auction: {
                auctionId: "auc_opaque:01",
                schedule: {
                    biddingOpens: "2026-09-01T00:00:00Z",
                },
            },
        };
        const result = mapToProductListingDetail({ item: details }, "en");

        expect(result.auction).toEqual({
            ...details.auction,
            schedule: {
                biddingOpens: new Date("2026-09-01T00:00:00Z"),
                liveStarts: null,
                lotsBeginClosing: null,
                scheduledEnd: null,
            },
        });
        expect(result.lot).toBeNull();
    });

    it("preserves a parent auction and listing-owned lot facts independently", () => {
        const details: ProductListingDetailsData = {
            ...baseDetails,
            auction: {
                auctionId: "auc_opaque:01",
                schedule: {},
            },
            lot: {
                lotNumber: "42",
                biddingOpens: "2026-09-02T10:00:00Z",
            },
        };
        const result = mapToProductListingDetail({ item: details }, "en");

        expect(result.auction?.auctionId).toBe("auc_opaque:01");
        expect(result.lot).toEqual({
            lotNumber: "42",
            cataloguePosition: null,
            biddingOpens: new Date("2026-09-02T10:00:00Z"),
            scheduledCloses: null,
            reportedClosedAt: null,
        });
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

    it("formats new display currencies from summary and detail payloads with their own exponent", () => {
        const normalise = (value?: string) => value?.replace(/[\u00a0\u202f]/g, " ");
        const krw = mapPersonalizedProductListingSummary(
            personalized({
                ...baseSummary,
                displayPrice: { type: "MONETARY", amount: 12345, currency: "KRW" },
            }),
            "en-US",
        );
        expect(krw.price).toEqual({ type: "MONETARY", amount: 12345, currency: "KRW" });
        expect(normalise(krw.formattedPrice)).toBe("₩12,345");

        const sek = mapToProductListingDetail(
            personalized({
                ...baseDetails,
                pricing: {
                    ...baseDetails.pricing,
                    display: { price: { type: "MONETARY", amount: 12345, currency: "SEK" } },
                },
            }),
            "en-US",
        );
        expect(normalise(sek.displayPrice)).toBe("SEK 123.45");
    });

    it("keeps an unavailable historical display conversion absent instead of using the source price", () => {
        // A sold listing requested in SEK whose sale-time FX snapshot cannot produce a display amount.
        const details: ProductListingDetailsData = {
            ...baseDetails,
            pricing: {
                source: { price: { type: "MONETARY", amount: 250000, currency: "EUR" } },
                display: {},
                valuation: {
                    type: "SALE_OBSERVATION",
                    fxRateId: "fx_sale",
                    capturedAt: "2026-08-31T00:00:00Z",
                    observedAt: "2026-08-30T00:00:00Z",
                },
            },
        };
        const result = mapToProductListingDetail({ item: details }, "de");

        expect(result.pricing.source.price).toEqual({
            type: "MONETARY",
            amount: 250000,
            currency: "EUR",
        });
        expect(result.pricing.display.price).toBeUndefined();
        expect(result.price).toBeUndefined();
        expect(result.displayPrice).toBeUndefined();
        expect(result.priceValuation).toBe("SALE_OBSERVATION");
    });
});

describe("listing geography", () => {
    it("maps advertised-inventory geography from geographic search summaries", () => {
        const result = mapPersonalizedProductListingSummary(
            personalized({
                ...baseSummary,
                geography: {
                    locationId: "ploc_opaque:01",
                    basis: "SOURCE_DEFAULT_DERIVED",
                    referenceRelease: "iso-codes-4.20.1",
                    country: "DE",
                    subdivision: "DE-BY",
                    point: { latitude: 0, longitude: 0 },
                    precision: "STREET",
                    distanceKm: 12.34,
                },
            }),
            "en",
        );
        expect(result.geography).toEqual({
            locationId: "ploc_opaque:01",
            basis: "SOURCE_DEFAULT_DERIVED",
            referenceRelease: "iso-codes-4.20.1",
            country: "DE",
            subdivision: "DE-BY",
            position: { point: { latitude: 0, longitude: 0 }, precision: "STREET" },
            distanceKm: 12.34,
        });
    });

    it("keeps missing geography absent", () => {
        expect(
            mapPersonalizedProductListingSummary(personalized(baseSummary), "en"),
        ).not.toHaveProperty("geography");
    });
});
