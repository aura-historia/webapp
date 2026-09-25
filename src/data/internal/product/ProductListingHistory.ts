import type {
    ListingAvailabilityData,
    ProductListingHistoryChangeData,
    ProductListingHistoryEntryData,
    ProductListingPriceData,
    ProductListingAuctionFactsData,
    PriceData,
} from "@/client";

export type ListingHistoryPrice =
    | { readonly type: "MONETARY"; readonly amount: number; readonly currency: string }
    | { readonly type: "ON_REQUEST" };

export type ListingHistoryMoney = {
    readonly amount: number;
    readonly currency: string;
};

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
        readonly price?: ListingHistoryPrice | null;
        readonly priceEstimateMin?: ListingHistoryMoney | null;
        readonly priceEstimateMax?: ListingHistoryMoney | null;
    };
    readonly availability: ListingAvailabilityData | null;
    readonly url: string;
    readonly imageCount: number;
    readonly auction: ListingAuctionFacts | null;
};

export type ProductListingHistoryChange =
    | {
          readonly type: "MAIN_PRICE_CHANGED";
          readonly previous: ListingHistoryPrice | null;
          readonly current: ListingHistoryPrice | null;
      }
    | {
          readonly type: "MINIMUM_ESTIMATE_CHANGED" | "MAXIMUM_ESTIMATE_CHANGED";
          readonly previous: ListingHistoryMoney | null;
          readonly current: ListingHistoryMoney | null;
      }
    | {
          readonly type: "AVAILABILITY_CHANGED";
          readonly previous: ListingAvailabilityData | null;
          readonly current: ListingAvailabilityData | null;
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
    | { readonly type: "WITHDRAWN"; readonly previousAvailability: ListingAvailabilityData | null }
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

function mapListingPrice(value: ProductListingPriceData | null): ListingHistoryPrice | null {
    if (value === null) return null;
    return value.type === "MONETARY"
        ? { type: "MONETARY", amount: value.amount, currency: value.currency }
        : { type: "ON_REQUEST" };
}

function mapMoney(value: PriceData | null): ListingHistoryMoney | null {
    return value === null ? null : { amount: value.amount, currency: value.currency };
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
                previous: mapListingPrice(change.previous),
                current: mapListingPrice(change.current),
            };
        case "MINIMUM_ESTIMATE_CHANGED":
        case "MAXIMUM_ESTIMATE_CHANGED":
            return {
                type: change.type,
                previous: mapMoney(change.previous),
                current: mapMoney(change.current),
            };
        case "AVAILABILITY_CHANGED":
            return { type: change.type, previous: change.previous, current: change.current };
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
            return { type: change.type, previousAvailability: change.previousAvailability };
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
            price: mapListingPrice(data.pricing.price ?? null),
            priceEstimateMin: mapMoney(data.pricing.priceEstimateMin ?? null),
            priceEstimateMax: mapMoney(data.pricing.priceEstimateMax ?? null),
        },
        availability: data.availability,
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
