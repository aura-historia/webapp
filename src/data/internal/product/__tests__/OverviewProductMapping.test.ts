import type { PersonalizedGetProductData } from "@/client";
import { describe, expect, it } from "vitest";
import { mapPersonalizedGetProductDataToOverviewProduct } from "../OverviewProduct.ts";

describe("OverviewProduct mappers", () => {
    describe("mapToInternalOverviewProduct", () => {
        it("should create OverviewProduct with valid data", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "item-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Antique Shop",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Vintage Vase", language: "de" },
                    description: { text: "Beautiful vintage vase", language: "de" },
                    price: { offer: { amount: 1099, currency: "USD" } },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [{ url: "https://example.com/image1.jpg", prohibitedContent: "NONE" }],
                    authenticity: "UNKNOWN" as const,
                    condition: "UNKNOWN" as const,
                    provenance: "UNKNOWN" as const,
                    restoration: "UNKNOWN" as const,
                    created: "2023-01-01T00:00:00Z",
                    updated: "2023-01-02T00:00:00Z",
                },
            };

            const result = mapPersonalizedGetProductDataToOverviewProduct(apiData, "en");

            expect(result.productId).toBe("item-123");
            expect(result.eventId).toBe("event-456");
            expect(result.shopId).toBe("shop-789");
            expect(result.shopsProductId).toBe("shop-item-101");
            expect(result.shopName).toBe("Antique Shop");
            expect(result.title).toBe("Vintage Vase");
            expect(result.description).toBe("Beautiful vintage vase");
            expect(result.price).toBe("$10.99");
            expect(result.state).toBe("AVAILABLE");
            expect(result.url?.href).toBe("https://example.com/item");
            expect(result.images[0].url?.href).toEqual("https://example.com/image1.jpg");
            expect(result.created.getTime()).toBe(new Date("2023-01-01T00:00:00Z").getTime());
            expect(result.updated.getTime()).toBe(new Date("2023-01-02T00:00:00Z").getTime());
        });

        it("should handle missing fields", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "item-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Antique Shop",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Vintage Vase", language: "de" },
                    description: undefined,
                    price: { offer: { amount: 2550, currency: "EUR" } },
                    state: "LISTED",
                    url: "",
                    images: [],
                    authenticity: "UNKNOWN" as const,
                    condition: "UNKNOWN" as const,
                    provenance: "UNKNOWN" as const,
                    restoration: "UNKNOWN" as const,
                    created: "2023-01-01T00:00:00Z",
                    updated: "2023-01-02T00:00:00Z",
                },
            };

            const result = mapPersonalizedGetProductDataToOverviewProduct(apiData, "de");

            expect(result.description).toBeUndefined();
            expect(result.url).toBeNull();
            expect(result.images).toEqual([]);
        });

        it("should contain an empty array for an invalid image url", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "item-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Antique Shop",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Rare Painting", language: "de" },
                    price: { offer: { amount: 5000, currency: "USD" } },
                    state: "SOLD",
                    url: "https://example.com/item",
                    images: [{ url: "invalid-url", prohibitedContent: "NONE" }],
                    authenticity: "UNKNOWN" as const,
                    condition: "UNKNOWN" as const,
                    provenance: "UNKNOWN" as const,
                    restoration: "UNKNOWN" as const,
                    created: "2023-01-01T00:00:00Z",
                    updated: "2023-01-02T00:00:00Z",
                },
            };

            const result = mapPersonalizedGetProductDataToOverviewProduct(apiData, "de");

            expect(result.images).toEqual([]);
        });

        it("should return an empty list for missing image fields", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "item-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    productSlugId: "test-product-slug",
                    shopSlugId: "test-shop-slug",
                    shopName: "Antique Shop",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Vintage Vase", language: "de" },
                    description: { text: "Beautiful vintage vase", language: "de" },
                    price: { offer: { amount: 1099, currency: "USD" } },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [],
                    authenticity: "UNKNOWN" as const,
                    condition: "UNKNOWN" as const,
                    provenance: "UNKNOWN" as const,
                    restoration: "UNKNOWN" as const,
                    created: "2023-01-01T00:00:00Z",
                    updated: "2023-01-02T00:00:00Z",
                },
            };

            const result = mapPersonalizedGetProductDataToOverviewProduct(apiData, "de");

            expect(result.images).toEqual([]);
        });
    });
});
