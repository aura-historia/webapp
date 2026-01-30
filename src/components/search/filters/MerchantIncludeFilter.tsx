import { Controller, useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { useTranslation } from "react-i18next";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select.tsx";
import { useMutation } from "@tanstack/react-query";
import { searchShopsMutation } from "@/client/@tanstack/react-query.gen.ts";
import { useState, useCallback, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Label } from "@/components/ui/label.tsx";

const DEBOUNCE_DELAY_MS = 300;

export function MerchantIncludeFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["merchant"] });
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");

    const { mutate: searchShops, data: shopsData, isPending } = useMutation(searchShopsMutation());

    const debouncedSearch = useDebouncedCallback((query: string) => {
        if (query.length > 0) {
            searchShops({
                body: { shopNameQuery: query },
            });
        }
    }, DEBOUNCE_DELAY_MS);

    const handleSearchChange = useCallback(
        (query: string) => {
            setSearchQuery(query);
            debouncedSearch(query);
        },
        [debouncedSearch],
    );

    const shopOptions: MultiSelectOption[] = useMemo(() => {
        if (!shopsData?.items) return [];
        return shopsData.items.map((shop) => ({
            value: shop.name,
            label: shop.name,
        }));
    }, [shopsData?.items]);

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
                <p className="text-destructive text-sm mt-1">
                    {String(errors.merchant.message ?? "")}
                </p>
            )}
        </div>
    );
}
