import { describe, expect, it } from "vitest";
import type { GetItemData } from "@/client";
import { mapToDetailItem } from "../ItemDetails";

describe("mapToDetailItem", () => {
    it("should map item without history", () => {
        const apiData: GetItemData = {
            itemId: "item-123",
            eventId: "event-456",
            shopId: "shop-789",
            shopsItemId: "shop-item-101",
            shopName: "Test Shop",
            title: { text: "Test Item", language: "de" },
            price: { amount: 1000, currency: "EUR" },
            state: "AVAILABLE",
            url: "https://example.com/item",
            images: [],
            created: "2023-01-01T00:00:00Z",
            updated: "2023-01-02T00:00:00Z",
            history: undefined,
        };

        const result = mapToDetailItem(apiData);

        expect(result.itemId).toBe("item-123");
        expect(result.history).toBeUndefined();
    });

    it("should map state event correctly", () => {
        const apiData: GetItemData = {
            itemId: "item-123",
            eventId: "event-456",
            shopId: "shop-789",
            shopsItemId: "shop-item-101",
            shopName: "Test Shop",
            title: { text: "Test Item", language: "de" },
            price: { amount: 1000, currency: "EUR" },
            state: "AVAILABLE",
            url: "https://example.com/item",
            images: [],
            created: "2023-01-01T00:00:00Z",
            updated: "2023-01-02T00:00:00Z",
            history: [
                {
                    eventType: "STATE_AVAILABLE",
                    itemId: "item-123",
                    eventId: "event-1",
                    shopId: "shop-789",
                    shopsItemId: "shop-item-101",
                    payload: "AVAILABLE",
                    timestamp: "2023-01-01T10:00:00Z",
                },
            ],
        };

        const result = mapToDetailItem(apiData);

        expect(result.history).toHaveLength(1);
        expect(result.history![0].eventType).toBe("STATE_AVAILABLE");
        expect(result.history![0].payload).toBe("AVAILABLE");
        expect(result.history![0].timestamp).toEqual(new Date("2023-01-01T10:00:00Z"));
    });

    it("should map price event correctly", () => {
        const apiData: GetItemData = {
            itemId: "item-123",
            eventId: "event-456",
            shopId: "shop-789",
            shopsItemId: "shop-item-101",
            shopName: "Test Shop",
            title: { text: "Test Item", language: "de" },
            price: { amount: 1000, currency: "EUR" },
            state: "AVAILABLE",
            url: "https://example.com/item",
            images: [],
            created: "2023-01-01T00:00:00Z",
            updated: "2023-01-02T00:00:00Z",
            history: [
                {
                    eventType: "PRICE_DROPPED",
                    itemId: "item-123",
                    eventId: "event-2",
                    shopId: "shop-789",
                    shopsItemId: "shop-item-101",
                    payload: { amount: 900, currency: "EUR" },
                    timestamp: "2023-01-02T10:00:00Z",
                },
            ],
        };

        const result = mapToDetailItem(apiData);

        expect(result.history).toHaveLength(1);
        expect(result.history![0].eventType).toBe("PRICE_DROPPED");
        expect(typeof result.history![0].payload).toBe("object");
        expect((result.history![0].payload as any).amount).toBe(900);
        expect((result.history![0].payload as any).currency).toBe("EUR");
    });

    it("should map created event correctly", () => {
        const apiData: GetItemData = {
            itemId: "item-123",
            eventId: "event-456",
            shopId: "shop-789",
            shopsItemId: "shop-item-101",
            shopName: "Test Shop",
            title: { text: "Test Item", language: "de" },
            price: { amount: 1000, currency: "EUR" },
            state: "LISTED",
            url: "https://example.com/item",
            images: [],
            created: "2023-01-01T00:00:00Z",
            updated: "2023-01-02T00:00:00Z",
            history: [
                {
                    eventType: "CREATED",
                    itemId: "item-123",
                    eventId: "event-0",
                    shopId: "shop-789",
                    shopsItemId: "shop-item-101",
                    payload: {
                        state: "LISTED",
                        price: { amount: 1000, currency: "EUR" },
                    },
                    timestamp: "2023-01-01T08:00:00Z",
                },
            ],
        };

        const result = mapToDetailItem(apiData);

        expect(result.history).toHaveLength(1);
        expect(result.history![0].eventType).toBe("CREATED");
        const payload = result.history![0].payload as any;
        expect(payload.state).toBe("LISTED");
        expect(payload.price.amount).toBe(1000);
        expect(payload.price.currency).toBe("EUR");
    });

    it("should map created event without price", () => {
        const apiData: GetItemData = {
            itemId: "item-123",
            eventId: "event-456",
            shopId: "shop-789",
            shopsItemId: "shop-item-101",
            shopName: "Test Shop",
            title: { text: "Test Item", language: "de" },
            state: "LISTED",
            url: "https://example.com/item",
            images: [],
            created: "2023-01-01T00:00:00Z",
            updated: "2023-01-02T00:00:00Z",
            history: [
                {
                    eventType: "CREATED",
                    itemId: "item-123",
                    eventId: "event-0",
                    shopId: "shop-789",
                    shopsItemId: "shop-item-101",
                    payload: {
                        state: "LISTED",
                    },
                    timestamp: "2023-01-01T08:00:00Z",
                },
            ],
        };

        const result = mapToDetailItem(apiData);

        expect(result.history).toHaveLength(1);
        const payload = result.history![0].payload as any;
        expect(payload.state).toBe("LISTED");
        expect(payload.price).toBeUndefined();
    });

    it("should map multiple events in correct order", () => {
        const apiData: GetItemData = {
            itemId: "item-123",
            eventId: "event-456",
            shopId: "shop-789",
            shopsItemId: "shop-item-101",
            shopName: "Test Shop",
            title: { text: "Test Item", language: "de" },
            price: { amount: 800, currency: "EUR" },
            state: "SOLD",
            url: "https://example.com/item",
            images: [],
            created: "2023-01-01T00:00:00Z",
            updated: "2023-01-03T00:00:00Z",
            history: [
                {
                    eventType: "CREATED",
                    itemId: "item-123",
                    eventId: "event-0",
                    shopId: "shop-789",
                    shopsItemId: "shop-item-101",
                    payload: { state: "LISTED", price: { amount: 1000, currency: "EUR" } },
                    timestamp: "2023-01-01T08:00:00Z",
                },
                {
                    eventType: "STATE_AVAILABLE",
                    itemId: "item-123",
                    eventId: "event-1",
                    shopId: "shop-789",
                    shopsItemId: "shop-item-101",
                    payload: "AVAILABLE",
                    timestamp: "2023-01-01T10:00:00Z",
                },
                {
                    eventType: "PRICE_DROPPED",
                    itemId: "item-123",
                    eventId: "event-2",
                    shopId: "shop-789",
                    shopsItemId: "shop-item-101",
                    payload: { amount: 800, currency: "EUR" },
                    timestamp: "2023-01-02T10:00:00Z",
                },
                {
                    eventType: "STATE_SOLD",
                    itemId: "item-123",
                    eventId: "event-3",
                    shopId: "shop-789",
                    shopsItemId: "shop-item-101",
                    payload: "SOLD",
                    timestamp: "2023-01-03T10:00:00Z",
                },
            ],
        };

        const result = mapToDetailItem(apiData);

        expect(result.history).toHaveLength(4);
        expect(result.history![0].eventType).toBe("CREATED");
        expect(result.history![1].eventType).toBe("STATE_AVAILABLE");
        expect(result.history![2].eventType).toBe("PRICE_DROPPED");
        expect(result.history![3].eventType).toBe("STATE_SOLD");
    });
});
