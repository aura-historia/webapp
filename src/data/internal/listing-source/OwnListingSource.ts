import type { AdministeredListingSourceData, AdministeredListingSourcesPageData } from "@/client";

/** A currently granted source reference, without ownership or metadata-edit permission. */
export interface OwnListingSource {
    readonly listingSourceId: string;
    readonly listingSourceSlugId: string;
    readonly name: string;
}

/** One page of granted sources. */
export interface OwnListingSourcePage {
    readonly items: readonly OwnListingSource[];
    /** Opaque continuation, sent unchanged as `after`; absent on the last page. */
    readonly next?: string;
}

export function mapToOwnListingSource(data: AdministeredListingSourceData): OwnListingSource {
    return {
        listingSourceId: data.listingSourceId,
        listingSourceSlugId: data.listingSourceSlugId,
        name: data.name,
    };
}

export function mapToOwnListingSourcePage(
    data: AdministeredListingSourcesPageData,
): OwnListingSourcePage {
    return {
        items: data.items.map(mapToOwnListingSource),
        ...(data.next === undefined ? {} : { next: data.next }),
    };
}

/**
 * Combines loaded pages in order. Pages are live, so a source renamed between page reads can
 * appear twice; keep its first entry. Equal names are distinct sources and both stay.
 */
export function combineOwnListingSourcePages(
    pages: readonly OwnListingSourcePage[],
): OwnListingSource[] {
    const sources = new Map<string, OwnListingSource>();
    for (const page of pages) {
        for (const source of page.items) {
            if (!sources.has(source.listingSourceId)) {
                sources.set(source.listingSourceId, source);
            }
        }
    }
    return [...sources.values()];
}
