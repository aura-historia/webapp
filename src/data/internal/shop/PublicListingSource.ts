import type { PublicListingSourceData } from "@/client";

/** Public, allowlisted presentation fields for an indexed listing source. */
export type PublicListingSource = {
    readonly listingSourceId: string;
    readonly slugId: string;
    readonly name: string;
    readonly operatorName: string;
    readonly image?: string;
    readonly url?: string;
};

export function mapPublicListingSource(data: PublicListingSourceData): PublicListingSource {
    return {
        listingSourceId: data.listingSourceId,
        slugId: data.listingSourceSlugId,
        name: data.name,
        operatorName: data.operator.name,
        image: data.image,
        url: data.url,
    };
}
