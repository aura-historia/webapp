import type { ProductImageData } from "@/client";

export type ProductImage = {
    url?: URL;
    prohibitedContentType: ProhibitedContentType;
};

type ProhibitedContentType = "UNKNOWN" | "NONE" | "NAZI_GERMANY";

export function isRestrictedImage(image: ProductImage): boolean {
    return image.url === undefined;
}

/**
 * Sorts images so that restricted images (without URL) appear last.
 */
export function sortImagesRestrictedLast(images: readonly ProductImage[]): readonly ProductImage[] {
    return [...images].sort((a, b) => {
        const aRestricted = isRestrictedImage(a) ? 1 : 0;
        const bRestricted = isRestrictedImage(b) ? 1 : 0;
        return aRestricted - bRestricted;
    });
}

export function mapToInternalProductImage(apiData: ProductImageData): ProductImage | undefined {
    const prohibitedContentType = parseProhibitedContentType(apiData.prohibitedContent);

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

function parseProhibitedContentType(contentType?: string): ProhibitedContentType {
    const uppercasedContentType = contentType?.toUpperCase() ?? "UNKNOWN";

    switch (uppercasedContentType) {
        case "NONE":
        case "NAZI_GERMANY":
            return uppercasedContentType;
        default:
            return "UNKNOWN";
    }
}
