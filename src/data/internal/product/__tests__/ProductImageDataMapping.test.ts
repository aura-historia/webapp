import type { ContentPolicyData } from "@/client";
import { describe, expect, it } from "vitest";
import {
    filterDuplicateImages,
    isRestrictedImage,
    mapToInternalProductImage,
    sortImagesRestrictedLast,
    type ProductImage,
} from "../ProductImageData.ts";

const SENSITIVE_CATEGORIES = ["NAZI_GERMANY", "NUDITY"] as const;

describe("isRestrictedImage", () => {
    it.each(["NONE", "UNKNOWN", ...SENSITIVE_CATEGORIES] as const)(
        "keeps redacted %s images hidden even when visibility is enabled",
        (prohibitedContentType) => {
            expect(isRestrictedImage({ prohibitedContentType }, true)).toBe(true);
        },
    );
    it.each(["UNKNOWN", ...SENSITIVE_CATEGORIES] as const)(
        "requires explicit visibility for %s content",
        (prohibitedContentType) => {
            const image = { url: new URL("https://example.com/image.jpg"), prohibitedContentType };
            expect(isRestrictedImage(image, false)).toBe(true);
            expect(isRestrictedImage(image, true)).toBe(false);
        },
    );
    it.each(SENSITIVE_CATEGORIES)("should return true for %s images without URL", (category) => {
        const image: ProductImage = {
            url: undefined,
            prohibitedContentType: category,
        };

        expect(isRestrictedImage(image, false)).toBe(true);
    });

    it("should return false for images with URL", () => {
        const image: ProductImage = {
            url: new URL("https://example.com/image.jpg"),
            prohibitedContentType: "NONE",
        };

        expect(isRestrictedImage(image, false)).toBe(false);
    });

    it.each(SENSITIVE_CATEGORIES)(
        "should return true for images with URL and %s content without the preference",
        (category) => {
            const image: ProductImage = {
                url: new URL("https://example.com/image.jpg"),
                prohibitedContentType: category,
            };

            expect(isRestrictedImage(image, false)).toBe(true);
        },
    );
});

describe("mapToInternalProductImage", () => {
    it("does not infer an assessment from the image URL", () => {
        expect(
            mapToInternalProductImage({ url: "https://example.com/image.jpg" })
                ?.prohibitedContentType,
        ).toBe("UNKNOWN");
    });
    it("maps listing-level allowed and sensitive assessments", () => {
        const image = { url: "https://example.com/image.jpg" };
        expect(
            mapToInternalProductImage(image, { decision: "ALLOWED" })?.prohibitedContentType,
        ).toBe("NONE");
    });
    it.each(SENSITIVE_CATEGORIES)(
        "maps a %s assessment and shows the image only with the preference",
        (category) => {
            const image = mapToInternalProductImage(
                { url: "https://example.com/image.jpg" },
                { decision: "REQUIRES_CONSENT", category },
            );

            expect(image?.prohibitedContentType).toBe(category);
            expect(image && isRestrictedImage(image, false)).toBe(true);
            expect(image && isRestrictedImage(image, true)).toBe(false);
        },
    );
    it("keeps an image hidden when the backend sends a category this client does not know", () => {
        const image = mapToInternalProductImage({ url: "https://example.com/image.jpg" }, {
            decision: "REQUIRES_CONSENT",
            category: "FUTURE_CATEGORY",
        } as unknown as ContentPolicyData);

        expect(image && isRestrictedImage(image, false)).toBe(true);
        expect(image && isRestrictedImage(image, true)).toBe(false);
    });
    it("preserves redaction without recovering a URL", () => {
        expect(mapToInternalProductImage({}, { decision: "ALLOWED" })?.url).toBeUndefined();
    });
    it("rejects malformed URLs", () => {
        expect(mapToInternalProductImage({ url: "invalid" })).toBeUndefined();
    });
});

describe("sortImagesRestrictedLast", () => {
    it("should place restricted images after normal images", () => {
        const images: ProductImage[] = [
            { url: undefined, prohibitedContentType: "NAZI_GERMANY" },
            { url: new URL("https://example.com/image1.jpg"), prohibitedContentType: "NONE" },
            { url: undefined, prohibitedContentType: "NUDITY" },
            { url: new URL("https://example.com/image2.jpg"), prohibitedContentType: "NONE" },
            { url: undefined, prohibitedContentType: "UNKNOWN" },
        ];

        const sorted = sortImagesRestrictedLast(images, false);

        expect(sorted[0].url?.href).toBe("https://example.com/image1.jpg");
        expect(sorted[1].url?.href).toBe("https://example.com/image2.jpg");
        expect(sorted.slice(2).map((image) => image.url)).toEqual([
            undefined,
            undefined,
            undefined,
        ]);
    });

    it("should place sensitive images with a URL last until the preference is enabled", () => {
        const images: ProductImage[] = [
            { url: new URL("https://example.com/nude.jpg"), prohibitedContentType: "NUDITY" },
            { url: new URL("https://example.com/plain.jpg"), prohibitedContentType: "NONE" },
        ];

        expect(sortImagesRestrictedLast(images, false).map((image) => image.url?.href)).toEqual([
            "https://example.com/plain.jpg",
            "https://example.com/nude.jpg",
        ]);
        expect(sortImagesRestrictedLast(images, true).map((image) => image.url?.href)).toEqual([
            "https://example.com/nude.jpg",
            "https://example.com/plain.jpg",
        ]);
    });

    it("should preserve order within same category", () => {
        const images: ProductImage[] = [
            { url: new URL("https://example.com/a.jpg"), prohibitedContentType: "NONE" },
            { url: new URL("https://example.com/b.jpg"), prohibitedContentType: "NONE" },
        ];

        const sorted = sortImagesRestrictedLast(images, false);

        expect(sorted[0].url?.href).toBe("https://example.com/a.jpg");
        expect(sorted[1].url?.href).toBe("https://example.com/b.jpg");
    });

    it("should not modify the original array", () => {
        const images: ProductImage[] = [
            { url: undefined, prohibitedContentType: "NAZI_GERMANY" },
            { url: new URL("https://example.com/image.jpg"), prohibitedContentType: "NONE" },
        ];

        sortImagesRestrictedLast(images, false);

        expect(images[0].url).toBeUndefined();
        expect(images[1].url?.href).toBe("https://example.com/image.jpg");
    });

    it("should handle empty array", () => {
        expect(sortImagesRestrictedLast([], false)).toEqual([]);
    });

    it("should handle array with only restricted images", () => {
        const images: ProductImage[] = [
            { url: undefined, prohibitedContentType: "NAZI_GERMANY" },
            { url: undefined, prohibitedContentType: "UNKNOWN" },
        ];

        const sorted = sortImagesRestrictedLast(images, false);

        expect(sorted).toHaveLength(2);
        expect(sorted[0].url).toBeUndefined();
        expect(sorted[1].url).toBeUndefined();
    });
});

describe("filterDuplicateImages", () => {
    it("should keep first image for a URL and remove later duplicates", () => {
        const images: ProductImage[] = [
            { url: new URL("https://example.com/image-a.jpg"), prohibitedContentType: "NONE" },
            { url: undefined, prohibitedContentType: "NAZI_GERMANY" },
            { url: new URL("https://example.com/image-b.jpg"), prohibitedContentType: "NONE" },
            { url: new URL("https://example.com/image-a.jpg"), prohibitedContentType: "NONE" },
            { url: undefined, prohibitedContentType: "UNKNOWN" },
        ];

        const filtered = filterDuplicateImages(images);

        expect(filtered).toEqual([images[0], images[1], images[2], images[4]]);
    });
});
