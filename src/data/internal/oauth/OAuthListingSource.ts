import type { AdministeredListingSourceData } from "@/client";

export interface OAuthListingSource {
    readonly listingSourceId: string;
    readonly name: string;
}

export function mapToOAuthListingSource(data: AdministeredListingSourceData): OAuthListingSource {
    return { listingSourceId: data.listingSourceId, name: data.name };
}
