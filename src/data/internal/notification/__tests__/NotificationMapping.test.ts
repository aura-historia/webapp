import { describe, expect, it } from "vitest";
import type { GetNotificationData, NotificationCollectionData } from "@/client";
import { mapToInternalNotification, mapToInternalNotificationCollection } from "../Notification.ts";

const mockWatchlistPriceChangeNotification: GetNotificationData = {
    originEventId: "origin-event-1",
    notificationId: "notif-1",
    seen: false,
    external: false,
    created: "2024-01-15T08:00:00Z",
    updated: "2024-06-20T12:30:00Z",
    payload: {
        type: "WATCHLIST",
        productId: "prod-1",
        shopId: "shop-1",
        shopsProductId: "shops-prod-1",
        shopSlugId: "antique-shop",
        productSlugId: "vintage-vase",
        shopName: "Antique Shop",
        title: { text: "Vintage Vase", language: "en" },
        image: null,
        watchlistPayload: {
            type: "PRICE_CHANGE",
            oldPrice: { amount: 10000, currency: "EUR" },
            newPrice: { amount: 8000, currency: "EUR" },
        },
    },
};

const mockWatchlistStateChangeNotification: GetNotificationData = {
    originEventId: "origin-event-2",
    notificationId: "notif-2",
    seen: true,
    external: true,
    created: "2024-02-10T09:00:00Z",
    updated: "2024-07-01T10:00:00Z",
    payload: {
        type: "WATCHLIST",
        productId: "prod-2",
        shopId: "shop-2",
        shopsProductId: "shops-prod-2",
        shopSlugId: "old-books",
        productSlugId: "rare-book",
        shopName: "Old Books",
        title: { text: "Rare Book", language: "en" },
        image: null,
        watchlistPayload: {
            type: "STATE_CHANGE",
            oldState: "AVAILABLE",
            newState: "SOLD",
        },
    },
};

const mockSearchFilterNotification: GetNotificationData = {
    originEventId: "origin-event-3",
    notificationId: "notif-3",
    seen: false,
    external: false,
    created: "2024-03-05T07:00:00Z",
    updated: "2024-08-15T11:00:00Z",
    payload: {
        type: "SEARCH_FILTER",
        productId: "prod-3",
        shopId: "shop-3",
        shopsProductId: "shops-prod-3",
        shopSlugId: "art-gallery",
        productSlugId: "baroque-painting",
        shopName: "Art Gallery",
        title: { text: "Baroque Painting", language: "en" },
        image: null,
        searchFilterPayload: {
            userSearchFilterId: "filter-abc",
            userSearchFilterName: "My Baroque Filter",
        },
    },
};

describe("mapToInternalNotification", () => {
    it("maps base fields correctly", () => {
        const result = mapToInternalNotification(mockWatchlistPriceChangeNotification);

        expect(result.originEventId).toBe("origin-event-1");
        expect(result.notificationId).toBe("notif-1");
        expect(result.seen).toBe(false);
        expect(result.external).toBe(false);
    });

    it("parses created and updated as Date objects", () => {
        const result = mapToInternalNotification(mockWatchlistPriceChangeNotification);

        expect(result.created).toBeInstanceOf(Date);
        expect(result.updated).toBeInstanceOf(Date);
        expect(result.created.toISOString()).toBe("2024-01-15T08:00:00.000Z");
        expect(result.updated.toISOString()).toBe("2024-06-20T12:30:00.000Z");
    });

    describe("WATCHLIST PRICE_CHANGE payload", () => {
        it("maps payload type to WATCHLIST", () => {
            const result = mapToInternalNotification(mockWatchlistPriceChangeNotification);
            expect(result.payload.type).toBe("WATCHLIST");
        });

        it("maps product fields correctly", () => {
            const result = mapToInternalNotification(mockWatchlistPriceChangeNotification);
            if (result.payload.type !== "WATCHLIST") throw new Error("wrong type");

            expect(result.payload.productId).toBe("prod-1");
            expect(result.payload.shopId).toBe("shop-1");
            expect(result.payload.shopName).toBe("Antique Shop");
            expect(result.payload.productTitle).toBe("Vintage Vase");
        });

        it("maps watchlistPayload type to PRICE_CHANGE", () => {
            const result = mapToInternalNotification(mockWatchlistPriceChangeNotification);
            if (result.payload.type !== "WATCHLIST") throw new Error("wrong type");

            expect(result.payload.watchlistPayload.type).toBe("PRICE_CHANGE");
        });

        it("maps old and new price", () => {
            const result = mapToInternalNotification(mockWatchlistPriceChangeNotification);
            if (result.payload.type !== "WATCHLIST") throw new Error("wrong type");
            if (result.payload.watchlistPayload.type !== "PRICE_CHANGE")
                throw new Error("wrong watchlist type");

            expect(result.payload.watchlistPayload.oldPrice?.amount).toBe(10000);
            expect(result.payload.watchlistPayload.newPrice?.amount).toBe(8000);
        });
    });

    describe("WATCHLIST STATE_CHANGE payload", () => {
        it("maps watchlistPayload type to STATE_CHANGE", () => {
            const result = mapToInternalNotification(mockWatchlistStateChangeNotification);
            if (result.payload.type !== "WATCHLIST") throw new Error("wrong type");

            expect(result.payload.watchlistPayload.type).toBe("STATE_CHANGE");
        });

        it("maps oldState and newState correctly", () => {
            const result = mapToInternalNotification(mockWatchlistStateChangeNotification);
            if (result.payload.type !== "WATCHLIST") throw new Error("wrong type");
            if (result.payload.watchlistPayload.type !== "STATE_CHANGE")
                throw new Error("wrong watchlist type");

            expect(result.payload.watchlistPayload.oldState).toBe("AVAILABLE");
            expect(result.payload.watchlistPayload.newState).toBe("SOLD");
        });
    });

    describe("SEARCH_FILTER payload", () => {
        it("maps payload type to SEARCH_FILTER", () => {
            const result = mapToInternalNotification(mockSearchFilterNotification);
            expect(result.payload.type).toBe("SEARCH_FILTER");
        });

        it("maps searchFilterId and searchFilterName correctly", () => {
            const result = mapToInternalNotification(mockSearchFilterNotification);
            if (result.payload.type !== "SEARCH_FILTER") throw new Error("wrong type");

            expect(result.payload.searchFilterId).toBe("filter-abc");
            expect(result.payload.searchFilterName).toBe("My Baroque Filter");
        });

        it("maps product fields correctly", () => {
            const result = mapToInternalNotification(mockSearchFilterNotification);
            if (result.payload.type !== "SEARCH_FILTER") throw new Error("wrong type");

            expect(result.payload.productTitle).toBe("Baroque Painting");
            expect(result.payload.shopName).toBe("Art Gallery");
        });
    });
});

describe("mapToInternalNotificationCollection", () => {
    const mockCollection: NotificationCollectionData = {
        items: [mockWatchlistPriceChangeNotification, mockSearchFilterNotification],
        size: 2,
        total: 5,
        searchAfter: "cursor-xyz",
    };

    it("maps all items in the collection", () => {
        const result = mapToInternalNotificationCollection(mockCollection);
        expect(result.items).toHaveLength(2);
    });

    it("maps size correctly", () => {
        const result = mapToInternalNotificationCollection(mockCollection);
        expect(result.size).toBe(2);
    });

    it("maps total correctly", () => {
        const result = mapToInternalNotificationCollection(mockCollection);
        expect(result.total).toBe(5);
    });

    it("maps searchAfter correctly", () => {
        const result = mapToInternalNotificationCollection(mockCollection);
        expect(result.searchAfter).toBe("cursor-xyz");
    });

    it("returns undefined for total when null", () => {
        const result = mapToInternalNotificationCollection({ ...mockCollection, total: null });
        expect(result.total).toBeUndefined();
    });

    it("returns undefined for searchAfter when null", () => {
        const result = mapToInternalNotificationCollection({
            ...mockCollection,
            searchAfter: null,
        });
        expect(result.searchAfter).toBeUndefined();
    });

    it("handles empty items array", () => {
        const result = mapToInternalNotificationCollection({ items: [], size: 0 });
        expect(result.items).toHaveLength(0);
    });
});
