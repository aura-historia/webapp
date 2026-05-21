import { Controller, useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { useTranslation } from "react-i18next";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useSellerSearch } from "@/hooks/search/useSellerSearch.ts";

export function SellerIncludeFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["seller"] });
    const { t } = useTranslation();
    const { sellerOptions, handleSearchChange, isPending, searchQuery } = useSellerSearch();

    return (
        <div className="space-y-2">
            <Label>{t("search.filter.seller")}</Label>
            <Controller
                name="seller"
                control={control}
                render={({ field }) => {
                    const selectedOptions: MultiSelectOption[] = (field.value || []).map(
                        (name: string) => ({ value: name, label: name }),
                    );

                    return (
                        <MultiSelect
                            options={sellerOptions}
                            value={selectedOptions}
                            onChange={(options) => {
                                field.onChange(options.map((opt) => opt.value));
                            }}
                            onSearchChange={handleSearchChange}
                            placeholder={t("search.filter.searchSellers")}
                            isLoading={isPending && searchQuery.length > 0}
                            emptyMessage={t("search.filter.noSellersFound")}
                        />
                    );
                }}
            />
            {errors?.seller && (
                <p className="text-destructive text-sm mt-1">{errors.seller.message ?? ""}</p>
            )}
        </div>
    );
}
