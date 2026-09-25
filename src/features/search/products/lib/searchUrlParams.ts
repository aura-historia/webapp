import { format } from "date-fns";

import type { ProductState } from "@/data/internal/product/ProductState.ts";
import { FILTER_DEFAULTS } from "@/features/search/products/lib/filterDefaults.ts";

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
    auctionDate?: {
        from?: Date;
        to?: Date;
    };
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
    auctionDateFrom?: string;
    auctionDateTo?: string;
};

function formatToDateString(date?: Date): string | undefined {
    if (date === undefined) {
        return undefined;
    }
    return format(date, "yyyy-MM-dd");
}

function mapDateRangeToParams(range?: { from?: Date; to?: Date }) {
    return {
        from: formatToDateString(range?.from),
        to: formatToDateString(range?.to),
    };
}

/** Converts product search filter form data to URL search parameters. */
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
    };
}
