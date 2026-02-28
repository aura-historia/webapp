import { Controller, useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { useTranslation } from "react-i18next";
import { useFilterNavigation } from "@/hooks/search/useFilterNavigation.ts";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";
import { useMemo } from "react";
import { FilterCard } from "./FilterCard.tsx";
import { useQuery } from "@tanstack/react-query";
import { getPeriodsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";

export function PeriodFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t, i18n } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    const { data: periods } = useQuery(
        getPeriodsOptions({
            query: { language: parseLanguage(i18n.language) },
        }),
    );

    const options = useMemo(
        () =>
            (periods ?? []).map((period) => ({
                value: period.periodId,
                label: period.name.text,
            })),
        [periods],
    );

    return (
        <FilterCard
            title={t("search.filter.periodId")}
            resetTooltip={t("search.filter.resetTooltip.periodId")}
            onReset={() => resetAndNavigate("periodId")}
        >
            <Controller
                name="periodId"
                control={control}
                render={({ field }) => (
                    <CheckboxMultiSelect
                        options={options}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        allSelectedLabel={t("search.filter.all")}
                        placeholder={t("search.filter.select")}
                        searchable
                        searchPlaceholder={t("search.filter.searchPeriods")}
                    />
                )}
            />
        </FilterCard>
    );
}
