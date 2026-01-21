import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { Label } from "@/components/ui/label.tsx";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";
import { PROVENANCES, PROVENANCE_TRANSLATION_CONFIG } from "@/data/internal/Provenance.ts";

export function ProvenanceFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t } = useTranslation();

    const options = useMemo(
        () =>
            PROVENANCES.map((provenance) => ({
                value: provenance,
                label: t(PROVENANCE_TRANSLATION_CONFIG[provenance].translationKey),
            })),
        [t],
    );

    return (
        <div className="space-y-2">
            <Label>{t("search.filter.provenance")}</Label>
            <Controller
                name="provenance"
                control={control}
                render={({ field }) => (
                    <CheckboxMultiSelect
                        options={options}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        allSelectedLabel={t("common.all")}
                        placeholder={t("common.select")}
                        selectedCountLabel={(count) => t("search.filter.selected", { count })}
                    />
                )}
            />
        </div>
    );
}
