import type { ItemStateData } from "@/client";

export type SearchFilterArguments = {
    q: string;
    priceFrom: number | undefined;
    priceTo: number | undefined;
    allowedStates: ItemStateData[] | undefined;
    creationDateFrom: Date | undefined;
    creationDateTo: Date | undefined;
    updateDateFrom: Date | undefined;
    updateDateTo: Date | undefined;
    merchant: string | undefined;
};
