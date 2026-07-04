import type { SearchSchemaInput } from "@tanstack/react-router";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import {
    type ShopPartnerStatus,
    parseShopPartnerStatus,
    SHOP_PARTNER_STATUSES,
} from "@/data/internal/shop/ShopPartnerStatus.ts";
import { SHOP_SEARCH_SORT_FIELDS, type ShopSortMode } from "@/data/internal/search/ShopSortMode.ts";
import { SHOP_TYPES, type ShopType, parseShopType } from "@/data/internal/shop/ShopType.ts";

const SHOP_TYPE_SET = new Set<string>(SHOP_TYPES);

export type RawShopSearchParams = {
    q: string;
    shopType?: ShopType[];
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

function isShopType(value: string): value is ShopType {
    return SHOP_TYPE_SET.has(value);
}

function parseShopTypes(values: unknown): ShopType[] | undefined {
    if (!Array.isArray(values)) return undefined;
    const seen = new Set<ShopType>();
    for (const v of values) {
        if (typeof v !== "string") continue;
        const parsed = parseShopType(v);
        if (parsed && isShopType(parsed)) {
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
        shopType: parseShopTypes(search.shopType),
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
        shopType: params.shopType,
        partnerStatus: params.partnerStatus,
        sortField: params.sortField,
        sortOrder: params.sortOrder,
    };
}
