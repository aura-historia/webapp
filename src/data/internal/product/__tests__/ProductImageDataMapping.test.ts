import { describe, expect, it } from "vitest";
import type { ProductImageData } from "@/client";
import {
    mapToInternalProductImage,
    isRestrictedImage,
    sortImagesRestrictedLast,
    type ProductImage,
} from "../ProductImageData.ts";

describe("mapToInternalProductImage", () => {
    describe("URL parsing", () => {
        it("should return undefined for invalid URL", () => {
            const apiData: ProductImageData = {
                url: "not-a-valid-url",
                prohibitedContent: "NONE",
            };

            const result = mapToInternalProductImage(apiData);

            expect(result).toBeUndefined();
        });

        it("should return ProductImage without url for empty URL", () => {
            const apiData: ProductImageData = {
                url: "",
                prohibitedContent: "NONE",
            };

            const result = mapToInternalProductImage(apiData);

            expect(result).toBeDefined();
            expect(result?.url).toBeUndefined();
            expect(result?.prohibitedContentType).toBe("NONE");
        });

        it("should parse valid HTTP URL", () => {
            const apiData: ProductImageData = {
                url: "http://example.com/image.jpg",
                prohibitedContent: "NONE",
            };

            const result = mapToInternalProductImage(apiData);

            expect(result).toBeDefined();
            expect(result?.url?.href).toBe("http://example.com/image.jpg");
        });

        it("should parse valid HTTPS URL", () => {
            const apiData: ProductImageData = {
                url: "https://example.com/images/product-123.png",
                prohibitedContent: "NONE",
            };

            const result = mapToInternalProductImage(apiData);

            expect(result).toBeDefined();
            expect(result?.url?.href).toBe("https://example.com/images/product-123.png");
        });

        it("should parse URL with query parameters", () => {
            const apiData: ProductImageData = {
                url: "https://cdn.example.com/image.jpg?width=800&quality=90",
                prohibitedContent: "NONE",
            };

            const result = mapToInternalProductImage(apiData);

            expect(result).toBeDefined();
            expect(result?.url?.hostname).toBe("cdn.example.com");
            expect(result?.url?.searchParams.get("width")).toBe("800");
            expect(result?.url?.searchParams.get("quality")).toBe("90");
        });
    });

    describe("prohibitedContentType parsing", () => {
        it("should map 'NONE' prohibited content correctly", () => {
            const apiData: ProductImageData = {
                url: "https://example.com/image.jpg",
                prohibitedContent: "NONE",
            };

            const result = mapToInternalProductImage(apiData);

            expect(result?.prohibitedContentType).toBe("NONE");
        });

        it("should map 'NAZI_GERMANY' prohibited content correctly", () => {
            const apiData: ProductImageData = {
                url: "https://example.com/image.jpg",
                prohibitedContent: "NAZI_GERMANY",
            };

            const result = mapToInternalProductImage(apiData);

            expect(result?.prohibitedContentType).toBe("NAZI_GERMANY");
        });

        it("should map lowercase 'none' to 'NONE'", () => {
            const apiData: ProductImageData = {
                url: "https://example.com/image.jpg",
                prohibitedContent: "none" as ProductImageData["prohibitedContent"],
            };

            const result = mapToInternalProductImage(apiData);

            expect(result?.prohibitedContentType).toBe("NONE");
        });

        it("should map lowercase 'nazi_germany' to 'NAZI_GERMANY'", () => {
            const apiData: ProductImageData = {
                url: "https://example.com/image.jpg",
                prohibitedContent: "nazi_germany" as ProductImageData["prohibitedContent"],
            };

            const result = mapToInternalProductImage(apiData);

            expect(result?.prohibitedContentType).toBe("NAZI_GERMANY");
        });

        it("should map unknown content type to 'UNKNOWN'", () => {
            const apiData: ProductImageData = {
                url: "https://example.com/image.jpg",
                prohibitedContent: "SOME_OTHER_TYPE" as ProductImageData["prohibitedContent"],
            };

            const result = mapToInternalProductImage(apiData);

            expect(result?.prohibitedContentType).toBe("UNKNOWN");
        });

        it("should map undefined content type to 'UNKNOWN'", () => {
            const apiData: ProductImageData = {
                url: "https://example.com/image.jpg",
                prohibitedContent: undefined as unknown as ProductImageData["prohibitedContent"],
            };

            const result = mapToInternalProductImage(apiData);

            expect(result?.prohibitedContentType).toBe("UNKNOWN");
        });
    });

    describe("complete mapping", () => {
        it("should correctly map a complete ProductImageData object", () => {
            const apiData: ProductImageData = {
                url: "https://shop.example.com/products/antique-vase.jpg",
                prohibitedContent: "NONE",
            };

            const result = mapToInternalProductImage(apiData);

            expect(result).toEqual({
                url: new URL("https://shop.example.com/products/antique-vase.jpg"),
                prohibitedContentType: "NONE",
            });
        });

        it("should handle CDN URLs with complex paths", () => {
            const apiData: ProductImageData = {
                url: "https://cdn.example.com/shops/shop-123/products/item-456/images/main.webp",
                prohibitedContent: "NONE",
            };

            const result = mapToInternalProductImage(apiData);

            expect(result).toBeDefined();
            expect(result?.url?.pathname).toBe(
                "/shops/shop-123/products/item-456/images/main.webp",
            );
            expect(result?.prohibitedContentType).toBe("NONE");
        });
    });

    describe("missing URL (prohibited content)", () => {
        it("should return ProductImage with undefined url when url is not provided", () => {
            const apiData: ProductImageData = {
                prohibitedContent: "NAZI_GERMANY",
            };

            const result = mapToInternalProductImage(apiData);

            expect(result).toBeDefined();
            expect(result?.url).toBeUndefined();
            expect(result?.prohibitedContentType).toBe("NAZI_GERMANY");
        });

        it("should return ProductImage with undefined url when url is undefined", () => {
            const apiData: ProductImageData = {
                url: undefined,
                prohibitedContent: "UNKNOWN",
            };

            const result = mapToInternalProductImage(apiData);

            expect(result).toBeDefined();
            expect(result?.url).toBeUndefined();
            expect(result?.prohibitedContentType).toBe("UNKNOWN");
        });
    });
});

describe("isRestrictedImage", () => {
    it("should return true for images without URL", () => {
        const image: ProductImage = {
            url: undefined,
            prohibitedContentType: "NAZI_GERMANY",
        };

        expect(isRestrictedImage(image)).toBe(true);
    });

    it("should return false for images with URL", () => {
        const image: ProductImage = {
            url: new URL("https://example.com/image.jpg"),
            prohibitedContentType: "NONE",
        };

        expect(isRestrictedImage(image)).toBe(false);
    });

    it("should return false for images with URL and prohibited content type", () => {
        const image: ProductImage = {
            url: new URL("https://example.com/image.jpg"),
            prohibitedContentType: "NAZI_GERMANY",
        };

        expect(isRestrictedImage(image)).toBe(false);
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

        const sorted = sortImagesRestrictedLast(images);

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

        const sorted = sortImagesRestrictedLast(images);

        expect(sorted[0].url?.href).toBe("https://example.com/a.jpg");
        expect(sorted[1].url?.href).toBe("https://example.com/b.jpg");
    });

    it("should not modify the original array", () => {
        const images: ProductImage[] = [
            { url: undefined, prohibitedContentType: "NAZI_GERMANY" },
            { url: new URL("https://example.com/image.jpg"), prohibitedContentType: "NONE" },
        ];

        sortImagesRestrictedLast(images);

        expect(images[0].url).toBeUndefined();
        expect(images[1].url?.href).toBe("https://example.com/image.jpg");
    });

    it("should handle empty array", () => {
        expect(sortImagesRestrictedLast([])).toEqual([]);
    });

    it("should handle array with only restricted images", () => {
        const images: ProductImage[] = [
            { url: undefined, prohibitedContentType: "NAZI_GERMANY" },
            { url: undefined, prohibitedContentType: "UNKNOWN" },
        ];

        const sorted = sortImagesRestrictedLast(images);

        expect(sorted).toHaveLength(2);
        expect(sorted[0].url).toBeUndefined();
        expect(sorted[1].url).toBeUndefined();
    });
});
