import type {
    ListingAvailabilityData,
    ListingLifecycleData,
    PersonalizedProductListingDetailsData,
    PersonalizedProductListingSummaryData,
    ProductListingDetailsData,
    ProductListingImageData,
    ProductListingPriceData,
    ProductListingUserStateData,
} from "@/client";
import type { ProductImage } from "@/data/internal/product/ProductImageData.ts";
import { formatPrice } from "@/data/internal/price/Price.ts";

/** Listing fields shared by search cards and the detail presentation. */
export type OverviewProduct = {
    readonly productListingId: string;
    readonly productListingTitleSlugId?: string;
    readonly source: ProductListingDetailsData["source"];
    readonly sourceListingId: string;
    readonly title?: string;
    readonly price?: ProductListingPriceData | null;
    readonly formattedPrice?: string;
    readonly priceValuation: "CURRENT" | "SALE_OBSERVATION";
    readonly availability: ListingAvailabilityData | null;
    readonly lifecycle: ListingLifecycleData;
    readonly url?: URL;
    readonly viewUrl?: URL;
    readonly images: readonly ProductImage[];
    readonly contentPolicy: ProductListingDetailsData["contentPolicy"];
    readonly updated: Date;
    readonly userState?: ProductListingUserStateData | null;
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
): OverviewProduct {
    return {
        productListingId: item.productListingId,
        productListingTitleSlugId: item.productListingTitleSlugId,
        source: item.source,
        sourceListingId: item.sourceListingId,
        title: item.title?.text ?? undefined,
        price: item.displayPrice,
        priceValuation: item.priceValuation.type,
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
        userState,
        auctionId: item.auctionId,
    };
}

export function mapPersonalizedGetProductSummaryDataToOverviewProduct(
    apiData: PersonalizedProductListingSummaryData,
    locale: string,
): OverviewProduct {
    return mapSummaryFields(apiData.item, apiData.userState, locale);
}

export function mapPersonalizedGetProductDataToOverviewProduct(
    apiData: PersonalizedProductListingDetailsData,
    locale: string,
): OverviewProduct {
    const item = apiData.item;
    const displayPrice = item.pricing.display.price;
    return {
        productListingId: item.productListingId,
        productListingTitleSlugId: item.productListingTitleSlugId,
        source: item.source,
        sourceListingId: item.sourceListingId,
        title: item.productTitle?.text ?? item.title?.text ?? undefined,
        price: displayPrice,
        priceValuation: item.pricing.valuation.type,
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
        userState: apiData.userState,
        auctionId: item.auction?.auctionId ?? undefined,
    };
}
