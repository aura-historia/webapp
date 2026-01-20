import type { PersonalizedGetProductData } from "@/client";

type ProductJsonLd = {
    "@context": "https://schema.org/";
    "@type": "Product";
    name: string;
    description?: string;
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
    category?: string;
    dateCreated?: string;
    dateModified?: string;
};

/**
 * Generates a JSON-LD structured data object for a product.
 * This follows Schema.org Product specification for SEO purposes.
 */
export function generateProductJsonLd(apiData: PersonalizedGetProductData): ProductJsonLd {
    const product = apiData.item;

    const jsonLd: ProductJsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.title.text,
        sku: `${product.shopId}-${product.shopsProductId}`,
    };

    if (product.description?.text) {
        jsonLd.description = product.description.text;
    }

    if (product.images && product.images.length > 0) {
        jsonLd.image = product.images
            .filter((img) => img.prohibitedContent === "NONE")
            .map((img) => img.url);
    }

    if (product.url) {
        jsonLd.url = product.url;
    }

    if (product.price) {
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
            priceCurrency: product.price.currency,
            price: product.price.amount / 100,
            availability,
            url: product.url,
            seller: {
                "@type": "Organization",
                name: product.shopName,
            },
        };
    }

    // Add category for antiques
    jsonLd.category = "Antiques";

    return jsonLd;
}

/**
 * Generates a JSON-LD script content string for embedding in a page's head.
 */
export function generateProductJsonLdScript(apiData: PersonalizedGetProductData): string {
    const jsonLd = generateProductJsonLd(apiData);
    return JSON.stringify(jsonLd);
}
