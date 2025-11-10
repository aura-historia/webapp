import type { PersonalizedGetItemData } from "@/client";
import { describe, expect, it } from "vitest";
import { mapToInternalOverviewItem } from "../OverviewItem.ts";

describe("createListOverviewItem", () => {
    it("should create ListOverviewItem with valid data", () => {
        const apiData: PersonalizedGetItemData = {
            item: {
                itemId: "item-123",
                eventId: "event-456",
                shopId: "shop-789",
                shopsItemId: "shop-item-101",
                shopName: "Antique Shop",
                title: { text: "Vintage Vase", language: "de" },
                description: { text: "Beautiful vintage vase", language: "de" },
                price: { amount: 1099, currency: "USD" },
                state: "AVAILABLE",
                url: "https://example.com/item",
                images: ["https://example.com/image1.jpg"],
                created: "2023-01-01T00:00:00Z",
                updated: "2023-01-02T00:00:00Z",
            },
        };

        const result = mapToInternalOverviewItem(apiData);

        expect(result.itemId).toBe("item-123");
        expect(result.eventId).toBe("event-456");
        expect(result.shopId).toBe("shop-789");
        expect(result.shopsItemId).toBe("shop-item-101");
        expect(result.shopName).toBe("Antique Shop");
        expect(result.title).toBe("Vintage Vase");
        expect(result.description).toBe("Beautiful vintage vase");
        expect(result.price).toBe("$10.99");
        expect(result.state).toBe("AVAILABLE");
        expect(result.url?.href).toBe("https://example.com/item");
        expect(result.images[0].href).toEqual("https://example.com/image1.jpg");
        expect(result.created.getTime()).toBe(new Date("2023-01-01T00:00:00Z").getTime());
        expect(result.updated.getTime()).toBe(new Date("2023-01-02T00:00:00Z").getTime());
    });

    it("should handle missing fields", () => {
        const apiData: PersonalizedGetItemData = {
            item: {
                itemId: "item-123",
                eventId: "event-456",
                shopId: "shop-789",
                shopsItemId: "shop-item-101",
                shopName: "Antique Shop",
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

        const result = mapToInternalOverviewItem(apiData);

        expect(result.description).toBeUndefined();
        expect(result.url).toBeNull();
        expect(result.images).toEqual([]);
    });

    it("should contain an empty array for an invalid image url", () => {
        const apiData: PersonalizedGetItemData = {
            item: {
                itemId: "item-123",
                eventId: "event-456",
                shopId: "shop-789",
                shopsItemId: "shop-item-101",
                shopName: "Antique Shop",
                title: { text: "Rare Painting", language: "de" },
                price: { amount: 5000, currency: "USD" },
                state: "SOLD",
                url: "https://example.com/item",
                images: ["invalid-url"],
                created: "2023-01-01T00:00:00Z",
                updated: "2023-01-02T00:00:00Z",
            },
        };

        const result = mapToInternalOverviewItem(apiData);

        expect(result.images).toEqual([]);
    });

    it("should return an empty list for missing image fields", () => {
        const apiData: PersonalizedGetItemData = {
            item: {
                itemId: "item-123",
                eventId: "event-456",
                shopId: "shop-789",
                shopsItemId: "shop-item-101",
                shopName: "Antique Shop",
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

        const result = mapToInternalOverviewItem(apiData);

        expect(result.images).toEqual([]);
    });
});
