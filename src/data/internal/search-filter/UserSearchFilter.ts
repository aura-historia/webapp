import type {
    UserSearchFilterData,
    ProductListingSearchData,
    PostUserSearchFilterData,
    PatchProductListingSearchData,
    PatchUserSearchFilterData,
} from "@/client";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { parseListingAvailability } from "@/data/internal/product/ListingAvailability.ts";
import {
    parseResourceState,
    type ResourceState,
    type PatchResourceState,
} from "@/data/internal/common/ResourceState.ts";

export type UserSearchFilter = {
    readonly userId: string;
    readonly id: string;
    readonly name: string;
    readonly enhancedSearchDescription?: string;
    readonly notifications: boolean;
    readonly state: ResourceState;
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
    readonly state?: PatchResourceState;
    readonly search?: SearchFilterArguments;
};

export function mapProductSearchDataToSearchFilterArguments(
    data: ProductListingSearchData,
): SearchFilterArguments {
    return {
        q: data.productQuery?.[0] ?? "",
        queryTerms: data.productQuery,
        priceFrom: data.price?.min == null ? undefined : data.price.min / 100,
        priceTo: data.price?.max == null ? undefined : data.price.max / 100,
        enhancedSearchDescription: data.enhancedSearchDescription ?? undefined,
        excludeProductId: data.excludeProductId,
        listingSourceId: data.listingSourceId,
        excludeListingSourceId: data.excludeListingSourceId ?? undefined,
        auctionId: data.auctionId ?? undefined,
        availability: parseListingAvailability(data.availability),
        creationDateFrom: data.created?.min ? new Date(data.created.min) : undefined,
        creationDateTo: data.created?.max ? new Date(data.created.max) : undefined,
        updateDateFrom: data.updated?.min ? new Date(data.updated.min) : undefined,
        updateDateTo: data.updated?.max ? new Date(data.updated.max) : undefined,
        auctionDateFrom: data.lotBiddingOpens?.min ? new Date(data.lotBiddingOpens.min) : undefined,
        auctionDateTo: data.lotBiddingOpens?.max ? new Date(data.lotBiddingOpens.max) : undefined,
    };
}

export function mapSearchFilterArgumentsToProductSearchData(
    args: SearchFilterArguments,
): ProductListingSearchData {
    return {
        productQuery: args.queryTerms?.length ? args.queryTerms : args.q ? [args.q] : [],
        price:
            args.priceFrom != null || args.priceTo != null
                ? {
                      min: args.priceFrom == null ? undefined : args.priceFrom * 100,
                      max: args.priceTo == null ? undefined : args.priceTo * 100,
                  }
                : undefined,
        enhancedSearchDescription: args.enhancedSearchDescription,
        excludeProductId: args.excludeProductId,
        listingSourceId: args.listingSourceId,
        excludeListingSourceId: args.excludeListingSourceId,
        auctionId: args.auctionId,
        availability: args.availability,
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
        lotBiddingOpens:
            args.auctionDateFrom != null || args.auctionDateTo != null
                ? {
                      min: args.auctionDateFrom?.toISOString(),
                      max: args.auctionDateTo?.toISOString(),
                  }
                : undefined,
    };
}

export function mapToInternalUserSearchFilter(data: UserSearchFilterData): UserSearchFilter {
    return {
        userId: data.userId,
        id: data.userSearchFilterId,
        name: data.name,
        enhancedSearchDescription: data.search.enhancedSearchDescription ?? undefined,
        notifications: data.notifications,
        state: parseResourceState(data.state),
        search: mapProductSearchDataToSearchFilterArguments(data.search),
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}

/**
 * Search filters share the canonical listing-search criteria. The personal-search workflow owns
 * subscription-specific orderability controls and those fields are deliberately left to its adapter.
 */

export function mapToBackendCreateUserSearchFilter(
    data: UserSearchFilterCreateData,
): PostUserSearchFilterData {
    const search = mapSearchFilterArgumentsToProductSearchData(data.search);
    return {
        name: data.name,
        search: {
            ...search,
            enhancedSearchDescription: data.enhancedSearchDescription,
        },
    };
}

export function mapToBackendPatchUserSearchFilter(
    data: UserSearchFilterPatchData,
): PatchUserSearchFilterData {
    let search: PatchProductListingSearchData | undefined;

    if (data.search) {
        const mapped = mapSearchFilterArgumentsToProductSearchData(data.search);
        search = {
            ...mapped,
            auctionId: mapped.auctionId ?? undefined,
            excludeListingSourceId: mapped.excludeListingSourceId ?? undefined,
        };
    }

    if (data.enhancedSearchDescription !== undefined) {
        if (search === undefined) {
            search = {};
        }
        search.enhancedSearchDescription = data.enhancedSearchDescription;
    }

    return {
        name: data.name,
        notifications: data.notifications,
        state: data.state,
        search: search,
    };
}
