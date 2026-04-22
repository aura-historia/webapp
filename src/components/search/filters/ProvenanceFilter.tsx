import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { Label } from "@/components/ui/label.tsx";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";
import {
    PROVENANCES,
    PROVENANCE_TRANSLATION_CONFIG,
} from "@/data/internal/quality-indicators/Provenance.ts";

export function ProvenanceFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t } = useTranslation();

    const options = useMemo(
        () =>
            PROVENANCES.map((provenance) => ({
                value: provenance,
                label: t(PROVENANCE_TRANSLATION_CONFIG[provenance].translationKey),
                description: t(PROVENANCE_TRANSLATION_CONFIG[provenance].descriptionKey),
            })),
        [t],
    );

    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
                {t("search.filter.provenance")}
            </Label>
            <Controller
                name="provenance"
                control={control}
                render={({ field }) => (
                    <CheckboxMultiSelect
                        options={options}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        allSelectedLabel={t("search.filter.all")}
                        placeholder={t("search.filter.select")}
                        infoButtonLabel={t("common.infoButton")}
                    />
                )}
            />
        </div>
    );
}
