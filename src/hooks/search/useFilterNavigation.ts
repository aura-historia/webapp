import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";
import { useFormContext } from "react-hook-form";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { formatToDateString } from "@/lib/utils.ts";

function isDefaultProductState(states: FilterSchema["productState"]): boolean {
    return (
        states.length === FILTER_DEFAULTS.productState.length &&
        states.every((s) => FILTER_DEFAULTS.productState.includes(s))
    );
}

function isDefaultShopType(types: FilterSchema["shopType"]): boolean {
    return (
        types.length === FILTER_DEFAULTS.shopType.length &&
        types.every((t) => FILTER_DEFAULTS.shopType.includes(t))
    );
}

function isDefaultDateRange(range: { from?: Date; to?: Date }): boolean {
    return range.from === undefined && range.to === undefined;
}

function formatDateRangeForUrl(range: {
    from?: Date;
    to?: Date;
}): { from?: string; to?: string } | null {
    if (isDefaultDateRange(range)) return null;

    return {
        from: range.from ? formatToDateString(range.from) : undefined,
        to: range.to ? formatToDateString(range.to) : undefined,
    };
}

export function useFilterNavigation() {
    const navigate = useNavigate({ from: "/search" });
    const search = useSearch({ from: "/search" });
    const form = useFormContext<FilterSchema>();

    return async (filterKey: keyof FilterSchema) => {
        form.setValue(filterKey, FILTER_DEFAULTS[filterKey]);
        const data = form.getValues();

        const hasCustomPrice =
            data.priceSpan?.min !== undefined || data.priceSpan?.max !== undefined;
        const creationDateRange = formatDateRangeForUrl(data.creationDate);
        const updateDateRange = formatDateRangeForUrl(data.updateDate);

        await navigate({
            to: "/search",
            search: {
                q: search.q,
                priceFrom: hasCustomPrice ? data.priceSpan?.min : undefined,
                priceTo: hasCustomPrice ? data.priceSpan?.max : undefined,
                allowedStates: isDefaultProductState(data.productState)
                    ? undefined
                    : data.productState,
                creationDateFrom: creationDateRange?.from,
                creationDateTo: creationDateRange?.to,
                updateDateFrom: updateDateRange?.from,
                updateDateTo: updateDateRange?.to,
                merchant: data.merchant || undefined,
                excludeMerchant: data.excludeMerchant || undefined,
                shopType: isDefaultShopType(data.shopType) ? undefined : data.shopType,
            },
        });
    };
}
