import { Controller, useFormContext, useFormState, useWatch } from "react-hook-form";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { useTranslation } from "react-i18next";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useMerchantSearch } from "@/features/search/products/hooks/useMerchantSearch.tsx";

export function MerchantExcludeFilter() {
    const { control, setValue } = useFormContext<FilterSchema>();
    const selectedLabels = useWatch({ control, name: "excludeListingSourceLabels" });
    const { errors } = useFormState({ control, name: ["excludeListingSourceId"] });
    const { t } = useTranslation();
    const { shopOptions, handleSearchChange, isPending, searchQuery } = useMerchantSearch();

    return (
        <div className="space-y-2">
            <Label>{t("search.filter.excludeListingSource")}</Label>
            <Controller
                name="excludeListingSourceId"
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
                            options={shopOptions}
                            value={selectedOptions}
                            onChange={(options) => {
                                field.onChange(options.map((opt) => opt.value));
                                setValue(
                                    "excludeListingSourceLabels",
                                    options.map((option) => option.label),
                                );
                            }}
                            onSearchChange={handleSearchChange}
                            placeholder={t("search.filter.searchExcludeListingSources")}
                            isLoading={isPending && searchQuery.length > 0}
                            emptyMessage={t("search.filter.noListingSourcesFound")}
                        />
                    );
                }}
            />
            {errors?.excludeListingSourceId && (
                <p className="text-destructive text-sm mt-1">
                    {errors.excludeListingSourceId.message ?? ""}
                </p>
            )}
        </div>
    );
}
