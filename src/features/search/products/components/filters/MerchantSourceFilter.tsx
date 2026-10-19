import { useId } from "react";
import { Controller, useFormContext, useFormState, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select.tsx";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { useMerchantSearch } from "@/features/search/products/hooks/useMerchantSearch.tsx";

const FIELDS = {
    include: {
        ids: "listingSourceId",
        labels: "listingSourceLabels",
        label: "search.filter.includeProviders",
        placeholder: "search.filter.searchListingSources",
        selected: "search.filter.includedSources",
    },
    exclude: {
        ids: "excludeListingSourceId",
        labels: "excludeListingSourceLabels",
        label: "search.filter.excludeProviders",
        placeholder: "search.filter.searchExcludeListingSources",
        selected: "search.filter.excludedSources",
    },
} as const;

/** Provider search that includes or excludes listing sources from the results. */
export function MerchantSourceFilter({ mode }: { readonly mode: "include" | "exclude" }) {
    const fields = FIELDS[mode];
    const { control, setValue } = useFormContext<FilterSchema>();
    const selectedLabels = useWatch({ control, name: fields.labels });
    const { errors } = useFormState({ control, name: [fields.ids] });
    const { t } = useTranslation();
    const inputId = useId();
    const { shopOptions, handleSearchChange, isPending, searchQuery } = useMerchantSearch();
    const error = errors?.[fields.ids];

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className="text-meta text-ink-secondary">
                {t(fields.label)}
            </label>
            <Controller
                name={fields.ids}
                control={control}
                render={({ field }) => {
                    const selectedOptions: MultiSelectOption[] = (field.value || []).map(
                        (id: string, index: number) => ({
                            value: id,
                            label: selectedLabels?.[index] ?? id,
                        }),
                    );

                    return (
                        <MultiSelect
                            id={inputId}
                            tone={mode}
                            options={shopOptions}
                            value={selectedOptions}
                            onChange={(options) => {
                                field.onChange(options.map((option) => option.value));
                                setValue(
                                    fields.labels,
                                    options.map((option) => option.label),
                                );
                            }}
                            onSearchChange={handleSearchChange}
                            placeholder={t(fields.placeholder)}
                            isLoading={isPending && searchQuery.length > 0}
                            emptyMessage={t("search.filter.noListingSourcesFound")}
                            selectedLabel={t(fields.selected)}
                            removeLabel={(label) => t("search.filter.removeSource", { label })}
                        />
                    );
                }}
            />
            {error && <p className="text-meta text-oxblood">{error.message ?? ""}</p>}
        </div>
    );
}
