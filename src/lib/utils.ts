import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import type { ProductEvent } from "@/data/internal/product/ProductDetails.ts";
import {
    isCreatedEvent,
    isPriceChangedEvent,
    isPriceDiscoveredEvent,
    isPriceRemovedEvent,
} from "@/lib/eventFilters.ts";
import type { ProductState } from "@/data/internal/product/ProductState.ts";
import type { TFunction } from "i18next";
import type { Authenticity } from "@/data/internal/quality-indicators/Authenticity.ts";
import type { Condition } from "@/data/internal/quality-indicators/Condition.ts";
import type { Provenance } from "@/data/internal/quality-indicators/Provenance.ts";
import type { Restoration } from "@/data/internal/quality-indicators/Restoration.ts";
import type { ShopType } from "@/data/internal/shop/ShopType.ts";
import type { CheckedState } from "@radix-ui/react-checkbox";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
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
    merchant?: string[];
    excludeMerchant?: string[];
    shopType?: ShopType[];
    originYearSpan?: {
        min?: number;
        max?: number;
    };
    authenticity?: Authenticity[];
    condition?: Condition[];
    provenance?: Provenance[];
    restoration?: Restoration[];
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
    merchant?: string[];
    excludeMerchant?: string[];
    shopType?: ShopType[];
    originYearMin?: number;
    originYearMax?: number;
    authenticity?: Authenticity[];
    condition?: Condition[];
    provenance?: Provenance[];
    restoration?: Restoration[];
};

function mapDateRangeToParams(range?: { from?: Date; to?: Date }) {
    return {
        from: formatToDateString(range?.from),
        to: formatToDateString(range?.to),
    };
}

/**
 * Converts filter form data to URL search parameters
 */
export function mapFiltersToUrlParams(data: SearchFilterData): SearchUrlParams {
    const creationDate = mapDateRangeToParams(data.creationDate);
    const updateDate = mapDateRangeToParams(data.updateDate);

    return {
        q: data.query,
        priceFrom: data.priceSpan?.min,
        priceTo: data.priceSpan?.max,
        allowedStates: data.productState?.length ? data.productState : undefined,
        creationDateFrom: creationDate.from,
        creationDateTo: creationDate.to,
        updateDateFrom: updateDate.from,
        updateDateTo: updateDate.to,
        merchant: data.merchant?.length ? data.merchant : undefined,
        excludeMerchant: data.excludeMerchant?.length ? data.excludeMerchant : undefined,
        shopType: data.shopType?.length ? data.shopType : undefined,
        originYearMin: data.originYearSpan?.min,
        originYearMax: data.originYearSpan?.max,
        authenticity: data.authenticity?.length ? data.authenticity : undefined,
        condition: data.condition?.length ? data.condition : undefined,
        provenance: data.provenance?.length ? data.provenance : undefined,
        restoration: data.restoration?.length ? data.restoration : undefined,
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

export function handleCheckedChange(
    field: { value: string[]; onChange: (value: string[]) => void },
    state: string,
    isChecked: CheckedState,
): void {
    if (isChecked) {
        field.onChange([...field.value, state]);
    } else {
        field.onChange(field.value?.filter((value) => value !== state));
    }
}
