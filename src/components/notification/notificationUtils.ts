import type { NotificationPayload } from "@/data/internal/notification/Notification.ts";
import { formatPrice } from "@/data/internal/price/Price.ts";

export function getNotificationTypeLabel(
    payload: NotificationPayload,
    t: (key: string) => string,
): string {
    if (payload.type === "SEARCH_FILTER") return t("notifications.types.newMatch");
    if (payload.watchlistPayload.type === "PRICE_CHANGE")
        return t("notifications.types.priceChange");
    return t("notifications.types.stateChange");
}

export function getNotificationInfoText(
    payload: NotificationPayload,
    t: (key: string) => string,
    language: string,
): string {
    if (payload.type === "SEARCH_FILTER") return payload.searchFilterName;

    if (payload.watchlistPayload.type === "PRICE_CHANGE") {
        const { oldPrice, newPrice } = payload.watchlistPayload;
        const unknown = t("product.unknownPrice");
        const old = oldPrice ? formatPrice(oldPrice, language) : unknown;
        const current = newPrice ? formatPrice(newPrice, language) : unknown;
        return `${old} → ${current}`;
    }

    return `${t(`productState.${payload.watchlistPayload.oldState.toLowerCase()}`)} → ${t(`productState.${payload.watchlistPayload.newState.toLowerCase()}`)}`;
}
