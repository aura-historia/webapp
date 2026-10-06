import { describe, expect, it } from "vitest";
import {
    filterDuplicateImages,
    isRestrictedImage,
    mapToInternalProductImage,
    sortImagesRestrictedLast,
    type ProductImage,
} from "../ProductImageData.ts";

describe("isRestrictedImage", () => {
    it.each(["NONE", "UNKNOWN", "NAZI_GERMANY"] as const)(
        "keeps redacted %s images hidden even when visibility is enabled",
        (prohibitedContentType) => {
            expect(isRestrictedImage({ prohibitedContentType }, true)).toBe(true);
        },
    );
    it.each(["UNKNOWN", "NAZI_GERMANY"] as const)(
        "requires explicit visibility for %s content",
        (prohibitedContentType) => {
            const image = { url: new URL("https://example.com/image.jpg"), prohibitedContentType };
            expect(isRestrictedImage(image, false)).toBe(true);
            expect(isRestrictedImage(image, true)).toBe(false);
        },
    );
    it("should return true for images without URL", () => {
        const image: ProductImage = {
            url: undefined,
            prohibitedContentType: "NAZI_GERMANY",
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

    it("should return true for images with URL and prohibited content type", () => {
        const image: ProductImage = {
            url: new URL("https://example.com/image.jpg"),
            prohibitedContentType: "NAZI_GERMANY",
        };

        expect(isRestrictedImage(image, false)).toBe(true);
    });
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
        expect(
            mapToInternalProductImage(image, {
                decision: "REQUIRES_CONSENT",
                category: "NAZI_GERMANY",
            })?.prohibitedContentType,
        ).toBe("NAZI_GERMANY");
    });
    it("preserves redaction without recovering a URL", () => {
        expect(
            mapToInternalProductImage({ url: null }, { decision: "ALLOWED" })?.url,
        ).toBeUndefined();
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
            { url: undefined, prohibitedContentType: "UNKNOWN" },
            { url: new URL("https://example.com/image2.jpg"), prohibitedContentType: "NONE" },
        ];

        const sorted = sortImagesRestrictedLast(images, false);

        expect(sorted[0].url?.href).toBe("https://example.com/image1.jpg");
        expect(sorted[1].url?.href).toBe("https://example.com/image2.jpg");
        expect(sorted[2].url).toBeUndefined();
        expect(sorted[3].url).toBeUndefined();
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
