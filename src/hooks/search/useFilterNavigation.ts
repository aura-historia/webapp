import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";
import { useFormContext } from "react-hook-form";

/**
 * Resets a single filter field to its default value.
 * form.watch in SearchFilters (navigate) and SearchFilterFormStandalone (onChange)
 * picks up the change automatically — no router hooks needed here.
 */
export function useFilterNavigation() {
    const form = useFormContext<FilterSchema>();

    return (filterKey: keyof FilterSchema) => {
        form.setValue(filterKey, FILTER_DEFAULTS[filterKey], { shouldDirty: true });
    };
}
