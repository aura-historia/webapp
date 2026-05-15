import { Form } from "@/components/ui/form.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDebouncedCallback } from "use-debounce";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import {
    createFilterSchema,
    DEBOUNCE_DELAY_MS,
    type FilterSchema,
    mapFormValuesToSearchFilterArguments,
    mapSearchFiltersToFormValues,
} from "@/components/search/SearchFilters.tsx";

type Props = {
    readonly value: SearchFilterArguments;
    readonly onChange: (args: SearchFilterArguments) => void;
    readonly children: ReactNode;
};

/**
 * Shared form context for all filter components (PriceSpanFilter, ProductStateFilter, etc.).
 *
 * Used by the wizard (CreateSearchFilterWizard) instead of SearchFilters because:
 * SearchFilters writes every filter change into the URL — the wizard doesn't want that,
 * it just needs local state. Sharing the same component is not possible because hooks
 * (useNavigate etc.) cannot be called conditionally.
 *
 * Flow: user changes a filter → form.watch → debounce → Zod validates → onChange(SearchFilterArguments)
 */
export function SearchFilterFormProvider({ value, onChange, children }: Props) {
    const { t } = useTranslation();
    const filterSchema = useMemo(() => createFilterSchema(t), [t]);

    const form = useForm<FilterSchema>({
        resolver: zodResolver(filterSchema),
        defaultValues: mapSearchFiltersToFormValues(value),
        mode: "onChange",
    });

    const emitChange = useDebouncedCallback((data: unknown) => {
        const result = filterSchema.safeParse(data);
        if (!result.success) return;
        onChange(mapFormValuesToSearchFilterArguments(result.data, value.q));
    }, DEBOUNCE_DELAY_MS);

    useEffect(() => {
        const subscription = form.watch((data, { name }) => {
            if (!name) return;
            emitChange(data);
        });
        return () => {
            subscription.unsubscribe();
            emitChange.cancel();
        };
    }, [form, emitChange]);

    return (
        <Form {...form}>
            <form className="contents" onSubmit={(e) => e.preventDefault()}>
                {children}
            </form>
        </Form>
    );
}
