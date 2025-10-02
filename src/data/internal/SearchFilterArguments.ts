import type { ItemState } from "@/data/internal/ItemState.ts";

export type SearchFilterArguments = {
    q: string;
    priceFrom: number | undefined;
    priceTo: number | undefined;
    allowedStates: ItemState[] | undefined;
    creationDateFrom: string | undefined;
    creationDateTo: string | undefined;
    merchant: string | undefined;
};
