import type {
    UserSearchFilterData,
    ProductSearchData,
    PostUserSearchFilterData,
    PatchUserSearchFilterData,
} from "@/client";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { parseProductState, mapToBackendState } from "@/data/internal/product/ProductState.ts";
import { parseShopType, mapToBackendShopType } from "@/data/internal/shop/ShopType.ts";
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
        priceFrom: data.price?.min == null ? undefined : data.price.min / 100,
        priceTo: data.price?.max == null ? undefined : data.price.max / 100,
        allowedStates: data.state?.map((s) => parseProductState(s)),
        creationDateFrom: data.created?.min ? new Date(data.created.min) : undefined,
        creationDateTo: data.created?.max ? new Date(data.created.max) : undefined,
        updateDateFrom: data.updated?.min ? new Date(data.updated.min) : undefined,
        updateDateTo: data.updated?.max ? new Date(data.updated.max) : undefined,
        auctionDateFrom: data.auctionStart?.min ? new Date(data.auctionStart.min) : undefined,
        auctionDateTo: data.auctionStart?.max ? new Date(data.auctionStart.max) : undefined,
        merchant: data.shopName,
        excludeMerchant: data.excludeShopName,
        seller: data.sellerName,
        excludeSeller: data.excludeSellerName,
        shopType: data.shopType?.map((t) => parseShopType(t)),
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
                      min: args.priceFrom == null ? undefined : args.priceFrom * 100,
                      max: args.priceTo == null ? undefined : args.priceTo * 100,
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
        sellerName: args.seller,
        excludeSellerName: args.excludeSeller,
        shopType: args.shopType
            ?.map((t) => mapToBackendShopType(t))
            .filter((t): t is NonNullable<typeof t> => t !== undefined),
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
 * Problem: The search page automatically sets premium filter fields (shopType) as default values
 * in the URL – even if the user has never used these fields before. If these are included when saving,
 * the API rejects the request for FREE users with a 422 SEARCH_FILTER_RESTRICTED_FEATURE error.
 *
 * Solution: Fields that match their default values are omitted (undefined).
 * Empty arrays ([] = nothing selected) cannot occur in the wizard due to requireSelection enforcement.
 */

export function mapToBackendCreateUserSearchFilter(
    data: UserSearchFilterCreateData,
): PostUserSearchFilterData {
    const search = mapSearchFilterArgumentsToProductSearchData(data.search);
    const arraysEqual = <T>(a: T[], b: T[]): boolean =>
        a.length === b.length && a.every((v) => b.includes(v));
    const isDefaultOrEmpty = (value: unknown[] | undefined, defaults: unknown[]) =>
        !value?.length || arraysEqual(value, defaults);
    return {
        name: data.name,
        enhancedSearchDescription: data.enhancedSearchDescription,
        search: {
            ...search,
            shopType: isDefaultOrEmpty(data.search.shopType, FILTER_DEFAULTS.shopType)
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
