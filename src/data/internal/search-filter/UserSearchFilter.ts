import type {
    UserSearchFilterData,
    ProductListingSearchData,
    PostUserSearchFilterData,
    PatchProductListingSearchData,
    PatchUserSearchFilterData,
} from "@/client";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { parseListingAvailability } from "@/data/internal/product/ListingAvailability.ts";
import { parseListingOrderability } from "@/data/internal/product/ListingOrderability.ts";
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
        orderability: parseListingOrderability(data.orderability),
        includeUnspecifiedAvailability: data.includeUnspecifiedAvailability,
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
    const availabilityCriteria = mapAvailabilityCriteria(args);
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
        ...availabilityCriteria,
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

function mapAvailabilityCriteria(
    args: SearchFilterArguments,
): Pick<
    ProductListingSearchData,
    "availability" | "orderability" | "includeUnspecifiedAvailability"
> {
    if (args.availability == null) {
        return {
            availability: null,
            orderability: null,
            includeUnspecifiedAvailability: null,
        };
    }

    return {
        availability: args.availability,
        orderability: args.orderability ?? null,
        includeUnspecifiedAvailability: args.includeUnspecifiedAvailability ?? null,
    };
}

function mapSearchFilterArgumentsToPatchProductSearchData(
    args: SearchFilterArguments,
): PatchProductListingSearchData {
    const mapped = mapSearchFilterArgumentsToProductSearchData(args);
    return {
        productQuery: mapped.productQuery,
        enhancedSearchDescription: mapped.enhancedSearchDescription ?? null,
        listingSourceId: mapped.listingSourceId ?? null,
        excludeListingSourceId: mapped.excludeListingSourceId ?? [],
        auctionId: mapped.auctionId ?? [],
        price: mapped.price ?? null,
        availability: mapped.availability ?? null,
        orderability: mapped.orderability ?? null,
        includeUnspecifiedAvailability: mapped.includeUnspecifiedAvailability ?? null,
        created: mapped.created ?? null,
        updated: mapped.updated ?? null,
        lotBiddingOpens: mapped.lotBiddingOpens ?? null,
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
        const mapped = mapSearchFilterArgumentsToPatchProductSearchData(data.search);
        search = {
            ...mapped,
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
