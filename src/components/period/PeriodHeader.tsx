import { H1 } from "@/components/typography/H1.tsx";
import type { PeriodDetail } from "@/data/internal/period/PeriodDetail.ts";
import { getPeriodIcon } from "@/components/landing-page/periods-section/PeriodsSection.data.ts";

type PeriodHeaderProps = {
    readonly period: PeriodDetail;
};

export function PeriodHeader({ period }: PeriodHeaderProps) {
    const IconComponent = getPeriodIcon(period.periodKey);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3" data-testid="period-icon-container">
                <IconComponent className="w-8 h-8" data-testid="period-icon" />
                <H1>{period.name}</H1>
            </div>
            {period.description && (
                <p className="text-base text-muted-foreground">{period.description}</p>
            )}
        </div>
    );
}
