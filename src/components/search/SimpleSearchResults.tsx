import { useSimpleSearch } from "@/hooks/useSimpleSearch.ts";
import { SearchResults } from "@/components/search/SearchResults.tsx";
import type { SortMode } from "@/data/internal/SortMode.ts";

type SimpleSearchResultsProps = {
    readonly query: string;
    readonly sortMode: SortMode | undefined;
    readonly onTotalChange?: (total: number) => void;
};

export function SimpleSearchResults({ query, sortMode, onTotalChange }: SimpleSearchResultsProps) {
    const searchQuery = useSimpleSearch(query, sortMode);
    return (
        <SearchResults query={query} searchQueryHook={searchQuery} onTotalChange={onTotalChange} />
    );
}
