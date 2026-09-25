import type { ListingAvailabilityData } from "@/client";
import type { NotificationPayload } from "@/data/internal/notification/Notification.ts";
import { formatPrice } from "@/data/internal/price/Price.ts";

export function getNotificationTypeLabel(
    payload: NotificationPayload,
    t: (key: string) => string,
): string {
    if (payload.type === "SEARCH_FILTER") return t("notifications.types.newMatch");
    if (payload.type === "PARTNER_APPLICATION") return t("notifications.types.partnerApplication");
    if (payload.change.type === "PRICE_CHANGE") return t("notifications.types.priceChange");
    return t("notifications.types.stateChange");
}

function availabilityLabel(
    availability: ListingAvailabilityData | null,
    t: (key: string) => string,
) {
    if (!availability) return t("product.listingAvailability.unknown");
    const [first, ...rest] = availability.toLowerCase().split("_");
    const key = `${first}${rest.map((part) => part[0]?.toUpperCase() + part.slice(1)).join("")}`;
    return t(`product.listingAvailability.${key}`);
}

export function getNotificationChangeParts(
    payload: NotificationPayload,
    t: (key: string) => string,
    language: string,
): { from: string; to: string } | null {
    if (payload.type === "SEARCH_FILTER") return null;

    if (payload.type === "PARTNER_APPLICATION") {
        return {
            from: t("notifications.types.partnerApplicationSubmitted"),
            to:
                payload.decision === "APPROVED"
                    ? t("notifications.types.partnerApplicationStatusApproved")
                    : t("notifications.types.partnerApplicationStatusRejected"),
        };
    }

    if (payload.change.type === "PRICE_CHANGE") {
        const unknown = t("product.unknownPrice");
        const displayPrice = (price: typeof payload.change.oldPrice) =>
            price?.type === "MONETARY"
                ? formatPrice({ amount: price.amount, currency: price.currency }, language)
                : price?.type === "ON_REQUEST"
                  ? t("product.priceChart.values.onRequest")
                  : unknown;

        return {
            from: displayPrice(payload.change.oldPrice),
            to: displayPrice(payload.change.newPrice),
        };
    }

    return {
        from: availabilityLabel(payload.change.oldAvailability, t),
        to: availabilityLabel(payload.change.newAvailability, t),
    };
}
