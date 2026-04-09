import type { ProductUserStateData } from "@/client";
import { describe, expect, it } from "vitest";
import { mapToInternalUserProductData } from "../UserProductData.ts";

describe("mapToInternalUserProductData", () => {
    const baseApiData: ProductUserStateData = {
        watchlist: {
            watching: true,
            notifications: true,
        },
        prohibitedContent: {
            consent: false,
        },
        notification: {
            seen: false,
            originEventId: "event-123",
        },
        searchFilter: {
            matched: false,
            hidden: false,
        },
    };

    it("should map notification seen=false to hasUnseenNotification=true with originEventId", () => {
        const result = mapToInternalUserProductData(baseApiData);

        expect(result.notificationData.hasUnseenNotification).toBe(true);
        expect(result.notificationData.originEventId).toBe("event-123");
    });

    it("should map notification seen=true to hasUnseenNotification=false", () => {
        const apiData: ProductUserStateData = {
            ...baseApiData,
            notification: {
                seen: true,
                originEventId: "event-456",
            },
        };

        const result = mapToInternalUserProductData(apiData);

        expect(result.notificationData.hasUnseenNotification).toBe(false);
        expect(result.notificationData.originEventId).toBe("event-456");
    });

    it("should map notification with no originEventId", () => {
        const apiData: ProductUserStateData = {
            ...baseApiData,
            notification: {
                seen: false,
            },
        };

        const result = mapToInternalUserProductData(apiData);

        expect(result.notificationData.hasUnseenNotification).toBe(true);
        expect(result.notificationData.originEventId).toBeUndefined();
    });

    it("should still map watchlist data correctly", () => {
        const result = mapToInternalUserProductData(baseApiData);

        expect(result.watchlistData.isWatching).toBe(true);
        expect(result.watchlistData.isNotificationEnabled).toBe(true);
    });

    it("should map watchlist watching=false and notifications=false correctly", () => {
        const apiData: ProductUserStateData = {
            ...baseApiData,
            watchlist: {
                watching: false,
                notifications: false,
            },
        };

        const result = mapToInternalUserProductData(apiData);

        expect(result.watchlistData.isWatching).toBe(false);
        expect(result.watchlistData.isNotificationEnabled).toBe(false);
    });
});
