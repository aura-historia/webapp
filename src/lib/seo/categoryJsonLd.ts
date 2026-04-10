import type { GetCategoryData } from "@/client";
import { getCategoryDescription } from "@/lib/seo/categoryDescription.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";

type CategoryCollectionPageJsonLd = {
    "@context": "https://schema.org/";
    "@type": "CollectionPage";
    name: string;
    description: string;
    url: string;
    image: string;
    dateCreated: string;
    dateModified: string;
};

/**
 * Generates a Schema.org {@link https://schema.org/CollectionPage CollectionPage} JSON-LD object
 * for a category page. Represents the category as a curated collection of antique items.
 */
export function generateCategoryJsonLd(
    data: GetCategoryData,
    categoryUrl: string,
): CategoryCollectionPageJsonLd {
    const description = getCategoryDescription(data.categoryKey);

    return {
        "@context": "https://schema.org/",
        "@type": "CollectionPage",
        name: data.name.text,
        description: description,
        url: categoryUrl,
        image: BANNER_IMAGE_URL,
        dateCreated: data.created,
        dateModified: data.updated,
    };
}

/**
 * Serialises the category JSON-LD to a string suitable for embedding in a
 * `<script type="application/ld+json">` tag.
 */
export function generateCategoryJsonLdScript(data: GetCategoryData, categoryUrl: string): string {
    return JSON.stringify(generateCategoryJsonLd(data, categoryUrl));
}
