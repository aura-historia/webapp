import type { SearchSchemaInput } from "@tanstack/react-router";

/** URL state of a provider page: the in-page listing search, when one is active. */
export type ShopProfileSearch = {
    readonly q?: string;
};

export type RawShopProfileSearch = {
    q?: unknown;
} & SearchSchemaInput;

/** Keeps `q` only when it is a search the page would run: trimmed and non-empty. */
export function validateShopProfileSearch(search: RawShopProfileSearch): ShopProfileSearch {
    const q = typeof search.q === "string" ? search.q.trim() : "";
    return q.length > 0 ? { q } : {};
}
