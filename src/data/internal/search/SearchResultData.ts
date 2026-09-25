import type { ProductListing } from "@/data/internal/product/ProductListing.ts";

export type SearchResultData = {
    products: ProductListing[];
    size: number | undefined;
    total: number | undefined;
    searchAfter: string | undefined;
};
