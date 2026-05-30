import type { PersonalizedGetProductData } from "@/client";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";

type ProductJsonLd = {
    "@context": "https://schema.org/";
    "@type": "Product";
    name: string;
    image?: string[];
    url?: string;
    sku?: string;
    offers?: {
        "@type": "Offer";
        priceCurrency: string;
        price: number;
        availability: string;
        url?: string;
        seller?: {
            "@type": "Organization";
            name: string;
        };
    };
    dateCreated?: string;
    dateModified?: string;
};

/**
 * Generates a JSON-LD structured data object for a product.
 * This follows Schema.org Product specification for SEO purposes.
 */
export function generateProductJsonLd(apiData: PersonalizedGetProductData): ProductJsonLd {
    const product = apiData.item;
    const productUrl = product.viewUrl || product.url;

    const jsonLd: ProductJsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.title.text,
        sku: `${product.shopId}-${product.shopsProductId}`,
    };

    if (product.images && product.images.length > 0) {
        const validImages = product.images
            .filter((img) => img.prohibitedContent === "NONE")
            .map((img) => img.url)
            .filter((url) => url !== undefined);
        jsonLd.image = validImages.length > 0 ? validImages : [BANNER_IMAGE_URL];
    } else {
        jsonLd.image = [BANNER_IMAGE_URL];
    }

    if (productUrl) {
        jsonLd.url = productUrl;
    }

    if (product.price?.offer) {
        let availability: string;
        if (product.state === "LISTED" || product.state === "AVAILABLE") {
            availability = "https://schema.org/InStock";
        } else if (product.state === "RESERVED") {
            availability = "https://schema.org/LimitedAvailability";
        } else if (product.state === "SOLD") {
            availability = "https://schema.org/SoldOut";
        } else {
            availability = "https://schema.org/Discontinued";
        }

        jsonLd.offers = {
            "@type": "Offer",
            priceCurrency: product.price.offer.currency,
            price: product.price.offer.amount / 100,
            availability,
            url: productUrl,
            seller: {
                "@type": "Organization",
                name: product.shopName,
            },
        };
    }

    return jsonLd;
}

/**
 * Generates a JSON-LD script content string for embedding in a page's head.
 */
export function generateProductJsonLdScript(apiData: PersonalizedGetProductData): string {
    const jsonLd = generateProductJsonLd(apiData);
    return JSON.stringify(jsonLd);
}
