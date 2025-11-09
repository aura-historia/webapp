import type { ItemState } from "@/data/internal/ItemState.ts";
import type { SortMode } from "@/data/internal/SortMode.ts";

export type SearchFilterArguments = {
    q: string;
    priceFrom?: number;
    priceTo?: number;
    allowedStates?: ItemState[];
    creationDateFrom?: Date;
    creationDateTo?: Date;
    updateDateFrom?: Date;
    updateDateTo?: Date;
    merchant?: string;
    sortMode?: SortMode;
};
