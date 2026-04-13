import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getPeriodsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { mapToPeriodOverview } from "@/data/internal/period/PeriodOverview.ts";
import {
    PERIOD_SORT_ORDER,
    createLocalizedPeriodDateRangeMap,
    getPeriodAssetUrl,
    getPeriodDateRange,
} from "@/components/landing-page/periods-section/PeriodsSection.data.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { H1 } from "@/components/typography/H1.tsx";

export function PeriodsOverviewPage() {
    const { t, i18n } = useTranslation();

    const { data: periodsData } = useQuery(
        getPeriodsOptions({
            query: { language: parseLanguage(i18n.language) },
        }),
    );

    const periods = (periodsData ?? [])
        .map(mapToPeriodOverview)
        .sort(
            (a, b) =>
                (PERIOD_SORT_ORDER[a.periodKey] ?? Number.MAX_SAFE_INTEGER) -
                (PERIOD_SORT_ORDER[b.periodKey] ?? Number.MAX_SAFE_INTEGER),
        );
    const dateRangeMap = createLocalizedPeriodDateRangeMap(t);

    return (
        <div className="bg-background">
            <header className="relative isolate overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-linear-to-b from-primary/90 to-primary/70" />
                <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-24 md:px-10 md:pb-16 md:pt-32">
                    <p className="text-xs uppercase tracking-[0.2em] text-tertiary-fixed">
                        {t("periodsOverview.subtitle")}
                    </p>
                    <H1 className="mt-3 text-5xl font-normal italic leading-tight text-primary-foreground md:text-7xl">
                        {t("periodsOverview.title")}
                    </H1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-primary-foreground/80 md:text-lg">
                        {t("periodsOverview.description")}
                    </p>
                </div>
            </header>

            <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-10 md:py-16">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {periods.map((period) => {
                        const periodAssetUrl = getPeriodAssetUrl(period.periodKey);
                        const dateRange = getPeriodDateRange(period.periodKey, dateRangeMap);
                        const description = t(`period.descriptions.${period.periodKey}`, {
                            defaultValue: "",
                        });

                        return (
                            <Link
                                key={period.periodId}
                                to="/periods/$periodId"
                                params={{ periodId: period.periodId }}
                                className="group block"
                                data-testid="period-overview-card"
                            >
                                <article className="relative h-96 overflow-hidden border border-border/20 transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(28,28,22,0.18)]">
                                    <div className="absolute inset-0">
                                        <img
                                            src={periodAssetUrl}
                                            alt={period.name}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-linear-to-t from-primary/90 via-primary/30 to-transparent" />
                                    <div className="absolute inset-x-0 bottom-0 p-5">
                                        <h2 className="font-display text-2xl leading-8 text-primary-foreground">
                                            {period.name}
                                        </h2>
                                        {dateRange && (
                                            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-primary-foreground/90">
                                                {dateRange}
                                            </p>
                                        )}
                                        {description && (
                                            <p className="mt-2 line-clamp-2 text-sm leading-5 text-primary-foreground/80">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                </article>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
