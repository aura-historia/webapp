import type { OverviewItem } from "@/data/internal/OverviewItem.ts";

export type SearchResultData = {
    items: OverviewItem[];
    size?: number | undefined;
    total?: number | null;
    searchAfter?: Array<unknown> | null;
};
