import type {
    LocalizedTextData,
    ProductListingHistoryChangeData,
    ProductListingHistoryEntryData,
    ProductListingHistoryEstimateData,
    ProductListingHistoryMainPriceData,
    ProductListingHistoryPriceDisplayData,
    ProductListingAuctionFactsData,
} from "@/client";
import { toSupportedCurrency, type Currency } from "@/data/internal/common/Currency.ts";
import {
    mapListingAvailability,
    type ListingAvailability,
    type ListingPriceEstimate,
    type MonetaryListingPrice,
    type OnRequestListingPrice,
} from "@/data/internal/product/ProductListingDomain.ts";

/**
 * Backend projection of one historical source value into the requested display currency, using
 * the latest persisted FX snapshot captured at or before the history entry. It never replaces the
 * source value; the app performs no conversion of its own.
 */
export type HistoricalDisplayPrice = {
    /** Amount in minor units of `currency`. */
    readonly amount: number;
    readonly currency: Currency;
    readonly fxRateId: string;
    readonly capturedAt: Date;
};

export type HistoryMonetaryPrice = MonetaryListingPrice & {
    readonly display?: HistoricalDisplayPrice;
};
export type HistoryListingPrice = HistoryMonetaryPrice | OnRequestListingPrice;
export type HistoryPriceEstimate = ListingPriceEstimate & {
    readonly display?: HistoricalDisplayPrice;
};

export type ListingAuctionFacts = {
    readonly auctionId?: string;
    readonly lotNumber: string | null;
    readonly cataloguePosition: number | null;
    readonly biddingOpens: Date | null;
    readonly scheduledCloses: Date | null;
    readonly reportedClosedAt: Date | null;
};

/** Original source text in its declared language; never a translation. */
export type HistoryLocalizedText = { readonly text: string; readonly language: string };

export type ProductListingDiscovery = {
    readonly listingSourceId: string;
    readonly sourceListingId: string;
    readonly title?: HistoryLocalizedText;
    readonly description?: HistoryLocalizedText;
    readonly pricing: {
        readonly price?: HistoryListingPrice | null;
        readonly priceEstimateMin?: HistoryPriceEstimate | null;
        readonly priceEstimateMax?: HistoryPriceEstimate | null;
    };
    readonly availability: ListingAvailability | null;
    readonly url: string;
    readonly imageCount: number;
    readonly auction: ListingAuctionFacts | null;
};

export type ProductListingHistoryChange =
    | {
          /** `null` records an absent text on that side, so a change can add or remove it. */
          readonly type: "TITLE_CHANGED" | "DESCRIPTION_CHANGED";
          readonly previous: HistoryLocalizedText | null;
          readonly current: HistoryLocalizedText | null;
      }
    | {
          readonly type: "MAIN_PRICE_CHANGED";
          readonly previous: HistoryListingPrice | null;
          readonly current: HistoryListingPrice | null;
      }
    | {
          readonly type: "MINIMUM_ESTIMATE_CHANGED" | "MAXIMUM_ESTIMATE_CHANGED";
          readonly previous: HistoryPriceEstimate | null;
          readonly current: HistoryPriceEstimate | null;
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

/** Drops a projection that cannot be represented truthfully instead of coercing it. */
function mapDisplay(
    display: ProductListingHistoryPriceDisplayData | undefined,
): HistoricalDisplayPrice | undefined {
    if (!display) return undefined;
    const currency = toSupportedCurrency(display.currency);
    const capturedAt = new Date(display.capturedAt);
    if (
        !currency ||
        !Number.isSafeInteger(display.amount) ||
        display.amount < 0 ||
        !display.fxRateId ||
        Number.isNaN(capturedAt.getTime())
    ) {
        return undefined;
    }
    return { amount: display.amount, currency, fxRateId: display.fxRateId, capturedAt };
}

function mapPrice(
    value: ProductListingHistoryMainPriceData | null | undefined,
): HistoryListingPrice | null {
    if (value == null) return null;
    if (value.type === "ON_REQUEST") return { type: "ON_REQUEST" };
    const display = mapDisplay(value.display);
    return {
        type: "MONETARY",
        amount: value.amount,
        currency: value.currency,
        ...(display && { display }),
    };
}

function mapMoney(
    value: ProductListingHistoryEstimateData | null | undefined,
): HistoryPriceEstimate | null {
    if (value == null) return null;
    const display = mapDisplay(value.display);
    return { amount: value.amount, currency: value.currency, ...(display && { display }) };
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

function mapText(value: LocalizedTextData | null): HistoryLocalizedText | null {
    return value === null ? null : { text: value.text, language: value.language };
}

function mapChange(change: ProductListingHistoryChangeData): ProductListingHistoryChange {
    switch (change.type) {
        case "TITLE_CHANGED":
        case "DESCRIPTION_CHANGED":
            return {
                type: change.type,
                previous: mapText(change.previous),
                current: mapText(change.current),
            };
        case "MAIN_PRICE_CHANGED":
            return {
                type: change.type,
                previous: mapPrice(change.previous),
                current: mapPrice(change.current),
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
            const displaySourceType =
                typeof sourceType === "string" || typeof sourceType === "number"
                    ? String(sourceType)
                    : "unknown";
            return { type: "UNKNOWN", sourceType: displaySourceType };
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
            price: mapPrice(data.pricing.price),
            priceEstimateMin: mapMoney(data.pricing.priceEstimateMin),
            priceEstimateMax: mapMoney(data.pricing.priceEstimateMax),
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
