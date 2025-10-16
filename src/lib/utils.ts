import type { PriceData } from "@/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import type { ItemState } from "@/data/internal/ItemState.ts";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(data: PriceData, locale: string | undefined = undefined): string {
    return new Intl.NumberFormat(locale ?? navigator.language, {
        style: "currency",
        currency: data?.currency,
    }).format((data?.amount ?? 0) / 100);
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

export type SearchFilterData = {
    query: string;
    priceSpan?: {
        min?: number;
        max?: number;
    };
    itemState?: ItemState[];
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
    allowedStates?: ItemState[];
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
        allowedStates: data.itemState && data.itemState.length > 0 ? data.itemState : undefined,
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
