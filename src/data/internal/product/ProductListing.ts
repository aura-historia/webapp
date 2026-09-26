import type {
    ListingAvailabilityData,
    ListingLifecycleData,
    PersonalizedProductListingDetailsData,
    PersonalizedProductListingSummaryData,
    ProductListingDetailsData,
    ProductListingImageData,
    ProductListingSummaryPriceValuationData,
    ProductListingPriceData,
    ProductListingUserStateData,
} from "@/client";
import type { ProductImage } from "@/data/internal/product/ProductImageData.ts";
import {
    mapProductListingSource,
    type ProductListingSource,
} from "@/data/internal/product/ProductListingSource.ts";
import { formatPrice } from "@/data/internal/price/Price.ts";
import {
    mapProductListingUserState,
    type ProductListingUserState,
} from "@/data/internal/product/UserProductData.ts";

/** Card/search projection of a listing; use ProductListingDetail for detail contracts. */
export type ProductListing = {
    readonly productListingId: string;
    readonly productListingTitleSlugId?: string;
    readonly source: ProductListingSource;
    readonly sourceListingId: string;
    readonly title?: string;
    readonly price?: ProductListingPriceData | null;
    readonly formattedPrice?: string;
    /** Summary valuation type used by existing card presentations. */
    readonly priceValuation: ProductListingSummaryPriceValuationData["type"];
    /** Full valuation metadata, including the FX snapshot and capture/observation time. */
    readonly valuation: ProductListingSummaryPriceValuationData;
    readonly availability: ListingAvailabilityData | null;
    readonly lifecycle: ListingLifecycleData;
    readonly url?: URL;
    readonly viewUrl?: URL;
    readonly images: readonly ProductImage[];
    readonly contentPolicy: ProductListingDetailsData["contentPolicy"];
    readonly updated: Date;
    readonly userState?: ProductListingUserState | null;
    readonly auctionId?: string;
};

function mapImage(
    image: ProductListingImageData,
    contentPolicy: ProductListingDetailsData["contentPolicy"],
): ProductImage {
    const url = image.url ? (URL.parse(image.url) ?? undefined) : undefined;
    const prohibitedContentType =
        contentPolicy?.decision === "REQUIRES_CONSENT"
            ? contentPolicy.category
            : contentPolicy?.decision === "ALLOWED"
              ? "NONE"
              : "UNKNOWN";
    return { url, prohibitedContentType };
}

function mapUrl(value: string): URL | undefined {
    return URL.parse(value) ?? undefined;
}

function mapSummaryFields(
    item: PersonalizedProductListingSummaryData["item"],
    userState: ProductListingUserStateData | null | undefined,
    locale: string,
): ProductListing {
    return {
        productListingId: item.productListingId,
        productListingTitleSlugId: item.productListingTitleSlugId,
        source: mapProductListingSource(item.source),
        sourceListingId: item.sourceListingId,
        title: item.title?.text ?? undefined,
        price: item.displayPrice,
        priceValuation: item.priceValuation.type,
        valuation: item.priceValuation,
        formattedPrice:
            item.displayPrice?.type === "MONETARY"
                ? formatPrice(
                      { amount: item.displayPrice.amount, currency: item.displayPrice.currency },
                      locale,
                  )
                : undefined,
        availability: item.availability,
        lifecycle: item.lifecycle,
        url: mapUrl(item.url),
        viewUrl: mapUrl(item.viewUrl),
        images: item.images.map((image) => mapImage(image, item.contentPolicy)),
        contentPolicy: item.contentPolicy,
        updated: new Date(item.updated),
        userState: mapProductListingUserState(userState),
        auctionId: item.auctionId,
    };
}

export function mapPersonalizedProductListingSummary(
    apiData: PersonalizedProductListingSummaryData,
    locale: string,
): ProductListing {
    return mapSummaryFields(apiData.item, apiData.userState, locale);
}

/** Projects a detail response into card fields for endpoints that return listing details in collections. */
export function mapPersonalizedProductListingDetails(
    apiData: PersonalizedProductListingDetailsData,
    locale: string,
): ProductListing {
    const item = apiData.item;
    const displayPrice = item.pricing.display.price;
    return {
        productListingId: item.productListingId,
        productListingTitleSlugId: item.productListingTitleSlugId,
        source: mapProductListingSource(item.source),
        sourceListingId: item.sourceListingId,
        title: item.productTitle?.text ?? item.title?.text ?? undefined,
        price: displayPrice,
        priceValuation: item.pricing.valuation.type,
        valuation: item.pricing.valuation,
        formattedPrice:
            displayPrice?.type === "MONETARY"
                ? formatPrice(
                      { amount: displayPrice.amount, currency: displayPrice.currency },
                      locale,
                  )
                : undefined,
        availability: item.availability,
        lifecycle: item.lifecycle,
        url: mapUrl(item.url),
        viewUrl: mapUrl(item.viewUrl),
        images: item.images.map((image) => mapImage(image, item.contentPolicy)),
        contentPolicy: item.contentPolicy,
        updated: new Date(item.updated),
        userState: mapProductListingUserState(apiData.userState),
        auctionId: item.auction?.auctionId ?? undefined,
    };
}
