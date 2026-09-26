import type {
    ProductListingHistoryChangeData,
    ProductListingHistoryEntryData,
    ProductListingAuctionFactsData,
    PriceData,
} from "@/client";
import {
    mapListingAvailability,
    mapListingPrice,
    mapListingPriceEstimate,
    type ListingAvailability,
    type ListingPrice,
    type ListingPriceEstimate,
} from "@/data/internal/product/ProductListingDomain.ts";

export type ListingAuctionFacts = {
    readonly auctionId?: string;
    readonly lotNumber: string | null;
    readonly cataloguePosition: number | null;
    readonly biddingOpens: Date | null;
    readonly scheduledCloses: Date | null;
    readonly reportedClosedAt: Date | null;
};

export type ProductListingDiscovery = {
    readonly listingSourceId: string;
    readonly sourceListingId: string;
    readonly title?: { readonly text: string; readonly language: string };
    readonly description?: { readonly text: string; readonly language: string };
    readonly pricing: {
        readonly price?: ListingPrice | null;
        readonly priceEstimateMin?: ListingPriceEstimate | null;
        readonly priceEstimateMax?: ListingPriceEstimate | null;
    };
    readonly availability: ListingAvailability | null;
    readonly url: string;
    readonly imageCount: number;
    readonly auction: ListingAuctionFacts | null;
};

export type ProductListingHistoryChange =
    | {
          readonly type: "MAIN_PRICE_CHANGED";
          readonly previous: ListingPrice | null;
          readonly current: ListingPrice | null;
      }
    | {
          readonly type: "MINIMUM_ESTIMATE_CHANGED" | "MAXIMUM_ESTIMATE_CHANGED";
          readonly previous: ListingPriceEstimate | null;
          readonly current: ListingPriceEstimate | null;
      }
    | {
          readonly type: "AVAILABILITY_CHANGED";
          readonly previous: ListingAvailability | null;
          readonly current: ListingAvailability | null;
      }
    | { readonly type: "URL_CHANGED"; readonly previous: string; readonly current: string }
    | {
          readonly type: "IMAGES_CHANGED";
          readonly previousCount: number;
          readonly currentCount: number;
      }
    | {
          readonly type: "AUCTION_CHANGED";
          readonly previous: ListingAuctionFacts | null;
          readonly current: ListingAuctionFacts | null;
      }
    | { readonly type: "WITHDRAWN"; readonly previousAvailability: ListingAvailability | null }
    | { readonly type: "RESTORED" }
    | {
          readonly type: "SALE_OBSERVED" | "SALE_OBSERVATION_RETRACTED";
          readonly observation: { readonly observedAt: Date; readonly fxRateId: string };
      }
    | { readonly type: "UNKNOWN"; readonly sourceType: string };

export type ProductListingHistoryPayload =
    | { readonly kind: "DISCOVERED"; readonly discovery: ProductListingDiscovery }
    | { readonly kind: "CHANGED"; readonly changes: readonly ProductListingHistoryChange[] }
    | { readonly kind: "UNKNOWN" };

export type ProductListingHistoryEntry = {
    readonly eventType: string;
    readonly productListingId: string;
    readonly eventId: string;
    readonly timestamp: Date;
    readonly payload: ProductListingHistoryPayload;
};

function mapMoney(value: PriceData | null): ListingPriceEstimate | null {
    return mapListingPriceEstimate(value) ?? null;
}

function mapAuction(value: ProductListingAuctionFactsData | null): ListingAuctionFacts | null {
    if (value === null) return null;
    return {
        auctionId: value.auctionId,
        lotNumber: value.lotNumber,
        cataloguePosition: value.cataloguePosition,
        biddingOpens: value.biddingOpens === null ? null : new Date(value.biddingOpens),
        scheduledCloses: value.scheduledCloses === null ? null : new Date(value.scheduledCloses),
        reportedClosedAt: value.reportedClosedAt === null ? null : new Date(value.reportedClosedAt),
    };
}

function mapChange(change: ProductListingHistoryChangeData): ProductListingHistoryChange {
    switch (change.type) {
        case "MAIN_PRICE_CHANGED":
            return {
                type: change.type,
                previous: mapListingPrice(change.previous) ?? null,
                current: mapListingPrice(change.current) ?? null,
            };
        case "MINIMUM_ESTIMATE_CHANGED":
        case "MAXIMUM_ESTIMATE_CHANGED":
            return {
                type: change.type,
                previous: mapMoney(change.previous),
                current: mapMoney(change.current),
            };
        case "AVAILABILITY_CHANGED":
            return {
                type: change.type,
                previous: mapListingAvailability(change.previous),
                current: mapListingAvailability(change.current),
            };
        case "URL_CHANGED":
            return { type: change.type, previous: change.previous, current: change.current };
        case "IMAGES_CHANGED":
            return {
                type: change.type,
                previousCount: change.previousCount,
                currentCount: change.currentCount,
            };
        case "AUCTION_CHANGED":
            return {
                type: change.type,
                previous: mapAuction(change.previous),
                current: mapAuction(change.current),
            };
        case "WITHDRAWN":
            return {
                type: change.type,
                previousAvailability: mapListingAvailability(change.previousAvailability),
            };
        case "RESTORED":
            return { type: change.type };
        case "SALE_OBSERVED":
        case "SALE_OBSERVATION_RETRACTED":
            return {
                type: change.type,
                observation: {
                    observedAt: new Date(change.observation.observedAt),
                    fxRateId: change.observation.fxRateId,
                },
            };
        default: {
            const sourceType = (change as { type?: unknown }).type;
            return { type: "UNKNOWN", sourceType: String(sourceType ?? "unknown") };
        }
    }
}

function mapDiscovery(
    data: Extract<ProductListingHistoryEntryData["payload"], { pricing: unknown }>,
): ProductListingDiscovery {
    return {
        listingSourceId: data.listingSourceId,
        sourceListingId: data.sourceListingId,
        title: data.title,
        description: data.description,
        pricing: {
            price: mapListingPrice(data.pricing.price ?? null) ?? null,
            priceEstimateMin: mapMoney(data.pricing.priceEstimateMin ?? null),
            priceEstimateMax: mapMoney(data.pricing.priceEstimateMax ?? null),
        },
        availability: mapListingAvailability(data.availability),
        url: data.url,
        imageCount: data.imageCount,
        auction: mapAuction(data.auction),
    };
}

export function mapProductListingHistory(
    entries: readonly ProductListingHistoryEntryData[],
): ProductListingHistoryEntry[] {
    return entries.map((entry) => {
        let payload: ProductListingHistoryPayload;
        if (entry.eventType === "PRODUCT_LISTING_DISCOVERED" && "pricing" in entry.payload) {
            payload = { kind: "DISCOVERED", discovery: mapDiscovery(entry.payload) };
        } else if (entry.eventType === "PRODUCT_LISTING_CHANGED" && "changes" in entry.payload) {
            payload = { kind: "CHANGED", changes: entry.payload.changes.map(mapChange) };
        } else {
            payload = { kind: "UNKNOWN" };
        }

        return {
            eventType: entry.eventType,
            productListingId: entry.productListingId,
            eventId: entry.eventId,
            timestamp: new Date(entry.timestamp),
            payload,
        };
    });
}
