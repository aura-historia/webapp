import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import type { ItemEvent, Price } from "@/data/internal/ItemDetails.ts";
import {
    isPriceChangedEvent,
    isPriceDiscoveredEvent,
    isPriceRemovedEvent,
} from "@/lib/eventFilters.ts";
import type { ItemState } from "@/data/internal/ItemState.ts";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(data: Price, locale?: string): string {
    return new Intl.NumberFormat(locale ?? navigator.language, {
        style: "currency",
        currency: data.currency,
    }).format(data.amount / 100);
}

/**
 * Extracts the price amount from a price event.
 *
 * Different event types store the price in different places:
 * - PRICE_DISCOVERED/CHANGED: newPrice.amount
 * - PRICE_REMOVED: oldPrice.amount
 *
 * Returns the price in minor currency units (cents) or null (0).
 */
export function getPriceAmount(event: ItemEvent): number {
    if (isPriceDiscoveredEvent(event)) {
        return event.payload.newPrice.amount;
    }
    if (isPriceChangedEvent(event)) {
        return event.payload.newPrice.amount;
    }
    if (isPriceRemovedEvent(event)) {
        return event.payload.oldPrice.amount;
    }
    return 0;
}

export function formatToDateString(date?: Date): string | undefined {
    if (date === undefined) {
        return undefined;
    }
    return format(date, "yyyy-MM-dd");
}

export function isSimpleSearch(searchArgs: SearchFilterArguments): boolean {
    return !(
        searchArgs.priceFrom ||
        searchArgs.priceTo ||
        searchArgs.allowedStates ||
        searchArgs.creationDateFrom ||
        searchArgs.creationDateTo ||
        searchArgs.updateDateFrom ||
        searchArgs.updateDateTo ||
        searchArgs.merchant
    );
}

export function formatDateTime(date: Date, locale?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function formatDate(date: Date, locale?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

export function formatTime(date: Date, locale?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function formatTimeWithSeconds(date: Date, locale?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);
}

export function formatCompactCurrency(value: number): string {
    const formatted = new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
    }).format(value);
    return `${formatted} €`;
}

export function formatStateName(state: ItemState): string {
    switch (state) {
        case "LISTED":
            return "'Gelistet'";
        case "AVAILABLE":
            return "'Verfügbar'";
        case "RESERVED":
            return "'Reserviert'";
        case "SOLD":
            return "'Verkauft'";
        case "REMOVED":
            return "'Gelöscht'";
        case "UNKNOWN":
            return "'Unbekannt'";
    }
}
