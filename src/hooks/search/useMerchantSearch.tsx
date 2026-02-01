import { useMutation } from "@tanstack/react-query";
import { searchShopsMutation } from "@/client/@tanstack/react-query.gen.ts";
import { useState, useCallback, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { MultiSelectOption } from "@/components/ui/multi-select.tsx";

const DEBOUNCE_DELAY_MS = 300;

export function useMerchantSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const { mutate: searchShops, data: shopsData, isPending } = useMutation(searchShopsMutation());

    const debouncedSearch = useDebouncedCallback((query: string) => {
        if (query.length > 0) {
            searchShops({ body: { shopNameQuery: query } });
        }
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
        isPending,
        searchQuery,
    };
}
