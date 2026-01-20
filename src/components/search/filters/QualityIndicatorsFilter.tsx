import { H2 } from "@/components/typography/H2.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { AuthenticityFilter } from "@/components/search/filters/AuthenticityFilter.tsx";
import { ConditionFilter } from "@/components/search/filters/ConditionFilter.tsx";
import { ProvenanceFilter } from "@/components/search/filters/ProvenanceFilter.tsx";
import { RestorationFilter } from "@/components/search/filters/RestorationFilter.tsx";
import { OriginYearFilter } from "@/components/search/filters/OriginYearFilter.tsx";

export function QualityIndicatorsFilter() {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <H2>{t("search.filter.qualityIndicators")}</H2>
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
