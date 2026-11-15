import type { UserSearchFilterCollectionData } from "@/client";
import {
    mapToInternalUserSearchFilter,
    type UserSearchFilter,
} from "@/data/internal/search-filter/UserSearchFilter.ts";

export type UserSearchFilterCollection = {
    readonly items: readonly UserSearchFilter[];
    readonly from: number;
    readonly size: number;
    readonly total?: number;
};

/**
 * The number of search filters that count toward a plan's quota. The backend counts only
 * `ACTIVE` ones; paused and plan-locked filters are free. The list endpoint takes no paging
 * parameters and returns every filter of the user, so counting `items` is complete.
 */
export function countActiveSearchFilters(collection?: UserSearchFilterCollection): number {
    return collection?.items.filter((filter) => filter.state === "ACTIVE").length ?? 0;
}

export function mapToInternalUserSearchFilterCollection(
    data: UserSearchFilterCollectionData,
): UserSearchFilterCollection {
    return {
        items: data.items.map(mapToInternalUserSearchFilter),
        from: data.from,
        size: data.size,
        total: data.total ?? undefined,
    };
}
