import { useSimpleSearch } from "@/hooks/useSimpleSearch.ts";
import { SearchResults } from "@/components/search/SearchResults.tsx";

type SimpleSearchResultsProps = {
    readonly query: string;
};

export function SimpleSearchResults({ query }: SimpleSearchResultsProps) {
    const searchQuery = useSimpleSearch(query);
    return <SearchResults query={query} searchQueryHook={searchQuery} />;
}
