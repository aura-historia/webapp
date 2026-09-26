import type {
    PersonalizedProductListingDetailsData,
    PersonalizedProductListingSummaryData,
    ProductListingUserStateData,
} from "@/client";
import type { ProductImage } from "@/data/internal/product/ProductImageData.ts";
import {
    mapProductListingSource,
    type ProductListingSource,
} from "@/data/internal/product/ProductListingSource.ts";
import {
    mapProductListingUserState,
    type ProductListingUserState,
} from "@/data/internal/product/UserProductData.ts";
import {
    mapListingAvailability,
    mapListingContentPolicy,
    formatListingPrice,
    mapListingImages,
    mapListingLifecycle,
    mapListingPrice,
    mapListingUrl,
    mapListingDetailValuation,
    mapListingSummaryValuation,
    type ListingAvailability,
    type ListingContentPolicy,
    type ListingLifecycle,
    type ListingPrice,
    type ListingPriceValuation,
    type PriceValuationType,
} from "@/data/internal/product/ProductListingDomain.ts";

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
    readonly viewUrl?: URL;
    readonly images: readonly ProductImage[];
    readonly contentPolicy: ListingContentPolicy | null | undefined;
    readonly updated: Date;
    readonly userState?: ProductListingUserState | null;
    readonly auctionId?: string;
};

function mapSummaryFields(
    item: PersonalizedProductListingSummaryData["item"],
    userState: ProductListingUserStateData | null | undefined,
    locale: string,
): ProductListing {
    const displayPrice = mapListingPrice(item.displayPrice);

    return {
        productListingId: item.productListingId,
        productListingTitleSlugId: item.productListingTitleSlugId,
        source: mapProductListingSource(item.source),
        sourceListingId: item.sourceListingId,
        title: item.title?.text ?? undefined,
        price: displayPrice,
        priceValuation: item.priceValuation.type,
        valuation: mapListingSummaryValuation(item.priceValuation),
        formattedPrice: formatListingPrice(displayPrice, locale),
        availability: mapListingAvailability(item.availability),
        lifecycle: mapListingLifecycle(item.lifecycle),
        url: mapListingUrl(item.url),
        viewUrl: mapListingUrl(item.viewUrl),
        images: mapListingImages(item.images, item.contentPolicy),
        contentPolicy: mapListingContentPolicy(item.contentPolicy),
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
    const displayPrice = mapListingPrice(item.pricing.display.price);
    return {
        productListingId: item.productListingId,
        productListingTitleSlugId: item.productListingTitleSlugId,
        source: mapProductListingSource(item.source),
        sourceListingId: item.sourceListingId,
        title: item.productTitle?.text ?? item.title?.text ?? undefined,
        price: displayPrice,
        priceValuation: item.pricing.valuation.type,
        valuation: mapListingDetailValuation(item.pricing.valuation),
        formattedPrice: formatListingPrice(displayPrice, locale),
        availability: mapListingAvailability(item.availability),
        lifecycle: mapListingLifecycle(item.lifecycle),
        url: mapListingUrl(item.url),
        viewUrl: mapListingUrl(item.viewUrl),
        images: mapListingImages(item.images, item.contentPolicy),
        contentPolicy: mapListingContentPolicy(item.contentPolicy),
        updated: new Date(item.updated),
        userState: mapProductListingUserState(apiData.userState),
        auctionId: item.auction?.auctionId ?? undefined,
    };
}
