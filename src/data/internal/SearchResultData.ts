import type { OverviewItem } from "@/data/internal/OverviewItem.ts";

export type SearchResultData = {
    items: OverviewItem[];
    size: number | undefined;
    total: number | undefined;
    searchAfter: Array<unknown> | undefined;
};
