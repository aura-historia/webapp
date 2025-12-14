import type { OverviewProduct } from "@/data/internal/OverviewProduct.ts";

export type SearchResultData = {
    products: OverviewProduct[];
    size: number | undefined;
    total: number | undefined;
    searchAfter: Array<unknown> | undefined;
};
