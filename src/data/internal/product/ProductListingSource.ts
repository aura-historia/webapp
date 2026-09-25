import type { ProductListingSourceData } from "@/client";

export type ProductListingSource = {
    readonly listingSourceId: string;
    readonly name: string;
    readonly slugId: string;
};

export function mapProductListingSource(source: ProductListingSourceData): ProductListingSource {
    return {
        listingSourceId: source.listingSourceId,
        name: source.name,
        slugId: source.slugId,
    };
}
