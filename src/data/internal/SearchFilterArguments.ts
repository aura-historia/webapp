import type { ProductState } from "@/data/internal/ProductState.ts";
import type { SortMode } from "@/data/internal/SortMode.ts";
import type { Authenticity } from "@/data/internal/Authenticity.ts";
import type { Condition } from "@/data/internal/Condition.ts";
import type { Provenance } from "@/data/internal/Provenance.ts";
import type { Restoration } from "@/data/internal/Restoration.ts";

export type SearchFilterArguments = {
    q: string;
    priceFrom?: number;
    priceTo?: number;
    allowedStates?: ProductState[];
    creationDateFrom?: Date;
    creationDateTo?: Date;
    updateDateFrom?: Date;
    updateDateTo?: Date;
    merchant?: string;
    sortField?: SortMode["field"];
    sortOrder?: SortMode["order"];
    originYearMin?: number;
    originYearMax?: number;
    authenticity?: Authenticity[];
    condition?: Condition[];
    provenance?: Provenance[];
    restoration?: Restoration[];
};
