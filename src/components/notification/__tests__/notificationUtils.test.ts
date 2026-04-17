import { describe, expect, it } from "vitest";
import { getNotificationTypeLabel, getNotificationChangeParts } from "../notificationUtils.ts";
import type { NotificationPayload } from "@/data/internal/notification/Notification.ts";

const t = (key: string) => key;

const searchFilterPayload: NotificationPayload = {
    type: "SEARCH_FILTER",
    productId: "prod-1",
    shopId: "shop-1",
    shopsProductId: "shops-prod-1",
    shopSlugId: "art-gallery",
    productSlugId: "baroque-painting",
    shopName: "Art Gallery",
    productTitle: "Baroque Painting",
    searchFilterId: "filter-abc",
    searchFilterName: "My Filter",
};

const priceChangePayload: NotificationPayload = {
    type: "WATCHLIST",
    productId: "prod-2",
    shopId: "shop-2",
    shopsProductId: "shops-prod-2",
    shopSlugId: "antique-shop",
    productSlugId: "vintage-vase",
    shopName: "Antique Shop",
    productTitle: "Vintage Vase",
    watchlistPayload: {
        type: "PRICE_CHANGE",
        oldPrice: { amount: 10000, currency: "EUR" },
        newPrice: { amount: 8000, currency: "EUR" },
    },
};

const stateChangePayload: NotificationPayload = {
    type: "WATCHLIST",
    productId: "prod-3",
    shopId: "shop-3",
    shopsProductId: "shops-prod-3",
    shopSlugId: "old-books",
    productSlugId: "rare-book",
    shopName: "Old Books",
    productTitle: "Rare Book",
    watchlistPayload: {
        type: "STATE_CHANGE",
        oldState: "AVAILABLE",
        newState: "SOLD",
    },
};

const partnerApplicationApprovedPayload: NotificationPayload = {
    type: "PARTNER_APPLICATION",
    shopName: "Antique Shop",
    partnerApplicationPayload: { type: "APPROVED", partnerApplicationId: "pa-1" },
};

const partnerApplicationRejectedPayload: NotificationPayload = {
    type: "PARTNER_APPLICATION",
    shopName: "Old Books",
    partnerApplicationPayload: { type: "REJECTED", partnerApplicationId: "pa-2" },
};

describe("getNotificationTypeLabel", () => {
    it("returns newMatch key for SEARCH_FILTER", () => {
        const result = getNotificationTypeLabel(searchFilterPayload, t);
        expect(result).toBe("notifications.types.newMatch");
    });

    it("returns priceChange key for WATCHLIST PRICE_CHANGE", () => {
        const result = getNotificationTypeLabel(priceChangePayload, t);
        expect(result).toBe("notifications.types.priceChange");
    });

    it("returns stateChange key for WATCHLIST STATE_CHANGE", () => {
        const result = getNotificationTypeLabel(stateChangePayload, t);
        expect(result).toBe("notifications.types.stateChange");
    });

    it("returns partnerApplication key for PARTNER_APPLICATION APPROVED", () => {
        const result = getNotificationTypeLabel(partnerApplicationApprovedPayload, t);
        expect(result).toBe("notifications.types.partnerApplication");
    });

    it("returns partnerApplication key for PARTNER_APPLICATION REJECTED", () => {
        const result = getNotificationTypeLabel(partnerApplicationRejectedPayload, t);
        expect(result).toBe("notifications.types.partnerApplication");
    });
});

describe("getNotificationChangeParts", () => {
    it("returns null for SEARCH_FILTER", () => {
        const result = getNotificationChangeParts(searchFilterPayload, t, "de");
        expect(result).toBeNull();
    });

    it("returns formatted prices for PRICE_CHANGE", () => {
        const result = getNotificationChangeParts(priceChangePayload, t, "de");
        expect(result).not.toBeNull();
        expect(result?.from).toBeDefined();
        expect(result?.to).toBeDefined();
    });

    it("returns unknownPrice key when oldPrice is absent", () => {
        const payloadNoOldPrice: NotificationPayload = {
            ...priceChangePayload,
            watchlistPayload: {
                type: "PRICE_CHANGE",
                oldPrice: undefined,
                newPrice: { amount: 8000, currency: "EUR" },
            },
        };
        const result = getNotificationChangeParts(payloadNoOldPrice, t, "de");
        expect(result?.from).toBe("product.unknownPrice");
    });

    it("returns unknownPrice key when newPrice is absent", () => {
        const payloadNoNewPrice: NotificationPayload = {
            ...priceChangePayload,
            watchlistPayload: {
                type: "PRICE_CHANGE",
                oldPrice: { amount: 10000, currency: "EUR" },
                newPrice: undefined,
            },
        };
        const result = getNotificationChangeParts(payloadNoNewPrice, t, "de");
        expect(result?.to).toBe("product.unknownPrice");
    });

    it("returns translated state keys for STATE_CHANGE", () => {
        const result = getNotificationChangeParts(stateChangePayload, t, "de");
        expect(result).not.toBeNull();
        expect(result?.from).toBe("productState.available");
        expect(result?.to).toBe("productState.sold");
    });

    it("returns submitted → approved for PARTNER_APPLICATION APPROVED", () => {
        const result = getNotificationChangeParts(partnerApplicationApprovedPayload, t, "de");
        expect(result).toEqual({
            from: "notifications.types.partnerApplicationSubmitted",
            to: "notifications.types.partnerApplicationStatusApproved",
        });
    });

    it("returns submitted → rejected for PARTNER_APPLICATION REJECTED", () => {
        const result = getNotificationChangeParts(partnerApplicationRejectedPayload, t, "de");
        expect(result).toEqual({
            from: "notifications.types.partnerApplicationSubmitted",
            to: "notifications.types.partnerApplicationStatusRejected",
        });
    });
});
