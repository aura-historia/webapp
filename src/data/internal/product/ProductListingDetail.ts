import type { PersonalizedProductListingDetailsData } from "@/client";
import {
    isListingTextTranslated,
    mapListingDisplayText,
} from "@/data/internal/product/ListingText.ts";
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
    mapListingAuction,
    mapListingContentPolicy,
    mapListingDetailValuation,
    formatListingPrice,
    mapListingImages,
    mapListingLifecycle,
    mapListingLot,
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
    /** Whether the shown title is a machine translation of the source's text. */
    readonly translated: boolean;
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

/** Converts the personalized listing DTO at the API boundary for detail presentation. */
export function mapToProductListingDetail(
    apiData: PersonalizedProductListingDetailsData,
    locale: string,
): ProductListingDetail {
    const item = apiData.item;
    const displayPricing = mapListingPricingAmounts(item.pricing.display);
    const pricing: ListingPricing = {
        source: mapListingPricingAmounts(item.pricing.source),
        display: displayPricing,
        valuation: mapListingDetailValuation(item.pricing.valuation),
    };
    const displayPrice = displayPricing.price;

    return {
        productListingId: item.productListingId,
        productListingTitleSlugId: item.productListingTitleSlugId,
        title: mapListingDisplayText(item.title),
        translated: isListingTextTranslated(item.title),
        source: mapProductListingSource(item.source),
        sourceListingId: item.sourceListingId,
        pricing,
        price: displayPrice,
        displayPrice: formatListingPrice(displayPrice, locale),
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
