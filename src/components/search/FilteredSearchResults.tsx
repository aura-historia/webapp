import { useFilteredSearch } from "@/hooks/useFilteredSearch.ts";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import { SearchResults } from "@/components/search/SearchResults.tsx";

type FilteredSearchResultsProps = {
    readonly searchFilters: SearchFilterArguments;
    readonly onTotalChange?: (total: number) => void;
};

export function FilteredSearchResults({
    searchFilters,
    onTotalChange,
}: FilteredSearchResultsProps) {
    const searchQuery = useFilteredSearch(searchFilters);
    return (
        <SearchResults
            query={searchFilters.q}
            searchQueryHook={searchQuery}
            onTotalChange={onTotalChange}
        />
    );
}
