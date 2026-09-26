import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import type { ListingAvailability } from "@/data/internal/product/ProductListingDomain.ts";
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

const SCHEMA_AVAILABILITY: Partial<Record<ListingAvailability, string>> = {
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
    product: ProductListingDetail,
    canonicalUrl?: string,
): ProductJsonLd {
    const listingPrice = product.pricing.display.price;
    const offerAvailability = product.availability
        ? SCHEMA_AVAILABILITY[product.availability]
        : undefined;

    const jsonLd: ProductJsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        sku: product.productListingId,
    };
    if (product.title) jsonLd.name = product.title;

    const validImages = product.images.flatMap((image) => (image.url ? [image.url.href] : []));
    jsonLd.image = validImages.length > 0 ? validImages : [BANNER_IMAGE_URL];

    if (canonicalUrl) jsonLd.url = canonicalUrl;
    if (
        listingPrice?.type === "MONETARY" &&
        product.valuation.type === "CURRENT" &&
        product.lifecycle === "ACTIVE"
    ) {
        jsonLd.offers = {
            "@type": "Offer",
            priceCurrency: listingPrice.currency,
            price: toMajorCurrencyAmount(listingPrice.amount, listingPrice.currency),
            url: product.viewUrl?.href ?? product.url?.href,
        };
        if (offerAvailability) jsonLd.offers.availability = offerAvailability;
    }

    jsonLd.dateCreated = product.created.toISOString();
    jsonLd.dateModified = product.updated.toISOString();
    return jsonLd;
}

export function generateProductJsonLdScript(
    product: ProductListingDetail,
    canonicalUrl?: string,
): string {
    return JSON.stringify(generateProductJsonLd(product, canonicalUrl));
}
