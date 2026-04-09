import type { GetPeriodData } from "@/client";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";

type PeriodCollectionPageJsonLd = {
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
 * for a period page. Represents the period as a curated collection of antique items.
 */
export function generatePeriodJsonLd(
    data: GetPeriodData,
    periodUrl: string,
): PeriodCollectionPageJsonLd {
    // TODO: Load from i18n depending on period id
    const description = "";

    return {
        "@context": "https://schema.org/",
        "@type": "CollectionPage",
        name: data.name.text,
        description: description,
        url: periodUrl,
        image: BANNER_IMAGE_URL,
        dateCreated: data.created,
        dateModified: data.updated,
    };
}

/**
 * Serialises the period JSON-LD to a string suitable for embedding in a
 * `<script type="application/ld+json">` tag.
 */
export function generatePeriodJsonLdScript(data: GetPeriodData, periodUrl: string): string {
    return JSON.stringify(generatePeriodJsonLd(data, periodUrl));
}
