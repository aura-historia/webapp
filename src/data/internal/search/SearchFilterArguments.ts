import type { ProductState } from "@/data/internal/product/ProductState.ts";
import type { SortMode } from "@/data/internal/search/SortMode.ts";
import type { Authenticity } from "@/data/internal/quality-indicators/Authenticity.ts";
import type { Condition } from "@/data/internal/quality-indicators/Condition.ts";
import type { Provenance } from "@/data/internal/quality-indicators/Provenance.ts";
import type { Restoration } from "@/data/internal/quality-indicators/Restoration.ts";

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
    originYearMin?: number;
    originYearMax?: number;
    authenticity?: Authenticity[];
    condition?: Condition[];
    provenance?: Provenance[];
    restoration?: Restoration[];
};
