import type { SortProductListingFieldData } from "@/client";

export const SEARCH_RESULT_SORT_FIELDS = ["RELEVANCE", "CREATION_DATE", "UPDATE_DATE"] as const;

export type SortMode = {
    field: (typeof SEARCH_RESULT_SORT_FIELDS)[number];
    order: "ASC" | "DESC";
};

export function getSortModeFieldLabel(field: (typeof SEARCH_RESULT_SORT_FIELDS)[number]): string {
    switch (field) {
        case "RELEVANCE":
            return "search.sortMode.relevance";
        case "CREATION_DATE":
            return "search.sortMode.creationDate";
        case "UPDATE_DATE":
            return "search.sortMode.updateDate";
        default:
            return "search.sortMode.relevance";
    }
}

export function mapToBackendSortModeArguments(sortMode?: SortMode): {
    sort: SortProductListingFieldData;
    order: "asc" | "desc";
} {
    let sort: SortProductListingFieldData;
    let order: "asc" | "desc";

    switch (sortMode?.field) {
        case "RELEVANCE":
            sort = "score";
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
