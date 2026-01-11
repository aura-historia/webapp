import type { ProductImageData } from "@/client";

export type ProductImage = {
    url?: URL;
    prohibitedContentType: ProhibitedContentType;
};

type ProhibitedContentType = "UNKNOWN" | "NONE" | "NAZI_GERMANY";

export function mapToInternalProductImage(apiData: ProductImageData): ProductImage | undefined {
    if (!URL.canParse(apiData.url)) return undefined;

    return {
        url: URL.parse(apiData.url) ?? undefined,
        prohibitedContentType: parseProhibitedContentType(apiData.prohibitedContent),
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
