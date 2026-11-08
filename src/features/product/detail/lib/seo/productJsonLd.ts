import type { ProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import type { ListingAvailability } from "@/data/internal/product/ProductListingDomain.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { toMajorCurrencyAmount } from "@/data/internal/price/Price.ts";

/** Google rejects a `sku` longer than this ("invalid string length"). */
const SKU_MAX_LENGTH = 50;

type SellerJsonLd = {
    "@type": "Organization";
    name: string;
    url?: string;
};

type OfferJsonLd = {
    "@type": "Offer";
    priceCurrency: string;
    price: number;
    availability?: string;
    url?: string;
    seller: SellerJsonLd;
};

type ProductJsonLd = {
    "@context": "https://schema.org/";
    "@type": "Product";
    name?: string;
    description?: string;
    image?: string[];
    url?: string;
    productID: string;
    sku?: string;
    offers: OfferJsonLd;
    dateCreated?: string;
    dateModified?: string;
};

type ItemPageJsonLd = {
    "@context": "https://schema.org/";
    "@type": "ItemPage";
    name?: string;
    description?: string;
    image?: string[];
    url?: string;
    dateCreated?: string;
    dateModified?: string;
    offers?: undefined;
};

export type ProductStructuredData = ProductJsonLd | ItemPageJsonLd;

export type ProductJsonLdOptions = {
    /** The localized canonical URL of the listing page. */
    readonly canonicalUrl?: string;
    /** The localized URL of the source's profile page, which the listing page links to. */
    readonly sellerUrl?: string;
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

/**
 * The seller's own identifier for the listing, as `sku`: the merchant-specific identifier schema.org
 * and Google expect. Left out when it is blank or longer than Google accepts.
 */
function toSku(sourceListingId: string): string | undefined {
    const sku = sourceListingId.trim();
    return sku.length > 0 && sku.length <= SKU_MAX_LENGTH ? sku : undefined;
}

/**
 * The listing's current asking price as an Offer: only an active listing with a current monetary
 * price above zero. Price on request, sale observations and withdrawn listings have none.
 */
function toOffer(
    product: ProductListingDetail,
    { canonicalUrl, sellerUrl }: ProductJsonLdOptions,
): OfferJsonLd | undefined {
    const listingPrice = product.pricing.display.price;
    if (
        listingPrice?.type !== "MONETARY" ||
        listingPrice.amount <= 0 ||
        product.valuation.type !== "CURRENT" ||
        product.lifecycle !== "ACTIVE"
    ) {
        return undefined;
    }

    const availability = product.availability
        ? SCHEMA_AVAILABILITY[product.availability]
        : undefined;
    const seller: SellerJsonLd = { "@type": "Organization", name: product.source.name };
    if (sellerUrl) seller.url = sellerUrl;

    const offer: OfferJsonLd = {
        "@type": "Offer",
        priceCurrency: listingPrice.currency,
        price: toMajorCurrencyAmount(listingPrice.amount, listingPrice.currency),
        // The page that shows the offer; the dealer's own listing is one click further.
        url: canonicalUrl ?? product.viewUrl?.href ?? product.url?.href,
        seller,
    };
    if (availability) offer.availability = availability;
    return offer;
}

/**
 * JSON-LD for a listing page. A listing with a current asking price is a Product with an Offer
 * sold by its source. Without one (price on request, sold, withdrawn) Google counts a Product as
 * an invalid item, so the page is described as an ItemPage instead.
 *
 * Shipping and return policies are not part of the listing data, so the offer carries neither.
 */
export function generateProductJsonLd(
    product: ProductListingDetail,
    options: ProductJsonLdOptions = {},
): ProductStructuredData {
    const { canonicalUrl } = options;
    // Only present in the page's language (#1232).
    const description = product.description?.replace(/\s+/g, " ").trim();
    const validImages = product.images.flatMap((image) =>
        image.prohibitedContentType === "NONE" && image.url ? [image.url.href] : [],
    );
    const image = validImages.length > 0 ? validImages : [BANNER_IMAGE_URL];
    const dateCreated = product.created.toISOString();
    const dateModified = product.updated.toISOString();

    const offer = toOffer(product, options);
    if (!offer) {
        const itemPage: ItemPageJsonLd = { "@context": "https://schema.org/", "@type": "ItemPage" };
        if (product.title) itemPage.name = product.title;
        if (description) itemPage.description = description;
        itemPage.image = image;
        if (canonicalUrl) itemPage.url = canonicalUrl;
        itemPage.dateCreated = dateCreated;
        itemPage.dateModified = dateModified;
        return itemPage;
    }

    const jsonLd: ProductJsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        productID: product.productListingId,
        offers: offer,
    };
    if (product.title) jsonLd.name = product.title;
    if (description) jsonLd.description = description;
    jsonLd.image = image;
    if (canonicalUrl) jsonLd.url = canonicalUrl;
    const sku = toSku(product.sourceListingId);
    if (sku) jsonLd.sku = sku;
    jsonLd.dateCreated = dateCreated;
    jsonLd.dateModified = dateModified;
    return jsonLd;
}
