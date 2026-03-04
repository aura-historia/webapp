import { DatePicker } from "@/components/search/filters/util/DatePicker.tsx";
import { useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { useTranslation } from "react-i18next";
import { useFilterNavigation } from "@/hooks/search/useFilterNavigation.ts";
import { FilterCard } from "./FilterCard.tsx";

export function UpdateDateSpanFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["updateDate.to"] });
    const { t } = useTranslation();
    const resetAndNavigate = useFilterNavigation();

    return (
        <FilterCard
            title={t("search.filter.updateDate")}
            resetTooltip={t("search.filter.resetTooltip.updateDate")}
            onReset={() => resetAndNavigate("updateDate")}
        >
            <div className="flex flex-col w-full gap-2">
                <div className="flex flex-row gap-2 items-center justify-between">
                    <span>{t("search.filter.from")}</span>
                    <DatePicker fieldName="updateDate.from" />
                </div>
                <div className="flex flex-row gap-2 items-center justify-between">
                    <span>{t("search.filter.to")}</span>
                    <DatePicker fieldName="updateDate.to" />
                </div>
                {errors?.updateDate?.to && (
                    <p className="text-destructive text-sm mt-1">
                        {errors.updateDate.to.message ?? ""}
                    </p>
                )}
            </div>
        </FilterCard>
    );
}
