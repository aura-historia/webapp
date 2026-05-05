import type { SortShopFieldData } from "@/client";

export const SHOP_SEARCH_SORT_FIELDS = [
    "RELEVANCE",
    "NAME",
    "CREATION_DATE",
    "UPDATE_DATE",
] as const;

export type ShopSortMode = {
    field: (typeof SHOP_SEARCH_SORT_FIELDS)[number];
    order: "ASC" | "DESC";
};

export function getShopSortModeFieldLabel(field: (typeof SHOP_SEARCH_SORT_FIELDS)[number]): string {
    switch (field) {
        case "RELEVANCE":
            return "search.sortMode.relevance";
        case "NAME":
            return "search.sortMode.name";
        case "CREATION_DATE":
            return "search.sortMode.creationDate";
        case "UPDATE_DATE":
            return "search.sortMode.updateDate";
        default:
            return "search.sortMode.relevance";
    }
}

export function mapToBackendShopSortModeArguments(sortMode?: ShopSortMode): {
    sort: SortShopFieldData;
    order: "asc" | "desc";
} {
    let sort: SortShopFieldData;
    let order: "asc" | "desc";

    switch (sortMode?.field) {
        case "RELEVANCE":
            sort = "score";
            break;
        case "NAME":
            sort = "name";
            break;
        case "CREATION_DATE":
            sort = "created";
            break;
        case "UPDATE_DATE":
            sort = "updated";
            break;
        default:
            sort = "score";
    }

    if (sortMode?.order === "ASC") {
        order = "asc";
    } else {
        order = "desc";
    }

    return { sort, order };
}
