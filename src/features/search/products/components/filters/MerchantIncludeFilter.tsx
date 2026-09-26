import { Controller, useFormContext, useFormState, useWatch } from "react-hook-form";
import type { FilterSchema } from "@/features/search/common/lib/filterForm.ts";
import { useTranslation } from "react-i18next";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useMerchantSearch } from "@/features/search/products/hooks/useMerchantSearch.tsx";

export function MerchantIncludeFilter() {
    const { control, setValue } = useFormContext<FilterSchema>();
    const selectedLabels = useWatch({ control, name: "listingSourceLabels" });
    const { errors } = useFormState({ control, name: ["listingSourceId"] });
    const { t } = useTranslation();
    const { shopOptions, handleSearchChange, isPending, searchQuery } = useMerchantSearch();

    return (
        <div className="space-y-2">
            <Label>{t("search.filter.listingSource")}</Label>
            <Controller
                name="listingSourceId"
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
                                    "listingSourceLabels",
                                    options.map((option) => option.label),
                                );
                            }}
                            onSearchChange={handleSearchChange}
                            placeholder={t("search.filter.searchListingSources")}
                            isLoading={isPending && searchQuery.length > 0}
                            emptyMessage={t("search.filter.noListingSourcesFound")}
                        />
                    );
                }}
            />
            {errors?.listingSourceId && (
                <p className="text-destructive text-sm mt-1">
                    {errors.listingSourceId.message ?? ""}
                </p>
            )}
        </div>
    );
}
