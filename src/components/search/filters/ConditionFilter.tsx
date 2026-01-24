import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { Label } from "@/components/ui/label.tsx";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";
import { CONDITIONS, CONDITION_TRANSLATION_CONFIG } from "@/data/internal/Condition.ts";

export function ConditionFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t } = useTranslation();

    const options = useMemo(
        () =>
            CONDITIONS.map((condition) => ({
                value: condition,
                label: t(CONDITION_TRANSLATION_CONFIG[condition].translationKey),
            })),
        [t],
    );

    return (
        <div className="space-y-2">
            <Label>{t("search.filter.condition")}</Label>
            <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                    <CheckboxMultiSelect
                        options={options}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        allSelectedLabel={t("search.filter.all")}
                        placeholder={t("search.filter.select")}
                    />
                )}
            />
        </div>
    );
}
