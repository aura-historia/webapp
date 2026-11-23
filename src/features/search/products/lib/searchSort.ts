import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import type { SearchSortSelection } from "@/features/search/products/components/SearchSortControls.tsx";

/**
 * The sort the page shows. A distance order applies only once the starting point is known;
 * until then the search runs, and reads, in its ordinary order.
 */
export function getSearchSortSelection(
    searchArgs: SearchFilterArguments,
    originReady: boolean,
): SearchSortSelection {
    const location = searchArgs.location;
    if (location?.kind === "DISTANCE" && location.distanceOrder && originReady) {
        return { field: "DISTANCE", order: location.distanceOrder };
    }
    return { field: searchArgs.sortField ?? "RELEVANCE", order: searchArgs.sortOrder ?? "DESC" };
}

/**
 * Applies a sort choice. Distance is kept on the distance search (and replaces the ordinary sort,
 * which the request then omits); any other field clears the distance order. Without a distance
 * search, a distance choice changes nothing.
 */
export function applySearchSortSelection(
    searchArgs: SearchFilterArguments,
    next: SearchSortSelection,
): SearchFilterArguments | undefined {
    const location = searchArgs.location;
    const distanceLocation = location?.kind === "DISTANCE" ? location : undefined;
    if (next.field === "DISTANCE") {
        if (!distanceLocation) return undefined;
        return { ...searchArgs, location: { ...distanceLocation, distanceOrder: next.order } };
    }
    return {
        ...searchArgs,
        sortField: next.field,
        sortOrder: next.order,
        location: distanceLocation ? { ...distanceLocation, distanceOrder: undefined } : location,
    };
}
