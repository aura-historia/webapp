import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { Label } from "@/components/ui/label.tsx";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";
import { RESTORATIONS, RESTORATION_TRANSLATION_CONFIG } from "@/data/internal/Restoration.ts";

export function RestorationFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t } = useTranslation();

    const options = useMemo(
        () =>
            RESTORATIONS.map((restoration) => ({
                value: restoration,
                label: t(RESTORATION_TRANSLATION_CONFIG[restoration].translationKey),
            })),
        [t],
    );

    return (
        <div className="space-y-2">
            <Label>{t("search.filter.restoration")}</Label>
            <Controller
                name="restoration"
                control={control}
                render={({ field }) => (
                    <CheckboxMultiSelect
                        options={options}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        allSelectedLabel={t("common.all")}
                        placeholder={t("common.select")}
                        selectedCountLabel={(count) => `${count} / ${options.length}`}
                    />
                )}
            />
        </div>
    );
}
