import { useTranslation } from "react-i18next";
import { AuthenticityFilter } from "@/components/search/filters/AuthenticityFilter.tsx";
import { ConditionFilter } from "@/components/search/filters/ConditionFilter.tsx";
import { ProvenanceFilter } from "@/components/search/filters/ProvenanceFilter.tsx";
import { RestorationFilter } from "@/components/search/filters/RestorationFilter.tsx";
import { OriginYearFilter } from "@/components/search/filters/OriginYearFilter.tsx";
import { useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";
import { FilterCard } from "./FilterCard.tsx";

export function QualityIndicatorsFilter() {
    const { t } = useTranslation();
    const { setValue } = useFormContext<FilterSchema>();

    const handleReset = () => {
        setValue("originYearSpan", FILTER_DEFAULTS.originYearSpan);
        setValue("authenticity", FILTER_DEFAULTS.authenticity);
        setValue("condition", FILTER_DEFAULTS.condition);
        setValue("provenance", FILTER_DEFAULTS.provenance);
        setValue("restoration", FILTER_DEFAULTS.restoration);
    };

    return (
        <FilterCard
            title={t("search.filter.qualityIndicators")}
            resetTooltip={t("search.filter.resetTooltip.qualityIndicators")}
            onReset={handleReset}
        >
            <div className="flex flex-col gap-4">
                <OriginYearFilter />
                <AuthenticityFilter />
                <ConditionFilter />
                <ProvenanceFilter />
                <RestorationFilter />
            </div>
        </FilterCard>
    );
}
