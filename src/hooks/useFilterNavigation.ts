import type { FilterSchema } from "@/components/search/SearchFilters";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";
import { useFormContext } from "react-hook-form";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { formatToDateString } from "@/lib/utils.ts";

function isDefaultItemState(states: FilterSchema["itemState"]): boolean {
    return (
        states.length === FILTER_DEFAULTS.itemState.length &&
        states.every((s) => FILTER_DEFAULTS.itemState.includes(s))
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
                allowedStates: isDefaultItemState(data.itemState) ? undefined : data.itemState,
                creationDateFrom: creationDateRange?.from,
                creationDateTo: creationDateRange?.to,
                updateDateFrom: updateDateRange?.from,
                updateDateTo: updateDateRange?.to,
                merchant: data.merchant || undefined,
            },
        });
    };
}
