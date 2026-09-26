import { format } from "date-fns";

import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

export type SearchFilterData = {
    query: string;
    priceSpan?: { min?: number; max?: number };
    availability?: SearchFilterArguments["availability"];
    listingSourceId?: string[];
    excludeListingSourceId?: string[];
    creationDate?: { from?: Date; to?: Date };
    updateDate?: { from?: Date; to?: Date };
    auctionDate?: { from?: Date; to?: Date };
};

export type SearchUrlParams = Omit<
    SearchFilterArguments,
    | "queryTerms"
    | "creationDateFrom"
    | "creationDateTo"
    | "updateDateFrom"
    | "updateDateTo"
    | "auctionDateFrom"
    | "auctionDateTo"
> & {
    creationDateFrom?: string;
    creationDateTo?: string;
    updateDateFrom?: string;
    updateDateTo?: string;
    auctionDateFrom?: string;
    auctionDateTo?: string;
};

function formatToDateString(date?: Date): string | undefined {
    return date === undefined ? undefined : format(date, "yyyy-MM-dd");
}

function mapDateRangeToParams(range?: { from?: Date; to?: Date }) {
    return { from: formatToDateString(range?.from), to: formatToDateString(range?.to) };
}

/** Converts the product search form into canonical listing-search URL parameters. */
export function mapFiltersToUrlParams(data: SearchFilterData): SearchUrlParams {
    const creationDate = mapDateRangeToParams(data.creationDate);
    const updateDate = mapDateRangeToParams(data.updateDate);
    const auctionDate = mapDateRangeToParams(data.auctionDate);

    return {
        q: data.query,
        priceFrom: data.priceSpan?.min,
        priceTo: data.priceSpan?.max,
        availability:
            data.availability?.length === LISTING_AVAILABILITIES.length
                ? undefined
                : data.availability,
        listingSourceId: data.listingSourceId?.length ? data.listingSourceId : undefined,
        excludeListingSourceId: data.excludeListingSourceId?.length
            ? data.excludeListingSourceId
            : undefined,
        creationDateFrom: creationDate.from,
        creationDateTo: creationDate.to,
        updateDateFrom: updateDate.from,
        updateDateTo: updateDate.to,
        auctionDateFrom: auctionDate.from,
        auctionDateTo: auctionDate.to,
    };
}
