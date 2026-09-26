import type { PersonalizedProductListingDetailsData, ProductListingDetailsData } from "@/client";
import {
    mapProductListingSource,
    type ProductListingSource,
} from "@/data/internal/product/ProductListingSource.ts";
import { formatPrice } from "@/data/internal/price/Price.ts";
import {
    mapProductListingUserState,
    type ProductListingUserState,
} from "@/data/internal/product/UserProductData.ts";
import {
    mapListingAvailability,
    mapListingAuction,
    mapListingContentPolicy,
    mapListingDetailValuation,
    mapListingImages,
    mapListingLifecycle,
    mapListingLot,
    mapListingPrice,
    mapListingPricingAmounts,
    mapListingUrl,
    type ListingAvailability,
    type ListingAuctionSummary,
    type ListingContentPolicy,
    type ListingLifecycle,
    type ListingLotFacts,
    type ListingPrice,
    type ListingPriceValuation,
    type ListingPricing,
} from "@/data/internal/product/ProductListingDomain.ts";

export type ProductListingDetail = {
    readonly productListingId: string;
    readonly productListingTitleSlugId?: string;
    readonly title?: string;
    readonly description?: string;
    readonly source: ProductListingSource;
    readonly sourceListingId: string;
    readonly pricing: ListingPricing;
    readonly price?: ListingPrice | null;
    readonly displayPrice?: string;
    readonly priceValuation: ListingPriceValuation["type"];
    readonly valuation: ListingPriceValuation;
    readonly availability: ListingAvailability | null;
    readonly lifecycle: ListingLifecycle;
    readonly url?: URL;
    readonly viewUrl?: URL;
    readonly images: readonly ProductImage[];
    readonly contentPolicy: ListingContentPolicy | null | undefined;
    readonly auction: ListingAuctionSummary | null;
    readonly lot: ListingLotFacts | null;
    readonly created: Date;
    readonly updated: Date;
    readonly userState?: ProductListingUserState | null;
};

function getDisplayPrice(data: ProductListingDetailsData, locale: string): string | undefined {
    const price = data.pricing.display.price;
    if (price?.type !== "MONETARY") return undefined;

    return formatPrice({ amount: price.amount, currency: price.currency }, locale);
}

/** Converts the personalized listing DTO at the API boundary for detail presentation. */
export function mapToProductListingDetail(
    apiData: PersonalizedProductListingDetailsData,
    locale: string,
): ProductListingDetail {
    const item = apiData.item;
    const pricing: ListingPricing = {
        source: mapListingPricingAmounts(item.pricing.source),
        display: mapListingPricingAmounts(item.pricing.display),
        valuation: mapListingDetailValuation(item.pricing.valuation),
    };

    return {
        productListingId: item.productListingId,
        productListingTitleSlugId: item.productListingTitleSlugId,
        // The API's localized title is preferred, with its source title as fallback.
        title: item.productTitle?.text ?? item.title?.text ?? undefined,
        description: item.productDescription?.text ?? item.description?.text ?? undefined,
        source: mapProductListingSource(item.source),
        sourceListingId: item.sourceListingId,
        pricing,
        price: mapListingPrice(item.pricing.display.price),
        displayPrice: getDisplayPrice(item, locale),
        priceValuation: pricing.valuation.type,
        valuation: pricing.valuation,
        availability: mapListingAvailability(item.availability),
        lifecycle: mapListingLifecycle(item.lifecycle),
        url: mapListingUrl(item.url),
        viewUrl: mapListingUrl(item.viewUrl),
        images: mapListingImages(item.images, item.contentPolicy),
        contentPolicy: mapListingContentPolicy(item.contentPolicy),
        auction: mapListingAuction(item.auction),
        lot: mapListingLot(item.lot),
        created: new Date(item.created),
        updated: new Date(item.updated),
        userState: mapProductListingUserState(apiData.userState),
    };
}
