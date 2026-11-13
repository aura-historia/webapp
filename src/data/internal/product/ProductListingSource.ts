import type { ProductListingSourceData } from "@/client";

export type ProductListingSource = {
    readonly listingSourceId: string;
    readonly name: string;
    readonly slugId: string;
    /** Whether the source's operator has an active Aura Historia partnership. */
    readonly partner: boolean;
};

export function mapProductListingSource(source: ProductListingSourceData): ProductListingSource {
    return {
        listingSourceId: source.listingSourceId,
        name: source.name,
        slugId: source.slugId,
        partner: source.operator.partner,
    };
}
