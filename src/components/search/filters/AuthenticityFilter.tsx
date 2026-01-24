import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { Label } from "@/components/ui/label.tsx";
import { CheckboxMultiSelect } from "@/components/ui/checkbox-multi-select.tsx";
import { AUTHENTICITIES, AUTHENTICITY_TRANSLATION_CONFIG } from "@/data/internal/Authenticity.ts";

export function AuthenticityFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { t } = useTranslation();

    const options = useMemo(
        () =>
            AUTHENTICITIES.map((authenticity) => ({
                value: authenticity,
                label: t(AUTHENTICITY_TRANSLATION_CONFIG[authenticity].translationKey),
            })),
        [t],
    );

    return (
        <div className="space-y-2">
            <Label>{t("search.filter.authenticity")}</Label>
            <Controller
                name="authenticity"
                control={control}
                render={({ field }) => (
                    <CheckboxMultiSelect
                        options={options}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        allSelectedLabel={t("common.all")}
                        placeholder={t("common.select")}
                    />
                )}
            />
        </div>
    );
}
