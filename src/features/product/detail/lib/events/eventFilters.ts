import type {
    ProductListingHistoryChange,
    ProductListingHistoryEntry,
} from "@/data/internal/product/ProductListingHistory.ts";

export type HistoryFilter = "all" | "price" | "availability" | "details";

export function isPriceHistoryChange(change: ProductListingHistoryChange): boolean {
    return (
        change.type === "MAIN_PRICE_CHANGED" ||
        change.type === "MINIMUM_ESTIMATE_CHANGED" ||
        change.type === "MAXIMUM_ESTIMATE_CHANGED"
    );
}

export function isAvailabilityHistoryChange(change: ProductListingHistoryChange): boolean {
    return (
        change.type === "AVAILABILITY_CHANGED" ||
        change.type === "WITHDRAWN" ||
        change.type === "RESTORED"
    );
}

export function matchesHistoryFilter(
    entry: ProductListingHistoryEntry,
    filter: HistoryFilter,
): boolean {
    if (filter === "all") return true;
    if (entry.payload.kind === "UNKNOWN") return filter === "details";

    if (entry.payload.kind === "DISCOVERED") {
        const { discovery } = entry.payload;
        if (filter === "price") {
            return Boolean(
                discovery.pricing.price ||
                    discovery.pricing.priceEstimateMin ||
                    discovery.pricing.priceEstimateMax,
            );
        }
        if (filter === "availability") return discovery.availability !== null;
        return discovery.imageCount > 0 || discovery.auction !== null || Boolean(discovery.url);
    }

    if (filter === "price") return entry.payload.changes.some(isPriceHistoryChange);
    if (filter === "availability") return entry.payload.changes.some(isAvailabilityHistoryChange);
    return entry.payload.changes.some(
        (change) => !isPriceHistoryChange(change) && !isAvailabilityHistoryChange(change),
    );
}

export function getVisibleHistoryChanges(
    entry: ProductListingHistoryEntry,
    filter: HistoryFilter,
): readonly ProductListingHistoryChange[] {
    if (entry.payload.kind !== "CHANGED" || filter === "all") {
        return entry.payload.kind === "CHANGED" ? entry.payload.changes : [];
    }
    if (filter === "price") return entry.payload.changes.filter(isPriceHistoryChange);
    if (filter === "availability") return entry.payload.changes.filter(isAvailabilityHistoryChange);
    return entry.payload.changes.filter(
        (change) => !isPriceHistoryChange(change) && !isAvailabilityHistoryChange(change),
    );
}
