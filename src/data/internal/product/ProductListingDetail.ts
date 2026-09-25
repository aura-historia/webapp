import type {
    ListingAvailabilityData,
    ListingLifecycleData,
    PersonalizedProductListingDetailsData,
    ProductListingDetailsData,
    ProductListingImageData,
    ProductListingUserStateData,
} from "@/client";
import type { ProductImage } from "@/data/internal/product/ProductImageData.ts";
import {
    mapProductListingSource,
    type ProductListingSource,
} from "@/data/internal/product/ProductListingSource.ts";
import { formatPrice } from "@/data/internal/price/Price.ts";

export type ProductListingDetail = {
    readonly productListingId: string;
    readonly productListingTitleSlugId?: string;
    readonly title?: string;
    readonly description?: string;
    readonly source: ProductListingSource;
    readonly sourceListingId: string;
    readonly price?: ProductListingDetailsData["pricing"]["display"]["price"];
    readonly displayPrice?: string;
    readonly priceValuation: "CURRENT" | "SALE_OBSERVATION";
    readonly availability: ListingAvailabilityData | null;
    readonly lifecycle: ListingLifecycleData;
    readonly url?: URL;
    readonly viewUrl?: URL;
    readonly images: readonly ProductImage[];
    readonly contentPolicy: ProductListingDetailsData["contentPolicy"];
    readonly auction: ProductListingDetailsData["auction"];
    readonly lot: ProductListingDetailsData["lot"];
    readonly created: Date;
    readonly updated: Date;
    readonly userState?: ProductListingUserStateData | null;
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

    return {
        productListingId: item.productListingId,
        productListingTitleSlugId: item.productListingTitleSlugId,
        // The API's localized title is preferred, with its source title as fallback.
        title: item.productTitle?.text ?? item.title?.text ?? undefined,
        description: item.productDescription?.text ?? item.description?.text ?? undefined,
        source: mapProductListingSource(item.source),
        sourceListingId: item.sourceListingId,
        price: item.pricing.display.price,
        displayPrice: getDisplayPrice(item, locale),
        priceValuation: item.pricing.valuation.type,
        availability: item.availability,
        lifecycle: item.lifecycle,
        url: mapUrl(item.url),
        viewUrl: mapUrl(item.viewUrl),
        images: item.images.map((image) => mapImage(image, item.contentPolicy)),
        contentPolicy: item.contentPolicy,
        auction: item.auction,
        lot: item.lot,
        created: new Date(item.created),
        updated: new Date(item.updated),
        userState: apiData.userState,
    };
}
