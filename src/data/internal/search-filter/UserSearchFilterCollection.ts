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
