import { describe, expect, it } from "vitest";
import type { ProductImageData } from "@/client";
import { mapToInternalProductImage } from "../ProductImageData";

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

        it("should return undefined for empty URL", () => {
            const apiData: ProductImageData = {
                url: "",
                prohibitedContent: "NONE",
            };

            const result = mapToInternalProductImage(apiData);

            expect(result).toBeUndefined();
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
});
