import type { SearchSchemaInput } from "@tanstack/react-router";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import { type ShopType, parseShopType } from "@/data/internal/shop/ShopType.ts";
import {
    type ShopPartnerStatus,
    parseShopPartnerStatus,
    SHOP_PARTNER_STATUSES,
} from "@/data/internal/shop/ShopPartnerStatus.ts";
import { SHOP_SEARCH_SORT_FIELDS, type ShopSortMode } from "@/data/internal/search/ShopSortMode.ts";

export type RawShopSearchParams = {
    q: string;
    shopType?: ShopType[];
    partnerStatus?: ShopPartnerStatus[];
    creationDateFrom?: string;
    creationDateTo?: string;
    updateDateFrom?: string;
    updateDateTo?: string;
    sortField?: string;
    sortOrder?: string;
} & SearchSchemaInput;

function parseOptionalDate(value: string | undefined): Date | undefined {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseShopTypes(values: unknown): ShopType[] | undefined {
    if (!Array.isArray(values)) return undefined;
    return values
        .map((shopType) => parseShopType(shopType))
        .filter((elem, index, self) => index === self.indexOf(elem));
}

function parsePartnerStatuses(values: unknown): ShopPartnerStatus[] | undefined {
    if (!Array.isArray(values)) return undefined;
    return values
        .filter((v): v is string => typeof v === "string")
        .map((v) => parseShopPartnerStatus(v))
        .filter((s): s is ShopPartnerStatus =>
            (SHOP_PARTNER_STATUSES as readonly string[]).includes(s),
        )
        .filter((elem, index, self) => index === self.indexOf(elem));
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
        creationDateFrom: parseOptionalDate(search.creationDateFrom),
        creationDateTo: parseOptionalDate(search.creationDateTo),
        updateDateFrom: parseOptionalDate(search.updateDateFrom),
        updateDateTo: parseOptionalDate(search.updateDateTo),
        sortField: parseShopSortField(search.sortField),
        sortOrder: parseShopSortOrder(search.sortOrder),
    };
}

function serializeOptionalDate(date: Date | undefined): string | undefined {
    return date?.toISOString();
}

export function serializeShopSearchParams(
    params: ShopSearchFilterArguments,
): Omit<RawShopSearchParams, keyof SearchSchemaInput> {
    return {
        q: params.q,
        shopType: params.shopType,
        partnerStatus: params.partnerStatus,
        creationDateFrom: serializeOptionalDate(params.creationDateFrom),
        creationDateTo: serializeOptionalDate(params.creationDateTo),
        updateDateFrom: serializeOptionalDate(params.updateDateFrom),
        updateDateTo: serializeOptionalDate(params.updateDateTo),
        sortField: params.sortField,
        sortOrder: params.sortOrder,
    };
}
