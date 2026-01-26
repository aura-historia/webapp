import type { PersonalizedGetProductData, WatchlistProductData } from "@/client";
import { describe, expect, it } from "vitest";
import {
    mapPersonalizedGetProductDataToOverviewProduct,
    mapWatchlistProductDataToOverviewProduct,
} from "../product/OverviewProduct.ts";

describe("OverviewProduct mappers", () => {
    describe("mapToInternalOverviewProduct", () => {
        it("should create OverviewProduct with valid data", () => {
            const apiData: PersonalizedGetProductData = {
                item: {
                    productId: "item-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    shopName: "Antique Shop",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Vintage Vase", language: "de" },
                    description: { text: "Beautiful vintage vase", language: "de" },
                    price: { amount: 1099, currency: "USD" },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [{ url: "https://example.com/image1.jpg", prohibitedContent: "NONE" }],
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
            expect(result.images[0].url.href).toEqual("https://example.com/image1.jpg");
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
                    shopName: "Antique Shop",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Vintage Vase", language: "de" },
                    description: undefined,
                    price: { amount: 2550, currency: "EUR" },
                    state: "LISTED",
                    url: "",
                    images: [],
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
                    shopName: "Antique Shop",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Rare Painting", language: "de" },
                    price: { amount: 5000, currency: "USD" },
                    state: "SOLD",
                    url: "https://example.com/item",
                    images: [{ url: "invalid-url", prohibitedContent: "NONE" }],
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
                    shopName: "Antique Shop",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Vintage Vase", language: "de" },
                    description: { text: "Beautiful vintage vase", language: "de" },
                    price: { amount: 1099, currency: "USD" },
                    state: "AVAILABLE",
                    url: "https://example.com/item",
                    images: [],
                    created: "2023-01-01T00:00:00Z",
                    updated: "2023-01-02T00:00:00Z",
                },
            };

            const result = mapPersonalizedGetProductDataToOverviewProduct(apiData, "de");

            expect(result.images).toEqual([]);
        });
    });

    describe("mapWatchlistToOverview", () => {
        it("should create OverviewProduct from WatchlistProductData", () => {
            const apiData: WatchlistProductData = {
                product: {
                    productId: "item-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    shopName: "Watchlist Shop",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Watched Item", language: "de" },
                    description: { text: "Item on watchlist", language: "de" },
                    price: { amount: 2500, currency: "EUR" },
                    state: "AVAILABLE",
                    url: "https://example.com/watchlist-item",
                    images: [{ url: "https://example.com/image1.jpg", prohibitedContent: "NONE" }],
                    created: "2023-01-01T00:00:00Z",
                    updated: "2023-01-02T00:00:00Z",
                },
                notifications: true,
                created: "2023-01-03T00:00:00Z",
                updated: "2023-01-04T00:00:00Z",
            };

            const result = mapWatchlistProductDataToOverviewProduct(apiData, "en");

            expect(result.productId).toBe("item-123");
            expect(result.shopName).toBe("Watchlist Shop");
            expect(result.title).toBe("Watched Item");
            expect(result.price).toBe("€25.00");
            expect(result.userData?.watchlistData.isWatching).toBe(true);
            expect(result.userData?.watchlistData.isNotificationEnabled).toBe(true);
        });

        it("should handle watchlist item with notifications disabled", () => {
            const apiData: WatchlistProductData = {
                product: {
                    productId: "item-789",
                    eventId: "event-999",
                    shopId: "shop-555",
                    shopsProductId: "shop-item-202",
                    shopName: "Test Shop",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Test Item", language: "en" },
                    price: { amount: 1000, currency: "USD" },
                    state: "LISTED",
                    url: "https://example.com/test",
                    images: [],
                    created: "2023-01-01T00:00:00Z",
                    updated: "2023-01-02T00:00:00Z",
                },
                notifications: false,
                created: "2023-01-03T00:00:00Z",
                updated: "2023-01-04T00:00:00Z",
            };

            const result = mapWatchlistProductDataToOverviewProduct(apiData, "de");

            expect(result.userData?.watchlistData.isWatching).toBe(true);
            expect(result.userData?.watchlistData.isNotificationEnabled).toBe(false);
        });

        it("should handle missing optional fields", () => {
            const apiData: WatchlistProductData = {
                product: {
                    productId: "item-123",
                    eventId: "event-456",
                    shopId: "shop-789",
                    shopsProductId: "shop-item-101",
                    shopName: "Shop",
                    shopType: "AUCTION_HOUSE",
                    title: { text: "Item", language: "de" },
                    description: null,
                    price: null,
                    state: "REMOVED",
                    url: "",
                    images: [],
                    created: "2023-01-01T00:00:00Z",
                    updated: "2023-01-02T00:00:00Z",
                },
                notifications: false,
                created: "2023-01-03T00:00:00Z",
                updated: "2023-01-04T00:00:00Z",
            };

            const result = mapWatchlistProductDataToOverviewProduct(apiData, "de");

            expect(result.description).toBeUndefined();
            expect(result.price).toBeUndefined();
            expect(result.url).toBeNull();
            expect(result.images).toEqual([]);
        });
    });
});
