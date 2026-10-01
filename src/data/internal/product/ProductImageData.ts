import type { ContentPolicyData, ProductListingImageData } from "@/client";

export type ProductImage = {
    url?: URL;
    prohibitedContentType: ProhibitedContentType;
};

type ProhibitedContentType = "UNKNOWN" | "NONE" | "NAZI_GERMANY";

export function isRestrictedImage(
    image: ProductImage,
    showUnassessedOrSensitiveContent: boolean,
): boolean {
    return (
        !image.url || (image.prohibitedContentType !== "NONE" && !showUnassessedOrSensitiveContent)
    );
}

/**
 * Sorts images so that restricted images (without URL) appear last.
 */
export function sortImagesRestrictedLast(
    images: readonly ProductImage[],
    showUnassessedOrSensitiveContent: boolean,
): readonly ProductImage[] {
    return [...images].sort((a, b) => {
        const aRestricted = isRestrictedImage(a, showUnassessedOrSensitiveContent) ? 1 : 0;
        const bRestricted = isRestrictedImage(b, showUnassessedOrSensitiveContent) ? 1 : 0;
        return aRestricted - bRestricted;
    });
}

/**
 * Filters out images that have a duplicate URL. Images without URLs are kept.
 */
export function filterDuplicateImages(images: readonly ProductImage[]): readonly ProductImage[] {
    const seenUrls = new Set<string>();
    return images.filter((image) => {
        if (!image.url) {
            return true;
        }

        const urlStr = image.url.href;
        if (seenUrls.has(urlStr)) {
            return false;
        }

        seenUrls.add(urlStr);
        return true;
    });
}

export function mapToInternalProductImage(
    apiData: ProductListingImageData,
    contentPolicy?: ContentPolicyData | null,
): ProductImage | undefined {
    const prohibitedContentType =
        contentPolicy?.decision === "ALLOWED"
            ? "NONE"
            : contentPolicy?.decision === "REQUIRES_CONSENT"
              ? contentPolicy.category
              : "UNKNOWN";

    if (!apiData.url) {
        return {
            url: undefined,
            prohibitedContentType,
        };
    }

    if (!URL.canParse(apiData.url)) return undefined;

    const url = URL.parse(apiData.url);
    if (!url) return undefined;

    return {
        url,
        prohibitedContentType,
    };
}
