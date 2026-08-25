import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import type { ProductStateData } from "@/client";
import type { ShopType } from "@/data/internal/shop/ShopType.ts";
import { CURRENCY_SYMBOLS, type Currency } from "@/data/internal/common/Currency.ts";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
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
    productState?: ProductStateData[];
    creationDate?: {
        from?: Date;
        to?: Date;
    };
    updateDate?: {
        from?: Date;
        to?: Date;
    };
    auctionDate?: {
        from?: Date;
        to?: Date;
    };
    merchant?: string[];
    excludeMerchant?: string[];
    seller?: string[];
    excludeSeller?: string[];
    shopType?: ShopType[];
};

export type SearchUrlParams = {
    q: string;
    priceFrom?: number;
    priceTo?: number;
    allowedStates?: ProductStateData[];
    creationDateFrom?: string;
    creationDateTo?: string;
    updateDateFrom?: string;
    updateDateTo?: string;
    auctionDateFrom?: string;
    auctionDateTo?: string;
    merchant?: string[];
    excludeMerchant?: string[];
    seller?: string[];
    excludeSeller?: string[];
    shopType?: ShopType[];
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
    const auctionDate = mapDateRangeToParams(data.auctionDate);

    return {
        q: data.query,
        priceFrom: data.priceSpan?.min,
        priceTo: data.priceSpan?.max,
        allowedStates: data.productState ?? FILTER_DEFAULTS.productState,
        creationDateFrom: creationDate.from,
        creationDateTo: creationDate.to,
        updateDateFrom: updateDate.from,
        updateDateTo: updateDate.to,
        auctionDateFrom: auctionDate.from,
        auctionDateTo: auctionDate.to,
        merchant: data.merchant?.length ? data.merchant : undefined,
        excludeMerchant: data.excludeMerchant?.length ? data.excludeMerchant : undefined,
        seller: data.seller?.length ? data.seller : undefined,
        excludeSeller: data.excludeSeller?.length ? data.excludeSeller : undefined,
        shopType: data.shopType?.length ? data.shopType : undefined,
    };
}

export function formatDateTime(date: Date, locale?: string, timeZone?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
    }).format(date);
}

export function formatDate(date: Date, locale?: string, timeZone?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone,
    }).format(date);
}

export function formatTime(date: Date, locale?: string, timeZone?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
    }).format(date);
}

export function formatTimeWithSeconds(date: Date, locale?: string, timeZone?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone,
    }).format(date);
}

export function formatCompactCurrency(value: number, currency: string, locale: string): string {
    const formatted = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
    }).format(value);

    const sym = CURRENCY_SYMBOLS[currency as Currency];
    return sym ? formatted.replace(currency, sym) : formatted;
}

export function formatShortDate(date: Date, locale?: string, timeZone?: string): string {
    return new Intl.DateTimeFormat(locale ?? navigator.language, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone,
    }).format(date);
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
