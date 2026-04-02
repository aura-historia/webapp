import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PeriodOverview } from "@/data/internal/period/PeriodOverview.ts";
import {
    createLocalizedPeriodDateRangeMap,
    getPeriodDateRange,
    getPeriodIcon,
} from "./PeriodsSection.data.ts";
import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { H3 } from "@/components/typography/H3.tsx";

type PeriodsSectionProps = {
    readonly periods: PeriodOverview[];
};

const PAGE_SIZE = 4;

const chunkPeriods = (periods: PeriodOverview[]): PeriodOverview[][] => {
    if (periods.length === 0) {
        return [[]];
    }

    const pages: PeriodOverview[][] = [];
    for (let i = 0; i < periods.length; i += PAGE_SIZE) {
        pages.push(periods.slice(i, i + PAGE_SIZE));
    }
    return pages;
};

export default function PeriodsSection({ periods }: PeriodsSectionProps) {
    const { t } = useTranslation();
    const pages = useMemo(() => chunkPeriods(periods), [periods]);
    const localizedPeriodDateRangeMap = useMemo(() => createLocalizedPeriodDateRangeMap(t), [t]);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, pages.length - 1));
    }, [pages.length]);

    const goToPage = (targetPage: number) => {
        if (pages.length <= 1) {
            return;
        }

        const normalized = (targetPage + pages.length) % pages.length;
        if (normalized === currentPage) {
            return;
        }

        setCurrentPage(normalized);
    };

    const renderPage = (pageIndex: number) => {
        const page = pages[pageIndex] ?? [];
        return (
            <div className="absolute inset-0 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {page.map((period, index) => {
                    const Icon = getPeriodIcon(period.periodKey);
                    const range =
                        getPeriodDateRange(period.periodKey, localizedPeriodDateRangeMap) ??
                        t("landingPage.periods.rangeUnknown");

                    return (
                        <Link
                            key={`${period.periodId}-${pageIndex}`}
                            to="/periods/$periodId"
                            params={{ periodId: period.periodId }}
                            className={cn(
                                "group block",
                                index % 2 === 0 ? "lg:-translate-y-4" : "lg:translate-y-4",
                            )}
                        >
                            <article className="relative h-80 overflow-hidden bg-muted transition-transform duration-300 ease-out group-hover:-translate-y-1 sm:h-85 lg:h-90">
                                <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-primary/15 to-primary/10" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Icon className="h-14 w-14 text-primary/80" />
                                </div>

                                <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/35 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground">
                                    <H3 className="text-3xl font-normal leading-9">
                                        {period.name}
                                    </H3>
                                    <p className="mt-2 text-xs uppercase tracking-[1.2px] text-primary-foreground/80">
                                        {range}
                                    </p>
                                </div>
                            </article>
                        </Link>
                    );
                })}
            </div>
        );
    };

    return (
        <section
            className="bg-background px-4 py-20 sm:px-8"
            aria-label={t("landingPage.periods.title")}
        >
            <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-center lg:gap-16">
                <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[2px] text-primary">
                        {t("landingPage.periods.eyebrow")}
                    </p>

                    <H2 className="font-normal italic leading-[1.1] text-3xl sm:text-5xl">
                        <span className="block">{t("landingPage.periods.titleLineOne")}</span>
                        <span className="block">{t("landingPage.periods.titleLineTwo")}</span>
                    </H2>

                    <p className="max-w-sm pt-2 text-base leading-6 text-muted-foreground">
                        {t("landingPage.periods.description")}
                    </p>

                    <div className="flex items-center gap-4 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => goToPage(currentPage - 1)}
                            aria-label={t("landingPage.periods.previous")}
                            className="h-10 w-10 rounded-xl border-primary/20 bg-card text-primary hover:border-primary/40 hover:bg-card/80"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => goToPage(currentPage + 1)}
                            aria-label={t("landingPage.periods.next")}
                            className="h-10 w-10 rounded-xl border-primary/20 bg-card text-primary hover:border-primary/40 hover:bg-card/80"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative h-370 overflow-hidden sm:h-180 lg:h-102.5">
                        {renderPage(currentPage)}
                    </div>

                    <div className="flex gap-2">
                        {pages.map((page, index) => {
                            const key =
                                page.length > 0
                                    ? `period-page-indicator-${page.map((period) => period.periodId).join("-")}`
                                    : "period-page-indicator-empty";

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => goToPage(index)}
                                    aria-label={`${t("landingPage.periods.title")} ${index + 1}`}
                                    className={cn(
                                        "h-0.5 w-8 transition-colors duration-300",
                                        currentPage === index ? "bg-primary" : "bg-primary/20",
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
