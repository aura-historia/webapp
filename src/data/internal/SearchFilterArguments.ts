import type { ProductState } from "@/data/internal/ProductState.ts";
import type { SortMode } from "@/data/internal/SortMode.ts";

export type SearchFilterArguments = {
    q: string;
    priceFrom?: number;
    priceTo?: number;
    allowedStates?: ProductState[];
    creationDateFrom?: Date;
    creationDateTo?: Date;
    updateDateFrom?: Date;
    updateDateTo?: Date;
    merchant?: string[];
    sortField?: SortMode["field"];
    sortOrder?: SortMode["order"];
};
