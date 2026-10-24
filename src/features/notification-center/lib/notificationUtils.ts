import type { ListingAvailability } from "@/data/internal/product/ProductListingDomain.ts";
import type {
    Notification,
    NotificationPayload,
} from "@/data/internal/notification/Notification.ts";
import { formatPrice } from "@/data/internal/price/Price.ts";

export type NotificationKind = "price" | "availability" | "match" | "partner";

export function getNotificationKind(payload: NotificationPayload): NotificationKind {
    if (payload.type === "SEARCH_FILTER") return "match";
    if (payload.type === "PARTNER_APPLICATION") return "partner";
    return payload.change.type === "PRICE_CHANGE" ? "price" : "availability";
}

/** Where a notification comes from, shown after its type ("Price change · Watchlist"). */
export function getNotificationSourceLabel(
    payload: NotificationPayload,
    t: (key: string) => string,
): string | null {
    if (payload.type === "WATCHLIST") return t("notifications.sources.watchlist");
    if (payload.type === "SEARCH_FILTER") return t("notifications.sources.searchFilter");
    return null;
}

/**
 * The relative change between two amounts in one currency ("−8%", "+7%"); null when either side
 * is not an amount, the currencies differ or the old amount is zero.
 */
export function getNotificationPriceDelta(
    payload: NotificationPayload,
    language: string,
): string | null {
    if (payload.type !== "WATCHLIST" || payload.change.type !== "PRICE_CHANGE") return null;
    const { oldPrice, newPrice } = payload.change;
    if (oldPrice?.type !== "MONETARY" || newPrice?.type !== "MONETARY") return null;
    if (oldPrice.currency !== newPrice.currency || oldPrice.amount === 0) return null;

    const ratio = (newPrice.amount - oldPrice.amount) / oldPrice.amount;
    if (Math.abs(ratio) < 0.005) return null;
    return new Intl.NumberFormat(language, {
        style: "percent",
        maximumFractionDigits: 0,
        signDisplay: "always",
    })
        .format(ratio)
        .replace("-", "−");
}

export type NotificationDayGroup = "today" | "thisWeek" | "earlier";

function dayKey(date: Date, timeZone: string): string {
    return new Intl.DateTimeFormat("en-CA", { timeZone, dateStyle: "short" }).format(date);
}

/**
 * Groups notifications, newest first, into today, the six days before and everything earlier,
 * by calendar day in the visitor's time zone. Call it on the client only: it reads the clock.
 */
export function groupNotificationsByDay(
    notifications: readonly Notification[],
    now: Date,
    timeZone: string,
): { readonly group: NotificationDayGroup; readonly items: readonly Notification[] }[] {
    const today = dayKey(now, timeZone);
    const weekStart = dayKey(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), timeZone);
    const groups = new Map<NotificationDayGroup, Notification[]>();

    for (const notification of notifications) {
        const day = dayKey(notification.created, timeZone);
        let group: NotificationDayGroup = "earlier";
        if (day === today) group = "today";
        else if (day >= weekStart) group = "thisWeek";
        groups.set(group, [...(groups.get(group) ?? []), notification]);
    }

    return (["today", "thisWeek", "earlier"] as const)
        .filter((group) => groups.has(group))
        .map((group) => ({ group, items: groups.get(group) ?? [] }));
}

export function getNotificationTypeLabel(
    payload: NotificationPayload,
    t: (key: string) => string,
): string {
    if (payload.type === "SEARCH_FILTER") return t("notifications.types.newMatch");
    if (payload.type === "PARTNER_APPLICATION") return t("notifications.types.partnerApplication");
    if (payload.change.type === "PRICE_CHANGE") return t("notifications.types.priceChange");
    return t("notifications.types.stateChange");
}

function availabilityLabel(availability: ListingAvailability | null, t: (key: string) => string) {
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
        const displayPrice = (price: typeof payload.change.oldPrice) => {
            if (price?.type === "MONETARY") {
                return formatPrice({ amount: price.amount, currency: price.currency }, language);
            }
            if (price?.type === "ON_REQUEST") return t("product.history.values.onRequest");
            return unknown;
        };

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
