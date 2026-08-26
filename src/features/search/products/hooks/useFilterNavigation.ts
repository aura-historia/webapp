import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { FILTER_DEFAULTS } from "@/features/search/products/lib/filterDefaults.ts";
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
