import type { ItemState } from "@/data/internal/ItemState.ts";
import type { SortMode } from "@/data/internal/SortMode.ts";

export type SearchFilterArguments = {
    q: string;
    priceFrom: number | undefined;
    priceTo: number | undefined;
    allowedStates: ItemState[] | undefined;
    creationDateFrom: Date | undefined;
    creationDateTo: Date | undefined;
    updateDateFrom: Date | undefined;
    updateDateTo: Date | undefined;
    merchant: string | undefined;
    sortMode: SortMode | undefined;
};
