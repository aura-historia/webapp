import { Controller, useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { useTranslation } from "react-i18next";
import { useFilterNavigation } from "@/hooks/search/useFilterNavigation.ts";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";
import { useMemo } from "react";
import { FilterCard } from "./FilterCard.tsx";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesOptions } from "@/client/@tanstack/react-query.gen.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";

export function CategoryFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t, i18n } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    const { data: categories } = useQuery(
        getCategoriesOptions({
            query: { language: parseLanguage(i18n.language) },
        }),
    );

    const options = useMemo(
        () =>
            (categories ?? []).map((category) => ({
                value: category.categoryId,
                label: category.name.text,
            })),
        [categories],
    );

    return (
        <FilterCard
            title={t("search.filter.categoryId")}
            resetTooltip={t("search.filter.resetTooltip.categoryId")}
            onReset={() => resetAndNavigate("categoryId")}
        >
            <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                    <CheckboxMultiSelect
                        options={options}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        allSelectedLabel={t("search.filter.all")}
                        placeholder={t("search.filter.select")}
                        searchable
                        searchPlaceholder={t("search.filter.searchCategories")}
                    />
                )}
            />
        </FilterCard>
    );
}
