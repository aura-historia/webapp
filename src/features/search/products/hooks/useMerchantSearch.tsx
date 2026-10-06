import { useQuery } from "@tanstack/react-query";
import { searchPublicListingSourcesOptions } from "@/client/@tanstack/react-query.gen.ts";
import { useState, useCallback, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { MultiSelectOption } from "@/components/ui/multi-select.tsx";
import { mapPublicListingSource } from "@/data/internal/shop/PublicListingSource.ts";

const DEBOUNCE_DELAY_MS = 500;

export function useMerchantSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    const { data: sourcesData, isFetching } = useQuery({
        ...searchPublicListingSourcesOptions({ query: { query: debouncedQuery } }),
        enabled: debouncedQuery.length > 0,
    });

    const debouncedSearch = useDebouncedCallback((query: string) => {
        setDebouncedQuery(query);
    }, DEBOUNCE_DELAY_MS);

    const handleSearchChange = useCallback(
        (query: string) => {
            setSearchQuery(query);
            debouncedSearch(query);
        },
        [debouncedSearch],
    );

    const shopOptions: MultiSelectOption[] = useMemo(() => {
        if (!sourcesData?.items) return [];
        return sourcesData.items.map(mapPublicListingSource).map((source) => ({
            value: source.listingSourceId,
            label: source.name,
        }));
    }, [sourcesData?.items]);

    return {
        shopOptions,
        handleSearchChange,
        isPending: isFetching,
        searchQuery,
    };
}
