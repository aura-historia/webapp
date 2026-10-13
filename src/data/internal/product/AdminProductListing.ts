import type {
    AdminProductListingAuction as AdminProductListingAuctionData,
    AdminProductListingDetails,
    AdminProductListingMutation as AdminProductListingMutationData,
    AdminProductListingPage as AdminProductListingPageData,
    AdminProductListingSummary as AdminProductListingSummaryData,
    LocalizedTextData,
    UpdateAdminProductListing,
} from "@/client";
import {
    type LISTING_AVAILABILITIES,
    type ListingAvailability,
    type ListingLifecycle,
    type ListingPrice,
    type ListingPriceEstimate,
    mapListingAvailability,
    mapListingLifecycle,
    mapListingPrice,
    mapListingPriceEstimate,
} from "@/data/internal/product/ProductListingDomain.ts";
import {
    mapProductListingSource,
    type ProductListingSource,
} from "@/data/internal/product/ProductListingSource.ts";

/** Original source text in its declared language; never a translation. */
export type AdminProductListingText = {
    readonly text: string;
    readonly language: string;
};

/**
 * Authoritative administration projection of a listing, including retained withdrawn listings.
 * Prices and estimates keep their source currency; there is no display conversion.
 */
export type AdminProductListingSummary = {
    readonly productListingId: string;
    readonly productListingTitleSlugId: string;
    readonly source: ProductListingSource;
    /** Unique only within `source`. */
    readonly sourceListingId: string;
    readonly title: AdminProductListingText | null;
    readonly price: ListingPrice | null;
    readonly priceEstimateMin: ListingPriceEstimate | null;
    readonly priceEstimateMax: ListingPriceEstimate | null;
    readonly availability: ListingAvailability | null;
    readonly lifecycle: ListingLifecycle;
    readonly auctionId: string | null;
    readonly expectedVersion: number;
    readonly created: Date;
    readonly updated: Date;
};

/** Listing-owned Auction membership and lot facts; each fact may exist without an Auction ID. */
export type AdminProductListingAuction = {
    readonly auctionId: string | null;
    readonly lotNumber: string | null;
    readonly cataloguePosition: number | null;
    readonly biddingOpens: Date | null;
    readonly scheduledCloses: Date | null;
    readonly reportedClosedAt: Date | null;
};

export type AdminProductListingSaleObservation = {
    readonly observedAt: Date;
    readonly fxRateId: string;
};

export type AdminProductListingDetail = AdminProductListingSummary & {
    readonly description: AdminProductListingText | null;
    readonly url: string;
    /** Privileged canonical image URLs in source order; never preview them automatically. */
    readonly images: readonly string[];
    readonly auction: AdminProductListingAuction | null;
    readonly saleObservation: AdminProductListingSaleObservation | null;
};

export type AdminProductListingPage = {
    readonly items: readonly AdminProductListingSummary[];
    /** Opaque cursor; pass it back unchanged with the same filters, sort, order and size. */
    readonly searchAfter?: string;
};

export type AdminProductListingMutationOutcome = "CHANGED" | "UNCHANGED";

export type AdminProductListingMutationResult = {
    readonly productListingId: string;
    /** The version after the command; unchanged for an `UNCHANGED` outcome. */
    readonly expectedVersion: number;
    readonly outcome: AdminProductListingMutationOutcome;
};

export type AdminProductListingTimingPatch = {
    readonly biddingOpens?: Date | null;
    readonly scheduledCloses?: Date | null;
    readonly reportedClosedAt?: Date | null;
};

/** Omitted members keep their facts; `auctionId: null` detaches membership only. */
export type AdminProductListingAuctionPatch = {
    readonly auctionId?: string | null;
    readonly lotNumber?: string | null;
    readonly cataloguePosition?: number | null;
    readonly timing?: AdminProductListingTimingPatch;
};

/**
 * Editable facts only. Omission preserves, `null` clears price, an estimate or availability.
 * URL, images and the auction object are never null; `images: []` empties the collection.
 */
export type AdminProductListingPatch = {
    readonly price?: ListingPrice | null;
    readonly priceEstimateMin?: ListingPriceEstimate | null;
    readonly priceEstimateMax?: ListingPriceEstimate | null;
    readonly availability?: (typeof LISTING_AVAILABILITIES)[number] | null;
    readonly url?: string;
    readonly images?: readonly string[];
    readonly auction?: AdminProductListingAuctionPatch;
};

function mapText(text: LocalizedTextData | null): AdminProductListingText | null {
    return text === null ? null : { text: text.text, language: text.language };
}

function mapNullableDate(value: string | null): Date | null {
    return value === null ? null : new Date(value);
}

export function mapAdminProductListingSummary(
    data: AdminProductListingSummaryData,
): AdminProductListingSummary {
    return {
        productListingId: data.productListingId,
        productListingTitleSlugId: data.productListingTitleSlugId,
        source: mapProductListingSource(data.source),
        sourceListingId: data.sourceListingId,
        title: mapText(data.title),
        price: mapListingPrice(data.price) ?? null,
        priceEstimateMin: mapListingPriceEstimate(data.priceEstimateMin) ?? null,
        priceEstimateMax: mapListingPriceEstimate(data.priceEstimateMax) ?? null,
        availability: mapListingAvailability(data.availability),
        lifecycle: mapListingLifecycle(data.lifecycle),
        auctionId: data.auctionId,
        expectedVersion: data.expectedVersion,
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}

function mapAuction(
    data: AdminProductListingAuctionData | null,
): AdminProductListingAuction | null {
    if (data === null) return null;
    return {
        auctionId: data.auctionId,
        lotNumber: data.lotNumber,
        cataloguePosition: data.cataloguePosition,
        biddingOpens: mapNullableDate(data.timing.biddingOpens),
        scheduledCloses: mapNullableDate(data.timing.scheduledCloses),
        reportedClosedAt: mapNullableDate(data.timing.reportedClosedAt),
    };
}

export function mapAdminProductListingDetail(
    data: AdminProductListingDetails,
): AdminProductListingDetail {
    return {
        ...mapAdminProductListingSummary(data),
        description: mapText(data.description),
        url: data.url,
        images: [...data.images],
        auction: mapAuction(data.auction),
        saleObservation: data.saleObservation && {
            observedAt: new Date(data.saleObservation.observedAt),
            fxRateId: data.saleObservation.fxRateId,
        },
    };
}

/** The page reports no total; its `size` is only the returned item count. */
export function mapAdminProductListingPage(
    data: AdminProductListingPageData,
): AdminProductListingPage {
    return {
        items: data.items.map(mapAdminProductListingSummary),
        ...(data.searchAfter !== undefined && { searchAfter: data.searchAfter }),
    };
}

export function mapAdminProductListingMutation(
    data: AdminProductListingMutationData,
): AdminProductListingMutationResult {
    return {
        productListingId: data.productListingId,
        expectedVersion: data.expectedVersion,
        outcome: data.outcome,
    };
}

function mapTimingPatch(
    timing: AdminProductListingTimingPatch,
): NonNullable<NonNullable<UpdateAdminProductListing["auction"]>["timing"]> {
    const toInstant = (value: Date | null) => (value === null ? null : value.toISOString());
    return {
        ...(timing.biddingOpens !== undefined && {
            biddingOpens: toInstant(timing.biddingOpens),
        }),
        ...(timing.scheduledCloses !== undefined && {
            scheduledCloses: toInstant(timing.scheduledCloses),
        }),
        ...(timing.reportedClosedAt !== undefined && {
            reportedClosedAt: toInstant(timing.reportedClosedAt),
        }),
    };
}

function mapAuctionPatch(
    auction: AdminProductListingAuctionPatch,
): NonNullable<UpdateAdminProductListing["auction"]> {
    return {
        ...(auction.auctionId !== undefined && { auctionId: auction.auctionId }),
        ...(auction.lotNumber !== undefined && { lotNumber: auction.lotNumber }),
        ...(auction.cataloguePosition !== undefined && {
            cataloguePosition: auction.cataloguePosition,
        }),
        // An omitted or null container preserves every instant, so only changed instants are sent.
        ...(auction.timing !== undefined && { timing: mapTimingPatch(auction.timing) }),
    };
}

function mapPrice(price: ListingPrice | null): UpdateAdminProductListing["price"] {
    if (price === null) return null;
    if (price.type === "ON_REQUEST") return { type: "ON_REQUEST" };
    return { type: "MONETARY", currency: price.currency, amount: price.amount };
}

function mapEstimate(estimate: ListingPriceEstimate | null) {
    return estimate === null ? null : { currency: estimate.currency, amount: estimate.amount };
}

/**
 * Builds the PATCH body member by member. Omitted members are absent from the body, so the
 * backend keeps them; the detail DTO is never round-tripped.
 */
export function mapToBackendAdminProductListingPatch(
    patch: AdminProductListingPatch,
    expectedVersion: number,
): UpdateAdminProductListing {
    return {
        expectedVersion,
        ...(patch.price !== undefined && { price: mapPrice(patch.price) }),
        ...(patch.priceEstimateMin !== undefined && {
            priceEstimateMin: mapEstimate(patch.priceEstimateMin),
        }),
        ...(patch.priceEstimateMax !== undefined && {
            priceEstimateMax: mapEstimate(patch.priceEstimateMax),
        }),
        ...(patch.availability !== undefined && { availability: patch.availability }),
        ...(patch.url !== undefined && { url: patch.url }),
        ...(patch.images !== undefined && { images: [...patch.images] }),
        ...(patch.auction !== undefined && { auction: mapAuctionPatch(patch.auction) }),
    };
}
