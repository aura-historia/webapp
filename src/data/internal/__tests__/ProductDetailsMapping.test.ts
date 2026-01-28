import { describe, expect, it } from "vitest";
import type { PersonalizedGetProductData, GetProductEventData } from "@/client";
import {
    type ProductCreatedPayload,
    type ProductPriceChangedPayload,
    type ProductStateChangedPayload,
    mapToDetailProduct,
} from "../product/ProductDetails.ts";

describe("mapToDetailProduct", () => {
    it("should map product without history", () => {
        const apiData: PersonalizedGetProductData = {
            item: {
                productId: "item-123",
                eventId: "event-456",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                productSlugId: "test-product-slug",
                shopSlugId: "test-shop-slug",
                shopName: "Test Shop",
                shopType: "AUCTION_HOUSE",
                title: { text: "Test Product", language: "de" },
                price: { amount: 1000, currency: "EUR" },
                state: "AVAILABLE",
                url: "https://example.com/item",
                images: [],
                created: "2023-01-01T00:00:00Z",
                updated: "2023-01-02T00:00:00Z",
            },
        };

        const result = mapToDetailProduct(apiData, undefined, "de");

        expect(result.productId).toBe("item-123");
        expect(result.history).toBeUndefined();
    });

    it("should map state event correctly", () => {
        const historyData: GetProductEventData[] = [
            {
                eventType: "STATE_AVAILABLE",
                productId: "item-123",
                eventId: "event-1",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                payload: {
                    oldState: "LISTED" as const,
                    newState: "AVAILABLE" as const,
                },
                timestamp: "2023-01-01T10:00:00Z",
            },
        ];
        const apiData: PersonalizedGetProductData = {
            item: {
                productId: "item-123",
                eventId: "event-456",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                productSlugId: "test-product-slug",
                shopSlugId: "test-shop-slug",
                shopName: "Test Shop",
                shopType: "AUCTION_HOUSE",
                title: { text: "Test Product", language: "de" },
                price: { amount: 1000, currency: "EUR" },
                state: "AVAILABLE",
                url: "https://example.com/item",
                images: [],
                created: "2023-01-01T00:00:00Z",
                updated: "2023-01-02T00:00:00Z",
            },
        };

        const result = mapToDetailProduct(apiData, historyData, "de");

        expect(result.history).toHaveLength(1);

        const firstEvent = result.history?.[0];
        expect(firstEvent?.eventType).toBe("STATE_AVAILABLE");

        const payload = firstEvent?.payload as ProductStateChangedPayload;
        expect(payload.oldState).toBe("LISTED");
        expect(payload.newState).toBe("AVAILABLE");
        expect(firstEvent?.timestamp).toEqual(new Date("2023-01-01T10:00:00Z"));
    });

    it("should map price event correctly", () => {
        const historyData: GetProductEventData[] = [
            {
                eventType: "PRICE_DROPPED",
                productId: "item-123",
                eventId: "event-2",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                payload: {
                    oldPrice: { amount: 1000, currency: "EUR" },
                    newPrice: { amount: 900, currency: "EUR" },
                },
                timestamp: "2023-01-02T10:00:00Z",
            },
        ];
        const apiData: PersonalizedGetProductData = {
            item: {
                productId: "item-123",
                eventId: "event-456",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                productSlugId: "test-product-slug",
                shopSlugId: "test-shop-slug",
                shopName: "Test Shop",
                shopType: "AUCTION_HOUSE",
                title: { text: "Test Product", language: "de" },
                price: { amount: 1000, currency: "EUR" },
                state: "AVAILABLE",
                url: "https://example.com/item",
                images: [],
                created: "2023-01-01T00:00:00Z",
                updated: "2023-01-02T00:00:00Z",
            },
        };

        const result = mapToDetailProduct(apiData, historyData, "de");

        expect(result.history).toHaveLength(1);

        const firstEvent = result.history?.[0];
        expect(firstEvent?.eventType).toBe("PRICE_DROPPED");
        expect(typeof firstEvent?.payload).toBe("object");

        const payload = firstEvent?.payload as ProductPriceChangedPayload;
        expect(payload.oldPrice.amount).toBe(1000);
        expect(payload.newPrice.amount).toBe(900);
        expect(payload.newPrice.currency).toBe("EUR");
    });

    it("should map created event correctly", () => {
        const historyData: GetProductEventData[] = [
            {
                eventType: "CREATED",
                productId: "item-123",
                eventId: "event-0",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                payload: {
                    state: "LISTED" as const,
                    price: { amount: 1000, currency: "EUR" },
                },
                timestamp: "2023-01-01T08:00:00Z",
            },
        ];
        const apiData: PersonalizedGetProductData = {
            item: {
                productId: "item-123",
                eventId: "event-456",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                productSlugId: "test-product-slug",
                shopSlugId: "test-shop-slug",
                shopName: "Test Shop",
                shopType: "AUCTION_HOUSE",
                title: { text: "Test Product", language: "de" },
                price: { amount: 1000, currency: "EUR" },
                state: "LISTED",
                url: "https://example.com/item",
                images: [],
                created: "2023-01-01T00:00:00Z",
                updated: "2023-01-02T00:00:00Z",
            },
        };

        const result = mapToDetailProduct(apiData, historyData, "de");

        expect(result.history).toHaveLength(1);

        const firstEvent = result.history?.[0];
        expect(firstEvent?.eventType).toBe("CREATED");

        const payload = firstEvent?.payload as ProductCreatedPayload;
        expect(payload.state).toBe("LISTED");
        expect(payload.price?.amount).toBe(1000);
        expect(payload.price?.currency).toBe("EUR");
    });

    it("should map created event without price", () => {
        const historyData: GetProductEventData[] = [
            {
                eventType: "CREATED",
                productId: "item-123",
                eventId: "event-0",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                payload: {
                    state: "LISTED" as const,
                },
                timestamp: "2023-01-01T08:00:00Z",
            },
        ];
        const apiData: PersonalizedGetProductData = {
            item: {
                productId: "item-123",
                eventId: "event-456",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                productSlugId: "test-product-slug",
                shopSlugId: "test-shop-slug",
                shopName: "Test Shop",
                shopType: "AUCTION_HOUSE",
                title: { text: "Test Product", language: "de" },
                state: "LISTED",
                url: "https://example.com/item",
                images: [],
                created: "2023-01-01T00:00:00Z",
                updated: "2023-01-02T00:00:00Z",
            },
        };

        const result = mapToDetailProduct(apiData, historyData, "de");

        expect(result.history).toHaveLength(1);

        const firstEvent = result.history?.[0];
        const payload = firstEvent?.payload as ProductCreatedPayload;
        expect(payload.state).toBe("LISTED");
        expect(payload.price).toBeUndefined();
    });

    it("should map multiple events in correct order", () => {
        const historyData: GetProductEventData[] = [
            {
                eventType: "CREATED",
                productId: "item-123",
                eventId: "event-0",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                payload: { state: "LISTED" as const, price: { amount: 1000, currency: "EUR" } },
                timestamp: "2023-01-01T08:00:00Z",
            },
            {
                eventType: "STATE_AVAILABLE",
                productId: "item-123",
                eventId: "event-1",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                payload: {
                    oldState: "LISTED" as const,
                    newState: "AVAILABLE" as const,
                },
                timestamp: "2023-01-01T10:00:00Z",
            },
            {
                eventType: "PRICE_DROPPED",
                productId: "item-123",
                eventId: "event-2",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                payload: {
                    oldPrice: { amount: 1000, currency: "EUR" },
                    newPrice: { amount: 800, currency: "EUR" },
                },
                timestamp: "2023-01-02T10:00:00Z",
            },
            {
                eventType: "STATE_SOLD",
                productId: "item-123",
                eventId: "event-3",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                payload: {
                    oldState: "AVAILABLE" as const,
                    newState: "SOLD" as const,
                },
                timestamp: "2023-01-03T10:00:00Z",
            },
        ];
        const apiData: PersonalizedGetProductData = {
            item: {
                productId: "item-123",
                eventId: "event-456",
                shopId: "shop-789",
                shopsProductId: "shop-item-101",
                productSlugId: "test-product-slug",
                shopSlugId: "test-shop-slug",
                shopName: "Test Shop",
                shopType: "AUCTION_HOUSE",
                title: { text: "Test Product", language: "de" },
                price: { amount: 800, currency: "EUR" },
                state: "SOLD",
                url: "https://example.com/item",
                images: [],
                created: "2023-01-01T00:00:00Z",
                updated: "2023-01-03T00:00:00Z",
            },
        };

        const result = mapToDetailProduct(apiData, historyData, "de");

        expect(result.history).toHaveLength(4);
        expect(result.history?.[0]?.eventType).toBe("CREATED");
        expect(result.history?.[1]?.eventType).toBe("STATE_AVAILABLE");
        expect(result.history?.[2]?.eventType).toBe("PRICE_DROPPED");
        expect(result.history?.[3]?.eventType).toBe("STATE_SOLD");
    });
});
