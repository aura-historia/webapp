import { useFilteredSearch } from "@/hooks/useFilteredSearch.ts";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import { SearchResults } from "@/components/search/SearchResults.tsx";

type FilteredSearchResultsProps = {
    readonly searchFilters: SearchFilterArguments;
};

export function FilteredSearchResults({ searchFilters }: FilteredSearchResultsProps) {
    const searchQuery = useFilteredSearch(searchFilters);
    return <SearchResults query={searchFilters.q} searchQueryHook={searchQuery} />;
}
