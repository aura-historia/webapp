import type { SearchSchemaInput } from "@tanstack/react-router";
import { MIN_SEARCH_QUERY_LENGTH } from "@/features/search/products/lib/filterDefaults.ts";

/** URL state of a provider page: the in-page listing search, when one is active. */
export type ShopProfileSearch = {
    readonly q?: string;
};

export type RawShopProfileSearch = {
    q?: unknown;
} & SearchSchemaInput;

/** Keeps `q` only when it is a search the page would run: trimmed, at least three characters. */
export function validateShopProfileSearch(search: RawShopProfileSearch): ShopProfileSearch {
    const q = typeof search.q === "string" ? search.q.trim() : "";
    return q.length >= MIN_SEARCH_QUERY_LENGTH ? { q } : {};
}
