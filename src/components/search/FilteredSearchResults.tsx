import { useFilteredSearch } from "@/hooks/useFilteredSearch.ts";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import { SearchResults } from "@/components/search/SearchResults.tsx";
import type { SearchResultSortMode } from "@/data/internal/SearchResultSortMode.ts";

type FilteredSearchResultsProps = {
    readonly searchFilters: SearchFilterArguments;
    readonly sortMode: SearchResultSortMode;
};

export function FilteredSearchResults({ searchFilters, sortMode }: FilteredSearchResultsProps) {
    const searchQuery = useFilteredSearch(searchFilters, sortMode);
    return <SearchResults query={searchFilters.q} searchQueryHook={searchQuery} />;
}
