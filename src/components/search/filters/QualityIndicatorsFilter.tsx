import { H2 } from "@/components/typography/H2.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { AuthenticityFilter } from "@/components/search/filters/AuthenticityFilter.tsx";
import { ConditionFilter } from "@/components/search/filters/ConditionFilter.tsx";
import { ProvenanceFilter } from "@/components/search/filters/ProvenanceFilter.tsx";
import { RestorationFilter } from "@/components/search/filters/RestorationFilter.tsx";
import { OriginYearFilter } from "@/components/search/filters/OriginYearFilter.tsx";
import { Button } from "@/components/ui/button.tsx";
import { FilterX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";

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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <H2>{t("search.filter.qualityIndicators")}</H2>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="h-8 w-8 p-0"
                            aria-label={t("search.filter.resetTooltip.qualityIndicators")}
                        >
                            <FilterX className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t("search.filter.resetTooltip.qualityIndicators")}</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <OriginYearFilter />
                    <AuthenticityFilter />
                    <ConditionFilter />
                    <ProvenanceFilter />
                    <RestorationFilter />
                </div>
            </CardContent>
        </Card>
    );
}
