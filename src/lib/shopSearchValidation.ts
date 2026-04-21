import type { SearchSchemaInput } from "@tanstack/react-router";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import {
    type ShopPartnerStatus,
    parseShopPartnerStatus,
    SHOP_PARTNER_STATUSES,
} from "@/data/internal/shop/ShopPartnerStatus.ts";
import { SHOP_SEARCH_SORT_FIELDS, type ShopSortMode } from "@/data/internal/search/ShopSortMode.ts";

export type RawShopSearchParams = {
    q: string;
    partnerStatus?: ShopPartnerStatus[];
    sortField?: string;
    sortOrder?: string;
} & SearchSchemaInput;

function parsePartnerStatuses(values: unknown): ShopPartnerStatus[] | undefined {
    if (!Array.isArray(values)) return undefined;
    const seen = new Set<ShopPartnerStatus>();
    for (const v of values) {
        if (typeof v !== "string") continue;
        const parsed = parseShopPartnerStatus(v);
        if ((SHOP_PARTNER_STATUSES as readonly string[]).includes(parsed)) {
            seen.add(parsed);
        }
    }
    return seen.size === 0 ? [] : Array.from(seen);
}

function parseShopSortField(field: string | undefined): ShopSortMode["field"] {
    return SHOP_SEARCH_SORT_FIELDS.includes(field as ShopSortMode["field"])
        ? (field as ShopSortMode["field"])
        : "RELEVANCE";
}

function parseShopSortOrder(order: string | undefined): ShopSortMode["order"] {
    return order === "ASC" || order === "DESC" ? order : "DESC";
}

export function validateShopSearchParams(search: RawShopSearchParams): ShopSearchFilterArguments {
    return {
        q: (search.q as string) || "",
        partnerStatus: parsePartnerStatuses(search.partnerStatus),
        sortField: parseShopSortField(search.sortField),
        sortOrder: parseShopSortOrder(search.sortOrder),
    };
}

export function serializeShopSearchParams(
    params: ShopSearchFilterArguments,
): Omit<RawShopSearchParams, keyof SearchSchemaInput> {
    return {
        q: params.q,
        partnerStatus: params.partnerStatus,
        sortField: params.sortField,
        sortOrder: params.sortOrder,
    };
}
