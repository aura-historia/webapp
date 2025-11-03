import type { SortItemFieldData } from "@/client";

export const SEARCH_RESULT_SORT_FIELDS = [
    "RELEVANCE",
    "PRICE",
    "CREATION_DATE",
    "UPDATE_DATE",
] as const;

export type SearchResultSortMode = {
    field: (typeof SEARCH_RESULT_SORT_FIELDS)[number];
    order: "ASC" | "DESC";
};

export function getSearchResultSortModeLabel(sortMode: SearchResultSortMode): string {
    switch (sortMode.field) {
        case "RELEVANCE":
            return "search.sortMode.relevance";
        case "PRICE":
            return "search.sortMode.price";
        case "CREATION_DATE":
            return "search.sortMode.creationDate";
        case "UPDATE_DATE":
            return "search.sortMode.updateDate";
        default:
            return "search.sortMode.relevance";
    }
}

export function mapToBackendSortModeArguments(sortMode: SearchResultSortMode): {
    sort: SortItemFieldData;
    order: "asc" | "desc";
} {
    let sort: SortItemFieldData;
    let order: "asc" | "desc";

    switch (sortMode.field) {
        case "RELEVANCE":
            sort = "score";
            break;
        case "PRICE":
            sort = "price";
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

    if (sortMode.order === "ASC") {
        order = "asc";
    } else {
        order = "desc";
    }

    return { sort, order };
}
