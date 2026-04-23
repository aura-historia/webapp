import type {
    UserSearchFilterData,
    ProductSearchData,
    PostUserSearchFilterData,
    PatchUserSearchFilterData,
} from "@/client";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { parseProductState, mapToBackendState } from "@/data/internal/product/ProductState.ts";
import {
    parseAuthenticity,
    mapToBackendAuthenticity,
} from "@/data/internal/quality-indicators/Authenticity.ts";
import {
    parseCondition,
    mapToBackendCondition,
} from "@/data/internal/quality-indicators/Condition.ts";
import {
    parseProvenance,
    mapToBackendProvenance,
} from "@/data/internal/quality-indicators/Provenance.ts";
import {
    parseRestoration,
    mapToBackendRestoration,
} from "@/data/internal/quality-indicators/Restoration.ts";
import { parseShopType, mapToBackendShopType } from "@/data/internal/shop/ShopType.ts";
import { isEqual } from "lodash";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";

export type UserSearchFilter = {
    readonly userId: string;
    readonly id: string;
    readonly name: string;
    readonly enhancedSearchDescription?: string;
    readonly notifications: boolean;
    readonly search: SearchFilterArguments;
    readonly created: Date;
    readonly updated: Date;
};

export type UserSearchFilterCreateData = {
    readonly name: string;
    readonly enhancedSearchDescription?: string;
    readonly search: SearchFilterArguments;
};

export type UserSearchFilterPatchData = {
    readonly name?: string;
    readonly enhancedSearchDescription?: string | null;
    readonly notifications?: boolean;
    readonly search?: SearchFilterArguments;
};

export function mapProductSearchDataToSearchFilterArguments(
    data: ProductSearchData,
): SearchFilterArguments {
    return {
        q: data.productQuery ?? "",
        priceFrom: data.price?.min != null ? data.price.min / 100 : undefined,
        priceTo: data.price?.max != null ? data.price.max / 100 : undefined,
        allowedStates: data.state?.map((s) => parseProductState(s)),
        creationDateFrom: data.created?.min ? new Date(data.created.min) : undefined,
        creationDateTo: data.created?.max ? new Date(data.created.max) : undefined,
        updateDateFrom: data.updated?.min ? new Date(data.updated.min) : undefined,
        updateDateTo: data.updated?.max ? new Date(data.updated.max) : undefined,
        auctionDateFrom: data.auctionStart?.min ? new Date(data.auctionStart.min) : undefined,
        auctionDateTo: data.auctionStart?.max ? new Date(data.auctionStart.max) : undefined,
        merchant: data.shopName,
        excludeMerchant: data.excludeShopName,
        shopType: data.shopType?.map((t) => parseShopType(t)),
        periodId: data.periodId,
        categoryId: data.categoryId,
        originYearMin: data.originYear?.min,
        originYearMax: data.originYear?.max,
        authenticity: data.authenticity?.map((a) => parseAuthenticity(a)),
        condition: data.condition?.map((c) => parseCondition(c)),
        provenance: data.provenance?.map((p) => parseProvenance(p)),
        restoration: data.restoration?.map((r) => parseRestoration(r)),
    };
}

export function mapSearchFilterArgumentsToProductSearchData(
    args: SearchFilterArguments,
): ProductSearchData {
    return {
        productQuery: args.q || undefined,
        price:
            args.priceFrom != null || args.priceTo != null
                ? {
                      min: args.priceFrom != null ? args.priceFrom * 100 : undefined,
                      max: args.priceTo != null ? args.priceTo * 100 : undefined,
                  }
                : undefined,
        state: args.allowedStates?.map((s) => mapToBackendState(s)),
        created:
            args.creationDateFrom != null || args.creationDateTo != null
                ? {
                      min: args.creationDateFrom?.toISOString(),
                      max: args.creationDateTo?.toISOString(),
                  }
                : undefined,
        updated:
            args.updateDateFrom != null || args.updateDateTo != null
                ? {
                      min: args.updateDateFrom?.toISOString(),
                      max: args.updateDateTo?.toISOString(),
                  }
                : undefined,
        auctionStart:
            args.auctionDateFrom != null || args.auctionDateTo != null
                ? {
                      min: args.auctionDateFrom?.toISOString(),
                      max: args.auctionDateTo?.toISOString(),
                  }
                : undefined,
        shopName: args.merchant,
        excludeShopName: args.excludeMerchant,
        shopType: args.shopType
            ?.map((t) => mapToBackendShopType(t))
            .filter((t): t is NonNullable<typeof t> => t !== undefined),
        periodId: args.periodId,
        categoryId: args.categoryId,
        originYear:
            args.originYearMin != null || args.originYearMax != null
                ? { min: args.originYearMin, max: args.originYearMax }
                : undefined,
        authenticity: args.authenticity?.map((a) => mapToBackendAuthenticity(a)),
        condition: args.condition?.map((c) => mapToBackendCondition(c)),
        provenance: args.provenance?.map((p) => mapToBackendProvenance(p)),
        restoration: args.restoration?.map((r) => mapToBackendRestoration(r)),
    };
}

export function mapToInternalUserSearchFilter(data: UserSearchFilterData): UserSearchFilter {
    return {
        userId: data.userId,
        id: data.userSearchFilterId,
        name: data.name,
        enhancedSearchDescription: data.enhancedSearchDescription,
        notifications: data.notifications,
        search: mapProductSearchDataToSearchFilterArguments(data.search),
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}

/**
 * Problem: The search page automatically sets premium filter fields (authenticity, condition, provenance,
 * restoration, shopType) as default values in the URL—even if the user
 * has never interacted with them. If these are included when saving, the API rejects the request
 * for FREE users with a 422 SEARCH_FILTER_RESTRICTED_FEATURE error.
 *
 * Solution: Fields that still correspond to their default values are omitted (undefined).
 *
 * The default always contains all possible values. The API treats
 * “send all values” and “omit field” identically—in both cases, all
 * products are returned. The search and search request thus return the same results.
 */
export function mapToBackendCreateUserSearchFilter(
    data: UserSearchFilterCreateData,
): PostUserSearchFilterData {
    const search = mapSearchFilterArgumentsToProductSearchData(data.search);

    return {
        name: data.name,
        enhancedSearchDescription: data.enhancedSearchDescription,
        search: {
            ...search,
            authenticity: isEqual(data.search.authenticity, FILTER_DEFAULTS.authenticity)
                ? undefined
                : search.authenticity,
            condition: isEqual(data.search.condition, FILTER_DEFAULTS.condition)
                ? undefined
                : search.condition,
            provenance: isEqual(data.search.provenance, FILTER_DEFAULTS.provenance)
                ? undefined
                : search.provenance,
            restoration: isEqual(data.search.restoration, FILTER_DEFAULTS.restoration)
                ? undefined
                : search.restoration,
            shopType: isEqual(data.search.shopType, FILTER_DEFAULTS.shopType)
                ? undefined
                : search.shopType,
        },
    };
}

export function mapToBackendPatchUserSearchFilter(
    data: UserSearchFilterPatchData,
): PatchUserSearchFilterData {
    return {
        name: data.name,
        enhancedSearchDescription: data.enhancedSearchDescription,
        notifications: data.notifications,
        search: data.search ? mapSearchFilterArgumentsToProductSearchData(data.search) : undefined,
    };
}
