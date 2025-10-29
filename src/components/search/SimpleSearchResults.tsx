import { useSimpleSearch } from "@/hooks/useSimpleSearch.ts";
import { SearchResults } from "@/components/search/SearchResults.tsx";

type SimpleSearchResultsProps = {
    readonly query: string;
    readonly onTotalChange?: (total: number) => void;
};

export function SimpleSearchResults({ query, onTotalChange }: SimpleSearchResultsProps) {
    const searchQuery = useSimpleSearch(query);
    return (
        <SearchResults query={query} searchQueryHook={searchQuery} onTotalChange={onTotalChange} />
    );
}
