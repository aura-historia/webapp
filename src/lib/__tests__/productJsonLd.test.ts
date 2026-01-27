import { describe, expect, it } from "vitest";
import type { PersonalizedGetProductData, ProductStateData } from "@/client";
import { generateProductJsonLd, generateProductJsonLdScript } from "../productJsonLd.ts";

describe("productJsonLd", () => {
    describe("generateProductJsonLd", () => {
        it("should generate complete JSON-LD with all fields", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Antique Store",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Vintage Vase from 1920s", language: "en" },
                    description: {
                        text: "Beautiful Art Deco vase in excellent condition",
                        language: "en",
                    },
                    price: { amount: 15000, currency: "EUR" },
                    state: "AVAILABLE",
                    url: "https://example.com/products/vintage-vase",
                    images: [
                        {
                            url: "https://example.com/images/vase1.jpg",
                            prohibitedContent: "NONE",
                        },
                        {
                            url: "https://example.com/images/vase2.jpg",
                            prohibitedContent: "NONE",
                        },
                    ],
                    created: "2024-01-15T10:00:00Z",
                    updated: "2024-01-20T15:30:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result["@context"]).toBe("https://schema.org/");
            expect(result["@type"]).toBe("Product");
            expect(result.name).toBe("Vintage Vase from 1920s");
            expect(result.description).toBe("Beautiful Art Deco vase in excellent condition");
            expect(result.sku).toBe("shop-789-shop-item-101");
            expect(result.url).toBe("https://example.com/products/vintage-vase");
            expect(result.image).toEqual([
                "https://example.com/images/vase1.jpg",
                "https://example.com/images/vase2.jpg",
            ]);
            expect(result.category).toBe("Antiques");
        });

        it("should include offer details with InStock availability for AVAILABLE state", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Antique Dealer",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Antique Chair", language: "en" },
                    price: { amount: 25000, currency: "USD" },
                    state: "AVAILABLE",
                    url: "https://example.com/chair",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.offers).toBeDefined();
            expect(result.offers?.["@type"]).toBe("Offer");
            expect(result.offers?.priceCurrency).toBe("USD");
            expect(result.offers?.price).toBe(250.0);
            expect(result.offers?.availability).toBe("https://schema.org/InStock");
            expect(result.offers?.url).toBe("https://example.com/chair");
            expect(result.offers?.seller?.["@type"]).toBe("Organization");
            expect(result.offers?.seller?.name).toBe("Antique Dealer");
        });

        it("should include offer with InStock availability for LISTED state", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Auction House",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Rare Painting", language: "en" },
                    price: { amount: 500000, currency: "GBP" },
                    state: "LISTED",
                    url: "https://example.com/painting",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.offers?.availability).toBe("https://schema.org/InStock");
        });

        it("should include offer with LimitedAvailability for RESERVED state", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Antique Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Reserved Item", language: "en" },
                    price: { amount: 10000, currency: "EUR" },
                    state: "RESERVED",
                    url: "https://example.com/reserved",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.offers?.availability).toBe("https://schema.org/LimitedAvailability");
        });

        it("should include offer with SoldOut availability for SOLD state", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Auction House",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Sold Antique", language: "en" },
                    price: { amount: 75000, currency: "USD" },
                    state: "SOLD",
                    url: "https://example.com/sold",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.offers?.availability).toBe("https://schema.org/SoldOut");
        });

        it("should include offer with Discontinued availability for unknown state", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Dealer",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Discontinued Item", language: "en" },
                    price: { amount: 5000, currency: "EUR" },
                    state: "REMOVED" as unknown as ProductStateData,
                    url: "https://example.com/item",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.offers?.availability).toBe("https://schema.org/Discontinued");
        });

        it("should handle missing description", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Item Without Description", language: "en" },
                    description: undefined,
                    price: { amount: 1000, currency: "USD" },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.description).toBeUndefined();
        });

        it("should handle missing images", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Item Without Images", language: "en" },
                    price: { amount: 1000, currency: "USD" },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.image).toBeUndefined();
        });

        it("should handle empty images array", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Item With Empty Images", language: "en" },
                    price: { amount: 1000, currency: "USD" },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.image).toBeUndefined();
        });

        it("should filter out images with prohibited content", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Item With Mixed Images", language: "en" },
                    price: { amount: 1000, currency: "USD" },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [
                        {
                            url: "https://example.com/image1.jpg",
                            prohibitedContent: "NONE",
                        },
                        {
                            url: "https://example.com/image2.jpg",
                            prohibitedContent: "NAZI_GERMANY",
                        },
                        {
                            url: "https://example.com/image3.jpg",
                            prohibitedContent: "NONE",
                        },
                    ],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.image).toEqual([
                "https://example.com/image1.jpg",
                "https://example.com/image3.jpg",
            ]);
        });

        it("should handle missing URL", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Item Without URL", language: "en" },
                    price: { amount: 1000, currency: "USD" },
                    state: "AVAILABLE",
                    url: "",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.url).toBeUndefined();
            expect(result.offers?.url).toBe("");
        });

        it("should handle missing price", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Item Without Price", language: "en" },
                    price: undefined,
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.offers).toBeUndefined();
        });

        it("should correctly convert price from cents to currency units", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Test Price Item", language: "en" },
                    price: { amount: 12345, currency: "USD" },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.offers?.price).toBe(123.45);
        });

        it("should always include Antiques category", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Any Item", language: "en" },
                    price: { amount: 1000, currency: "USD" },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.category).toBe("Antiques");
        });

        it("should generate correct SKU from shopId and shopsProductId", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "my-shop-id",
                    shopsProductId: "product-xyz-789",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "SKU Test Item", language: "en" },
                    price: { amount: 1000, currency: "USD" },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLd(apiData);

            expect(result.sku).toBe("my-shop-id-product-xyz-789");
        });
    });

    describe("generateProductJsonLdScript", () => {
        it("should return valid JSON string", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Antique Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Test Item", language: "en" },
                    price: { amount: 5000, currency: "EUR" },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [
                        {
                            url: "https://example.com/image.jpg",
                            prohibitedContent: "NONE",
                        },
                    ],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLdScript(apiData);

            // Should be valid JSON
            expect(() => JSON.parse(result)).not.toThrow();

            // Parse and verify structure
            const parsed = JSON.parse(result);
            expect(parsed["@context"]).toBe("https://schema.org/");
            expect(parsed["@type"]).toBe("Product");
            expect(parsed.name).toBe("Test Item");
        });

        it("should match output of generateProductJsonLd when stringified", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Comparison Test", language: "en" },
                    description: { text: "Test description", language: "en" },
                    price: { amount: 10000, currency: "USD" },
                    state: "SOLD",
                    url: "https://example.com/test",
                    images: [
                        {
                            url: "https://example.com/img1.jpg",
                            prohibitedContent: "NONE",
                        },
                    ],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const jsonLd = generateProductJsonLd(apiData);
            const scriptContent = generateProductJsonLdScript(apiData);

            expect(scriptContent).toBe(JSON.stringify(jsonLd));
        });

        it("should produce compact JSON without extra whitespace", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "product-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Store",
                    shopType: "COMMERCIAL_DEALER",
                    title: { text: "Compact Test", language: "en" },
                    price: { amount: 1000, currency: "USD" },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [],
                    created: "2024-01-01T00:00:00Z",
                    updated: "2024-01-01T00:00:00Z",
                },
            };

            const result = generateProductJsonLdScript(apiData);

            // Should not contain unnecessary whitespace (no newlines or extra spaces)
            expect(result).not.toMatch(/\n/);
            expect(result).not.toMatch(/\s{2,}/);
        });
    });
});
