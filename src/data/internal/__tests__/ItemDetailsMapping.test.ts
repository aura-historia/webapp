import { describe, expect, it } from "vitest";
import type { PersonalizedGetItemData } from "@/client";
import {
    type ItemCreatedPayload,
    type ItemPriceChangedPayload,
    type ItemStateChangedPayload,
    mapToDetailItem,
} from "../ItemDetails";

describe("mapToDetailItem", () => {
    it("should map item without history", () => {
        const apiData: PersonalizedGetItemData = {
            item: {
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
            },
        };

        const result = mapToDetailItem(apiData);

        expect(result.itemId).toBe("item-123");
        expect(result.history).toBeUndefined();
    });

    it("should map state event correctly", () => {
        const apiData: PersonalizedGetItemData = {
            item: {
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
                        payload: {
                            oldState: "LISTED",
                            newState: "AVAILABLE",
                        },
                        timestamp: "2023-01-01T10:00:00Z",
                    },
                ],
            },
        };

        const result = mapToDetailItem(apiData);

        expect(result.history).toHaveLength(1);

        const firstEvent = result.history?.[0];
        expect(firstEvent?.eventType).toBe("STATE_AVAILABLE");

        const payload = firstEvent?.payload as ItemStateChangedPayload;
        expect(payload.oldState).toBe("LISTED");
        expect(payload.newState).toBe("AVAILABLE");
        expect(firstEvent?.timestamp).toEqual(new Date("2023-01-01T10:00:00Z"));
    });

    it("should map price event correctly", () => {
        const apiData: PersonalizedGetItemData = {
            item: {
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
                        payload: {
                            oldPrice: { amount: 1000, currency: "EUR" },
                            newPrice: { amount: 900, currency: "EUR" },
                        },
                        timestamp: "2023-01-02T10:00:00Z",
                    },
                ],
            },
        };

        const result = mapToDetailItem(apiData);

        expect(result.history).toHaveLength(1);

        const firstEvent = result.history?.[0];
        expect(firstEvent?.eventType).toBe("PRICE_DROPPED");
        expect(typeof firstEvent?.payload).toBe("object");

        const payload = firstEvent?.payload as ItemPriceChangedPayload;
        expect(payload.oldPrice.amount).toBe(1000);
        expect(payload.newPrice.amount).toBe(900);
        expect(payload.newPrice.currency).toBe("EUR");
    });

    it("should map created event correctly", () => {
        const apiData: PersonalizedGetItemData = {
            item: {
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
            },
        };

        const result = mapToDetailItem(apiData);

        expect(result.history).toHaveLength(1);

        const firstEvent = result.history?.[0];
        expect(firstEvent?.eventType).toBe("CREATED");

        const payload = firstEvent?.payload as ItemCreatedPayload;
        expect(payload.state).toBe("LISTED");
        expect(payload.price?.amount).toBe(1000);
        expect(payload.price?.currency).toBe("EUR");
    });

    it("should map created event without price", () => {
        const apiData: PersonalizedGetItemData = {
            item: {
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
            },
        };

        const result = mapToDetailItem(apiData);

        expect(result.history).toHaveLength(1);

        const firstEvent = result.history?.[0];
        const payload = firstEvent?.payload as ItemCreatedPayload;
        expect(payload.state).toBe("LISTED");
        expect(payload.price).toBeUndefined();
    });

    it("should map multiple events in correct order", () => {
        const apiData: PersonalizedGetItemData = {
            item: {
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
                        payload: {
                            oldState: "LISTED",
                            newState: "AVAILABLE",
                        },
                        timestamp: "2023-01-01T10:00:00Z",
                    },
                    {
                        eventType: "PRICE_DROPPED",
                        itemId: "item-123",
                        eventId: "event-2",
                        shopId: "shop-789",
                        shopsItemId: "shop-item-101",
                        payload: {
                            oldPrice: { amount: 1000, currency: "EUR" },
                            newPrice: { amount: 800, currency: "EUR" },
                        },
                        timestamp: "2023-01-02T10:00:00Z",
                    },
                    {
                        eventType: "STATE_SOLD",
                        itemId: "item-123",
                        eventId: "event-3",
                        shopId: "shop-789",
                        shopsItemId: "shop-item-101",
                        payload: {
                            oldState: "AVAILABLE",
                            newState: "SOLD",
                        },
                        timestamp: "2023-01-03T10:00:00Z",
                    },
                ],
            },
        };

        const result = mapToDetailItem(apiData);

        expect(result.history).toHaveLength(4);
        expect(result.history?.[0]?.eventType).toBe("CREATED");
        expect(result.history?.[1]?.eventType).toBe("STATE_AVAILABLE");
        expect(result.history?.[2]?.eventType).toBe("PRICE_DROPPED");
        expect(result.history?.[3]?.eventType).toBe("STATE_SOLD");
    });
});
