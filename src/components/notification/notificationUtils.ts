import type { NotificationPayload } from "@/data/internal/notification/Notification.ts";
import { formatPrice } from "@/data/internal/price/Price.ts";

/**
 * Returns the display label for the notification type.
 *
 * Examples:
 * - WATCHLIST + PRICE_CHANGE  → "Preisänderung"
 * - WATCHLIST + STATE_CHANGE  → "Statusänderung"
 * - SEARCH_FILTER             → "Neuer Treffer"
 */
export function getNotificationTypeLabel(
    payload: NotificationPayload,
    t: (key: string) => string,
): string {
    if (payload.type === "SEARCH_FILTER") return t("notifications.types.newMatch");
    if (payload.watchlistPayload.type === "PRICE_CHANGE")
        return t("notifications.types.priceChange");
    return t("notifications.types.stateChange");
}

/**
 * Returns the change split into { from, to } parts, used where old and new values
 * need to be styled separately (e.g. old value with strikethrough in the notification card).
 *
 * Returns null for SEARCH_FILTER notifications, as they have no from/to change.
 */
export function getNotificationChangeParts(
    payload: NotificationPayload,
    t: (key: string) => string,
    language: string,
): { from: string; to: string } | null {
    if (payload.type === "SEARCH_FILTER") return null;

    if (payload.watchlistPayload.type === "PRICE_CHANGE") {
        const { oldPrice, newPrice } = payload.watchlistPayload;
        const unknown = t("product.unknownPrice");
        return {
            from: oldPrice ? formatPrice(oldPrice, language) : unknown,
            to: newPrice ? formatPrice(newPrice, language) : unknown,
        };
    }

    return {
        from: t(`productState.${payload.watchlistPayload.oldState.toLowerCase()}`),
        to: t(`productState.${payload.watchlistPayload.newState.toLowerCase()}`),
    };
}
