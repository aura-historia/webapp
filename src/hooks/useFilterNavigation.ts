import type { FilterSchema } from "@/components/search/SearchFilters";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";
import { useFormContext } from "react-hook-form";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { formatToDateString } from "@/lib/utils.ts";

export function useFilterNavigation() {
    const navigate = useNavigate({ from: "/search" });
    const search = useSearch({ from: "/search" });
    const form = useFormContext<FilterSchema>();

    return (filterKey: keyof FilterSchema) => {
        form.setValue(filterKey, FILTER_DEFAULTS[filterKey]);
        const data = form.getValues();

        const isDefaultItemState =
            data.itemState.length === FILTER_DEFAULTS.itemState.length &&
            data.itemState.every((s) => FILTER_DEFAULTS.itemState.includes(s));

        const isDefaultPrice =
            data.priceSpan?.min === undefined && data.priceSpan?.max === undefined;

        const isDefaultCreationDate =
            data.creationDate.from === undefined && data.creationDate.to === undefined;

        const isDefaultUpdateDate =
            data.updateDate.from === undefined && data.updateDate.to === undefined;

        navigate({
            to: "/search",
            search: {
                q: search.q,
                priceFrom: isDefaultPrice ? undefined : data.priceSpan?.min,
                priceTo: isDefaultPrice ? undefined : data.priceSpan?.max,
                allowedStates: isDefaultItemState ? undefined : data.itemState,
                creationDateFrom: isDefaultCreationDate
                    ? undefined
                    : data.creationDate.from
                      ? formatToDateString(data.creationDate.from)
                      : undefined,
                creationDateTo: isDefaultCreationDate
                    ? undefined
                    : data.creationDate.to
                      ? formatToDateString(data.creationDate.to)
                      : undefined,
                updateDateFrom: isDefaultUpdateDate
                    ? undefined
                    : data.updateDate.from
                      ? formatToDateString(data.updateDate.from)
                      : undefined,
                updateDateTo: isDefaultUpdateDate
                    ? undefined
                    : data.updateDate.to
                      ? formatToDateString(data.updateDate.to)
                      : undefined,
                merchant: data.merchant ? data.merchant : undefined,
            },
        });
    };
}
