import { Controller, useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { useTranslation } from "react-i18next";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useMerchantSearch } from "@/hooks/search/useMerchantSearch.tsx";

export function MerchantIncludeFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["merchant"] });
    const { t } = useTranslation();
    const { shopOptions, handleSearchChange, isPending, searchQuery } = useMerchantSearch();

    return (
        <div className="space-y-2">
            <Label>{t("search.filter.merchant")}</Label>
            <Controller
                name="merchant"
                control={control}
                render={({ field }) => {
                    const selectedOptions: MultiSelectOption[] = (field.value || []).map(
                        (name: string) => ({ value: name, label: name }),
                    );

                    return (
                        <MultiSelect
                            options={shopOptions}
                            value={selectedOptions}
                            onChange={(options) => {
                                field.onChange(options.map((opt) => opt.value));
                            }}
                            onSearchChange={handleSearchChange}
                            placeholder={t("search.filter.searchMerchants")}
                            isLoading={isPending && searchQuery.length > 0}
                            emptyMessage={t("search.filter.noMerchantsFound")}
                        />
                    );
                }}
            />
            {errors?.merchant && (
                <p className="text-destructive text-sm mt-1">{errors.merchant.message ?? ""}</p>
            )}
        </div>
    );
}
