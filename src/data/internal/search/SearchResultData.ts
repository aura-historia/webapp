import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import type { ProductListingSearchCursorData } from "@/client";

/** App-owned representation of the opaque, FX-pinned listing search cursor. */
export type ListingSearchCursor = {
    readonly fxRateId: string;
    readonly searchAfter: readonly unknown[];
};

export function mapListingSearchCursor(
    cursor: ProductListingSearchCursorData | null | undefined,
): ListingSearchCursor | undefined {
    if (!cursor) return undefined;
    return { fxRateId: cursor.fxRateId, searchAfter: [...cursor.searchAfter] };
}

/** The API requires the complete cursor to be sent as one JSON query parameter value. */
export function serializeListingSearchCursor(cursor: ListingSearchCursor): string {
    return JSON.stringify({ fxRateId: cursor.fxRateId, searchAfter: cursor.searchAfter });
}

export type SearchResultData = {
    products: ProductListing[];
    size: number | undefined;
    total: number | undefined;
    searchAfter: ListingSearchCursor | undefined;
};
