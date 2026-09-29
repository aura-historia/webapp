import type { NotificationData, WatchlistNotificationPayloadData } from "@/client";
import { mapToInternalNotification } from "@/data/internal/notification/Notification.ts";

export const watchlistPayload = {
    productListingId: "listing-1",
    listingSourceId: "source-1",
    sourceListingId: "source-item-1",
    listingSourceSlugId: "antique-shop",
    productListingTitleSlugId: "vintage-vase",
    listingSourceName: "Antique Shop",
    title: { text: "Vintage Vase", language: "en" },
    image: { url: "https://example.com/vase.png" },
    url: "https://example.com/vase",
    viewUrl: "https://example.com/vase",
    change: {
        type: "PRICE_CHANGE",
        oldPrice: { type: "MONETARY", amount: 10000, currency: "USD" },
        newPrice: { type: "MONETARY", amount: 8000, currency: "USD" },
    },
} satisfies WatchlistNotificationPayloadData;

export function notificationDto(overrides: Partial<NotificationData> = {}): NotificationData {
    return {
        notificationId: "notification-1",
        kind: "WATCHLIST_PRICE_CHANGED",
        payload: watchlistPayload,
        seen: false,
        created: "2026-09-10T10:00:00Z",
        updated: "2026-09-10T10:00:00Z",
        ...overrides,
    };
}

export function notification(overrides: Partial<NotificationData> = {}) {
    return mapToInternalNotification(notificationDto(overrides));
}
