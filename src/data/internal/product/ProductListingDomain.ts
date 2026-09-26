import type {
    AuctionSummaryData,
    ContentPolicyData,
    ListingAvailabilityData,
    ListingLifecycleData,
    ProductListingLotData,
    ProductListingImageData,
    ProductListingPriceData,
    ProductListingPricingData,
    ProductListingPricingValuationData,
    ProductListingSummaryPriceValuationData,
} from "@/client";
import type { Currency } from "@/data/internal/common/Currency.ts";
import type { ProductImage } from "@/data/internal/product/ProductImageData.ts";

export const LISTING_AVAILABILITIES = [
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

export type ListingAvailability = (typeof LISTING_AVAILABILITIES)[number] | "UNKNOWN";
export type ListingLifecycle = "ACTIVE" | "WITHDRAWN" | "UNKNOWN";

export type MonetaryListingPrice = {
    readonly type: "MONETARY";
    /** Amount in minor currency units. */
    readonly amount: number;
    readonly currency: Currency;
};

export type OnRequestListingPrice = {
    readonly type: "ON_REQUEST";
};

export type ListingPrice = MonetaryListingPrice | OnRequestListingPrice;
export type PriceValuationType = "CURRENT" | "SALE_OBSERVATION";

export type ListingPriceValuation =
    | {
          readonly type: "CURRENT";
          readonly fxRateId: string;
          readonly capturedAt: Date;
      }
    | {
          readonly type: "SALE_OBSERVATION";
          readonly fxRateId: string;
          readonly observedAt: Date;
          readonly capturedAt?: Date;
      };

export type ListingPriceEstimate = {
    readonly amount: number;
    readonly currency: Currency;
};

export type ListingPricingAmounts = {
    readonly price?: ListingPrice | null;
    readonly priceEstimateMin?: ListingPriceEstimate | null;
    readonly priceEstimateMax?: ListingPriceEstimate | null;
};

export type ListingPricing = {
    readonly source: ListingPricingAmounts;
    readonly display: ListingPricingAmounts;
    readonly valuation: ListingPriceValuation;
};

export type ListingContentPolicy =
    | { readonly decision: "ALLOWED" }
    | { readonly decision: "REQUIRES_CONSENT"; readonly category: "NAZI_GERMANY" };

export type ListingAuctionSchedule = {
    readonly biddingOpens: Date | null;
    readonly liveStarts: Date | null;
    readonly lotsBeginClosing: Date | null;
    readonly scheduledEnd: Date | null;
};

export type ListingAuctionSummary = {
    readonly auctionId: string;
    readonly name?: { readonly text: string; readonly language: string } | null;
    readonly format?: "LIVE" | "TIMED" | null;
    readonly reportedStatus?:
        | "SCHEDULED"
        | "IN_PROGRESS"
        | "ENDED"
        | "POSTPONED"
        | "CANCELLED"
        | null;
    readonly schedule: ListingAuctionSchedule;
};

export type ListingLotFacts = {
    readonly lotNumber: string | null;
    readonly cataloguePosition: number | null;
    readonly biddingOpens: Date | null;
    readonly scheduledCloses: Date | null;
    readonly reportedClosedAt: Date | null;
};

export function mapListingUrl(value: string): URL | undefined {
    return URL.parse(value) ?? undefined;
}

export function mapListingImages(
    images: readonly ProductListingImageData[],
    contentPolicy: ContentPolicyData | null | undefined,
): readonly ProductImage[] {
    const prohibitedContentType =
        contentPolicy?.decision === "REQUIRES_CONSENT"
            ? contentPolicy.category
            : contentPolicy?.decision === "ALLOWED"
              ? "NONE"
              : "UNKNOWN";

    return images.map((image) => ({
        url: image.url ? mapListingUrl(image.url) : undefined,
        prohibitedContentType,
    }));
}

function mapDate(value: string): Date {
    return new Date(value);
}

function mapNullableDate(value: string | null): Date | null {
    return value === null ? null : mapDate(value);
}

export function mapListingAvailability(
    availability: ListingAvailabilityData | null,
): ListingAvailability | null {
    if (availability === null) return null;
    return (LISTING_AVAILABILITIES as readonly string[]).includes(availability)
        ? availability
        : "UNKNOWN";
}

export function mapListingLifecycle(lifecycle: ListingLifecycleData): ListingLifecycle {
    return lifecycle === "ACTIVE" || lifecycle === "WITHDRAWN" ? lifecycle : "UNKNOWN";
}

export function mapListingPrice(
    price: ProductListingPriceData | null | undefined,
): ListingPrice | null | undefined {
    if (price == null) return price;
    if (price.type === "ON_REQUEST") return { type: "ON_REQUEST" };
    return { type: "MONETARY", amount: price.amount, currency: price.currency };
}

export function mapListingPriceEstimate(
    price: { readonly amount: number; readonly currency: Currency } | null | undefined,
): ListingPriceEstimate | null | undefined {
    if (price == null) return price;
    return { amount: price.amount, currency: price.currency };
}

export function mapListingSummaryValuation(
    valuation: ProductListingSummaryPriceValuationData,
): ListingPriceValuation {
    if (valuation.type === "CURRENT") {
        return {
            type: "CURRENT",
            fxRateId: valuation.fxRateId,
            capturedAt: mapDate(valuation.capturedAt),
        };
    }
    return {
        type: "SALE_OBSERVATION",
        fxRateId: valuation.fxRateId,
        observedAt: mapDate(valuation.observedAt),
    };
}

export function mapListingDetailValuation(
    valuation: ProductListingPricingValuationData,
): ListingPriceValuation {
    if (valuation.type === "CURRENT") {
        return {
            type: "CURRENT",
            fxRateId: valuation.fxRateId,
            capturedAt: mapDate(valuation.capturedAt),
        };
    }
    return {
        type: "SALE_OBSERVATION",
        fxRateId: valuation.fxRateId,
        capturedAt: mapDate(valuation.capturedAt),
        observedAt: mapDate(valuation.observedAt),
    };
}

export function mapListingPricingAmounts(
    pricing: ProductListingPricingData,
): ListingPricingAmounts {
    return {
        price: mapListingPrice(pricing.price),
        priceEstimateMin: mapListingPriceEstimate(pricing.priceEstimateMin),
        priceEstimateMax: mapListingPriceEstimate(pricing.priceEstimateMax),
    };
}

export function mapListingContentPolicy(
    policy: ContentPolicyData | null | undefined,
): ListingContentPolicy | null | undefined {
    if (policy == null) return policy;
    if (policy.decision === "ALLOWED") return { decision: "ALLOWED" };
    return { decision: "REQUIRES_CONSENT", category: policy.category };
}

export function mapListingAuction(
    auction: AuctionSummaryData | null,
): ListingAuctionSummary | null {
    if (auction === null) return null;
    return {
        auctionId: auction.auctionId,
        name: auction.name
            ? { text: auction.name.text, language: auction.name.language }
            : auction.name,
        format: auction.format,
        reportedStatus: auction.reportedStatus,
        schedule: {
            biddingOpens: mapNullableDate(auction.schedule.biddingOpens),
            liveStarts: mapNullableDate(auction.schedule.liveStarts),
            lotsBeginClosing: mapNullableDate(auction.schedule.lotsBeginClosing),
            scheduledEnd: mapNullableDate(auction.schedule.scheduledEnd),
        },
    };
}

export function mapListingLot(lot: ProductListingLotData | null): ListingLotFacts | null {
    if (lot === null) return null;
    return {
        lotNumber: lot.lotNumber,
        cataloguePosition: lot.cataloguePosition,
        biddingOpens: mapNullableDate(lot.biddingOpens),
        scheduledCloses: mapNullableDate(lot.scheduledCloses),
        reportedClosedAt: mapNullableDate(lot.reportedClosedAt),
    };
}
