import type { SearchSchemaInput } from "@tanstack/react-router";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import { type ProductState, parseProductState } from "@/data/internal/ProductState.ts";
import { SEARCH_RESULT_SORT_FIELDS, type SortMode } from "@/data/internal/SortMode.ts";

export type RawSearchParams = {
    q: string;
    priceFrom?: number;
    priceTo?: number;
    allowedStates?: ProductState[];
    creationDateFrom?: string;
    creationDateTo?: string;
    updateDateFrom?: string;
    updateDateTo?: string;
    merchant?: string | string[];
    sortField?: string;
    sortOrder?: string;
} & SearchSchemaInput;

function parseOptionalNumber(value: unknown): number | undefined {
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
}

function parseOptionalDate(value: string | undefined): Date | undefined {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseProductStates(states: unknown): ProductState[] | undefined {
    if (!Array.isArray(states)) return undefined;
    return states
        .map((state) => parseProductState(state))
        .filter((elem, index, self) => index === self.indexOf(elem));
}

function parseMerchant(merchant: string | string[] | undefined): string[] | undefined {
    if (Array.isArray(merchant)) return merchant;
    if (typeof merchant === "string") return [merchant];
    return undefined;
}

function parseSortField(field: string | undefined): SortMode["field"] {
    return SEARCH_RESULT_SORT_FIELDS.includes(field as SortMode["field"])
        ? (field as SortMode["field"])
        : "RELEVANCE";
}

function parseSortOrder(order: string | undefined): SortMode["order"] {
    return order === "ASC" || order === "DESC" ? order : "DESC";
}

export function validateSearchParams(search: RawSearchParams): SearchFilterArguments {
    return {
        q: (search.q as string) || "",
        priceFrom: parseOptionalNumber(search.priceFrom),
        priceTo: parseOptionalNumber(search.priceTo),
        allowedStates: parseProductStates(search.allowedStates),
        creationDateFrom: parseOptionalDate(search.creationDateFrom),
        creationDateTo: parseOptionalDate(search.creationDateTo),
        updateDateFrom: parseOptionalDate(search.updateDateFrom),
        updateDateTo: parseOptionalDate(search.updateDateTo),
        merchant: parseMerchant(search.merchant),
        sortField: parseSortField(search.sortField),
        sortOrder: parseSortOrder(search.sortOrder),
    };
}
