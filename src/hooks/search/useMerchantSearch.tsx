import { useQuery } from "@tanstack/react-query";
import { simpleSearchShopsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { useState, useCallback, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { MultiSelectOption } from "@/components/ui/multi-select.tsx";

const DEBOUNCE_DELAY_MS = 500;

export function useMerchantSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    const { data: shopsData, isFetching } = useQuery({
        ...simpleSearchShopsOptions({ query: { shopNameQuery: debouncedQuery } }),
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
        if (!shopsData?.items) return [];
        return shopsData.items.map((shop) => ({
            value: shop.name,
            label: shop.name,
        }));
    }, [shopsData?.items]);

    return {
        shopOptions,
        handleSearchChange,
        isPending: isFetching,
        searchQuery,
    };
}
