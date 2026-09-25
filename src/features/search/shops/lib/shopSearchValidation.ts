import type { SearchSchemaInput } from "@tanstack/react-router";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";

export type RawShopSearchParams = {
    q: string;
} & SearchSchemaInput;

export function validateShopSearchParams(search: RawShopSearchParams): ShopSearchFilterArguments {
    return {
        q: (search.q as string) || "",
    };
}

export function serializeShopSearchParams(
    params: ShopSearchFilterArguments,
): Omit<RawShopSearchParams, keyof SearchSchemaInput> {
    return { q: params.q };
}
