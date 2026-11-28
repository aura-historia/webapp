import type {
    PersonalizedProductListingCollectionDetailsData,
    PersonalizedProductListingSummaryData,
} from "@/client";
import type { ProductImage } from "@/data/internal/product/ProductImageData.ts";
import { mapListingDisplayText } from "@/data/internal/product/ListingText.ts";
import {
    mapProductListingSource,
    type ProductListingSource,
} from "@/data/internal/product/ProductListingSource.ts";
import {
    type CollectionListingUserState,
    mapCollectionListingUserState,
} from "@/data/internal/product/UserProductData.ts";
import {
    type ListingShippingSummary,
    mapToListingShippingSummary,
} from "@/data/internal/shipping/ListingShipping.ts";
import {
    mapListingAvailability,
    mapListingContentPolicy,
    formatListingPrice,
    mapListingImage,
    mapListingLifecycle,
    mapListingPrice,
    mapListingUrl,
    mapListingViewLink,
    mapListingDetailValuation,
    mapListingSummaryValuation,
    type ListingAvailability,
    type ListingContentPolicy,
    type ListingLifecycle,
    type ListingPrice,
    type ListingPriceValuation,
    type PriceValuationType,
    type ListingViewLink,
} from "@/data/internal/product/ProductListingDomain.ts";
import {
    mapToListingGeography,
    type ListingGeography,
} from "@/data/internal/geography/ListingGeography.ts";

/** Card/search projection of a listing; use ProductListingDetail for detail contracts. */
export type ProductListing = {
    readonly productListingId: string;
    readonly productListingTitleSlugId?: string;
    readonly source: ProductListingSource;
    readonly sourceListingId: string;
    readonly title?: string;
    readonly price?: ListingPrice | null;
    readonly formattedPrice?: string;
    /** Summary valuation type used by existing card presentations. */
    readonly priceValuation: PriceValuationType;
    /** Full valuation metadata, including the FX snapshot and capture/observation time. */
    readonly valuation: ListingPriceValuation;
    readonly availability: ListingAvailability | null;
    readonly lifecycle: ListingLifecycle;
    readonly url?: URL;
    readonly viewLink?: ListingViewLink;
    /** The listing's first image; collection reads return no other. Absent when it has none. */
    readonly image?: ProductImage;
    readonly contentPolicy: ListingContentPolicy | null | undefined;
    readonly updated: Date;
    readonly userState?: CollectionListingUserState | null;
    readonly auctionId?: string;
    /**
     * Public, destination-independent shipping summary. Absent when nothing is asserted, which
     * is never a no-shipping assertion.
     */
    readonly shipping?: ListingShippingSummary;
    /** Advertised-inventory geography, returned only on geographic search summaries. */
    readonly geography?: ListingGeography;
};

function mapSummaryFields(
    item: PersonalizedProductListingSummaryData["item"],
    userState: PersonalizedProductListingSummaryData["userState"],
    locale: string,
): ProductListing {
    const displayPrice = mapListingPrice(item.displayPrice);
    const geography = mapToListingGeography(item.geography);
    const shipping = mapToListingShippingSummary(item.shipping);

    return {
        productListingId: item.productListingId,
        productListingTitleSlugId: item.productListingTitleSlugId,
        source: mapProductListingSource(item.source),
        sourceListingId: item.sourceListingId,
        title: mapListingDisplayText(item.title),
        price: displayPrice,
        priceValuation: item.priceValuation.type,
        valuation: mapListingSummaryValuation(item.priceValuation),
        formattedPrice: formatListingPrice(displayPrice, locale),
        availability: mapListingAvailability(item.availability),
        lifecycle: mapListingLifecycle(item.lifecycle),
        url: mapListingUrl(item.url),
        viewLink: mapListingViewLink(item.viewLink),
        image: mapListingImage(item.image, item.contentPolicy),
        contentPolicy: mapListingContentPolicy(item.contentPolicy),
        updated: new Date(item.updated),
        userState: mapCollectionListingUserState(userState),
        auctionId: item.auctionId,
        ...(geography ? { geography } : {}),
        ...(shipping ? { shipping } : {}),
    };
}

export function mapPersonalizedProductListingSummary(
    apiData: PersonalizedProductListingSummaryData,
    locale: string,
): ProductListing {
    return mapSummaryFields(apiData.item, apiData.userState, locale);
}

/**
 * Projects a collection detail (watchlist, saved-search matches, auction catalogue) into card
 * fields. Its shipping is the collection summary, although the item is detail-shaped.
 */
export function mapPersonalizedProductListingDetails(
    apiData: PersonalizedProductListingCollectionDetailsData,
    locale: string,
): ProductListing {
    const item = apiData.item;
    const displayPrice = mapListingPrice(item.pricing.display.price);
    const shipping = mapToListingShippingSummary(item.shipping);
    return {
        productListingId: item.productListingId,
        productListingTitleSlugId: item.productListingTitleSlugId,
        source: mapProductListingSource(item.source),
        sourceListingId: item.sourceListingId,
        title: mapListingDisplayText(item.title),
        price: displayPrice,
        priceValuation: item.pricing.valuation.type,
        valuation: mapListingDetailValuation(item.pricing.valuation),
        formattedPrice: formatListingPrice(displayPrice, locale),
        availability: mapListingAvailability(item.availability),
        lifecycle: mapListingLifecycle(item.lifecycle),
        url: mapListingUrl(item.url),
        viewLink: mapListingViewLink(item.viewLink),
        image: mapListingImage(item.image, item.contentPolicy),
        contentPolicy: mapListingContentPolicy(item.contentPolicy),
        updated: new Date(item.updated),
        userState: mapCollectionListingUserState(apiData.userState),
        auctionId: item.auction?.auctionId ?? undefined,
        ...(shipping ? { shipping } : {}),
    };
}
