import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import type { ProductEvent, Price } from "@/data/internal/ProductDetails.ts";
import {
    isCreatedEvent,
    isPriceChangedEvent,
    isPriceDiscoveredEvent,
    isPriceRemovedEvent,
} from "@/lib/eventFilters.ts";
import type { ProductState } from "@/data/internal/ProductState.ts";
import type { TFunction } from "i18next";

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
export function getPriceAmount(event: ProductEvent): number | undefined {
    if (isCreatedEvent(event)) {
        return event.payload.price?.amount;
    }
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

export type SearchFilterData = {
    query: string;
    priceSpan?: {
        min?: number;
        max?: number;
    };
    productState?: ProductState[];
    creationDate?: {
        from?: Date;
        to?: Date;
    };
    updateDate?: {
        from?: Date;
        to?: Date;
    };
    merchant?: string;
};

export type SearchUrlParams = {
    q: string;
    priceFrom?: number;
    priceTo?: number;
    allowedStates?: ProductState[];
    creationDateFrom?: string;
    creationDateTo?: string;
    updateDateFrom?: string;
    updateDateTo?: string;
    merchant?: string;
};

/**
 * Converts filter form data to URL search parameters
 */
export function mapFiltersToUrlParams(data: SearchFilterData): SearchUrlParams {
    return {
        q: data.query,
        priceFrom: data.priceSpan?.min,
        priceTo: data.priceSpan?.max,
        allowedStates:
            data.productState && data.productState.length > 0 ? data.productState : undefined,
        creationDateFrom: data.creationDate?.from
            ? formatToDateString(data.creationDate.from)
            : undefined,
        creationDateTo: data.creationDate?.to
            ? formatToDateString(data.creationDate.to)
            : undefined,
        updateDateFrom: data.updateDate?.from
            ? formatToDateString(data.updateDate.from)
            : undefined,
        updateDateTo: data.updateDate?.to ? formatToDateString(data.updateDate.to) : undefined,
        merchant: data.merchant ? data.merchant : undefined,
    };
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

export function formatStateName(state: ProductState, t: TFunction): string {
    switch (state) {
        case "LISTED":
            return `'${t("productState.listed")}'`;
        case "AVAILABLE":
            return `'${t("productState.available")}'`;
        case "RESERVED":
            return `'${t("productState.reserved")}'`;
        case "SOLD":
            return `'${t("productState.sold")}'`;
        case "REMOVED":
            return `'${t("productState.removed")}'`;
        case "UNKNOWN":
            return `'${t("productState.unknown")}'`;
    }
}
