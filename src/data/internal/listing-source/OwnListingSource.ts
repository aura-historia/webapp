import type { AdministeredListingSourceData } from "@/client";

/** A currently granted source reference, without ownership or metadata-edit permission. */
export interface OwnListingSource {
    readonly listingSourceId: string;
    readonly listingSourceSlugId: string;
    readonly name: string;
}

export function mapToOwnListingSource(data: AdministeredListingSourceData): OwnListingSource {
    return {
        listingSourceId: data.listingSourceId,
        listingSourceSlugId: data.listingSourceSlugId,
        name: data.name,
    };
}
