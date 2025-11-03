import { useSimpleSearch } from "@/hooks/useSimpleSearch.ts";
import { SearchResults } from "@/components/search/SearchResults.tsx";
import type { SearchResultSortMode } from "@/data/internal/SearchResultSortMode.ts";

type SimpleSearchResultsProps = {
    readonly query: string;
    readonly sortMode: SearchResultSortMode;
};

export function SimpleSearchResults({ query, sortMode }: SimpleSearchResultsProps) {
    const searchQuery = useSimpleSearch(query, sortMode);
    return <SearchResults query={query} searchQueryHook={searchQuery} />;
}
