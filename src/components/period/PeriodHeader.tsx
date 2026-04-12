import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import {
    createLocalizedPeriodDateRangeMap,
    getPeriodAssetUrl,
    getPeriodDateRange,
    getPeriodHeaderAssetUrl,
} from "@/components/landing-page/periods-section/PeriodsSection.data.ts";
import type { PeriodDetail } from "@/data/internal/period/PeriodDetail.ts";
import { useTranslation } from "react-i18next";

type PeriodHeaderProps = {
    readonly period: PeriodDetail;
};

export function PeriodHeader({ period }: PeriodHeaderProps) {
    const { t } = useTranslation();
    const periodAssetUrl = getPeriodAssetUrl(period.periodKey);
    const periodHeaderAssetUrl = getPeriodHeaderAssetUrl(period.periodKey);
    const dateRangeMap = createLocalizedPeriodDateRangeMap(t);
    const periodDateRange = getPeriodDateRange(period.periodKey, dateRangeMap);
    const localizedPeriodDescription = t(`period.descriptions.${period.periodKey}`, {
        defaultValue: "",
    });
    const description = localizedPeriodDescription || t("period.header.defaultDescription");

    return (
        <header className="flex flex-col">
            <div className="relative isolate overflow-hidden bg-primary">
                <img
                    src={periodHeaderAssetUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary/85 via-primary/45 to-primary/15" />
                <div className="relative mx-auto flex min-h-85 max-w-7xl items-end px-4 pb-10 pt-24 md:min-h-130 md:px-10 md:pb-16">
                    <div className="max-w-3xl space-y-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-tertiary-fixed">
                            {t("period.header.archiveLabel")}
                        </p>
                        <H1 className="text-5xl font-normal italic leading-tight text-primary-foreground md:text-7xl">
                            {period.name}
                        </H1>
                    </div>
                </div>
            </div>
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-[minmax(220px,320px)_1fr] md:items-start md:gap-12 md:px-10 md:py-14">
                <div className="overflow-hidden border border-border/20 bg-card p-2 shadow-[0_24px_48px_-24px_rgba(28,28,22,0.22)]">
                    <img
                        src={periodAssetUrl}
                        alt=""
                        className="aspect-[9/16] w-full object-cover"
                        loading="lazy"
                    />
                </div>
                <div className="max-w-3xl space-y-6">
                    <div className="space-y-3">
                        <H2 className="text-3xl font-normal italic leading-tight md:text-4xl">
                            {t("period.header.overviewTitle")}
                        </H2>
                        <p className="text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
                            {description}
                        </p>
                    </div>
                    <div className="border-t border-border/30 pt-4">
                        <p className="font-display text-3xl italic text-primary md:text-4xl">
                            {periodDateRange}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {t("period.header.periodRange")}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
