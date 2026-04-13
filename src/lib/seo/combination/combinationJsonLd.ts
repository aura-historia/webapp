import { getCombinationDescription } from "@/lib/seo/combination/combinationDescription.ts";
import { BANNER_IMAGE_URL } from "@/lib/seo/seoConstants.ts";

type CombinationCollectionPageJsonLd = {
    "@context": "https://schema.org/";
    "@type": "CollectionPage";
    name: string;
    description: string;
    url: string;
    image: string;
};

export function generateCombinationJsonLd(
    name: string,
    slug: string,
    combinationUrl: string,
): CombinationCollectionPageJsonLd {
    const description = getCombinationDescription(slug);

    return {
        "@context": "https://schema.org/",
        "@type": "CollectionPage",
        name,
        description,
        url: combinationUrl,
        image: BANNER_IMAGE_URL,
    };
}

export function generateCombinationJsonLdScript(
    name: string,
    slug: string,
    combinationUrl: string,
): string {
    return JSON.stringify(generateCombinationJsonLd(name, slug, combinationUrl));
}
