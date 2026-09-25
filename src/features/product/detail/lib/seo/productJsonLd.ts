import type { ListingAvailabilityData, PersonalizedProductListingDetailsData } from "@/client";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { toMajorCurrencyAmount } from "@/data/internal/price/Price.ts";

type ProductJsonLd = {
    "@context": "https://schema.org/";
    "@type": "Product";
    name?: string;
    image?: string[];
    url?: string;
    sku: string;
    offers?: {
        "@type": "Offer";
        priceCurrency: string;
        price: number;
        availability?: string;
        url?: string;
    };
    dateCreated?: string;
    dateModified?: string;
};

const SCHEMA_AVAILABILITY: Partial<Record<ListingAvailabilityData, string>> = {
    AVAILABLE: "https://schema.org/InStock",
    IN_STOCK: "https://schema.org/InStock",
    LIMITED_AVAILABILITY: "https://schema.org/LimitedAvailability",
    BACK_ORDER: "https://schema.org/BackOrder",
    MADE_TO_ORDER: "https://schema.org/MadeToOrder",
    PRE_ORDER: "https://schema.org/PreOrder",
    UNAVAILABLE: "https://schema.org/OutOfStock",
    OUT_OF_STOCK: "https://schema.org/OutOfStock",
    SOLD_OUT: "https://schema.org/SoldOut",
};

export function generateProductJsonLd(
    apiData: PersonalizedProductListingDetailsData,
    canonicalUrl?: string,
): ProductJsonLd {
    const item = apiData.item;
    const title = item.productTitle?.text ?? item.title?.text ?? undefined;
    const listingPrice = item.pricing.display.price;
    const offerAvailability = item.availability
        ? SCHEMA_AVAILABILITY[item.availability]
        : undefined;
    const merchantUrl = item.viewUrl || item.url;

    const jsonLd: ProductJsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        sku: item.productListingId,
    };
    if (title) jsonLd.name = title;

    const validImages = item.images
        .map((image) => image.url)
        .filter((imageUrl): imageUrl is string => imageUrl !== null);
    jsonLd.image = validImages.length > 0 ? validImages : [BANNER_IMAGE_URL];

    if (canonicalUrl) jsonLd.url = canonicalUrl;
    if (
        listingPrice?.type === "MONETARY" &&
        item.pricing.valuation.type === "CURRENT" &&
        item.lifecycle === "ACTIVE"
    ) {
        jsonLd.offers = {
            "@type": "Offer",
            priceCurrency: listingPrice.currency,
            price: toMajorCurrencyAmount(listingPrice.amount, listingPrice.currency),
            url: merchantUrl,
        };
        if (offerAvailability) jsonLd.offers.availability = offerAvailability;
    }

    jsonLd.dateCreated = item.created;
    jsonLd.dateModified = item.updated;
    return jsonLd;
}

export function generateProductJsonLdScript(
    apiData: PersonalizedProductListingDetailsData,
    canonicalUrl?: string,
): string {
    return JSON.stringify(generateProductJsonLd(apiData, canonicalUrl));
}
