import { PeriodBanner } from "@/components/period/PeriodBanner.tsx";
import { PeriodBreadcrumbs } from "@/components/period/PeriodBreadcrumbs.tsx";
import { PeriodProductSection } from "@/components/period/PeriodProductSection.tsx";
import { usePeriodProducts } from "@/hooks/period/usePeriodProducts.ts";
import type { GetPeriodData } from "@/client";
import { useTranslation } from "react-i18next";

type PeriodPageProps = {
    readonly period: GetPeriodData;
};

export function PeriodPage({ period }: PeriodPageProps) {
    const { t } = useTranslation();
    const periodName = period.name.text;

    const latestProducts = usePeriodProducts({
        periodId: period.periodId,
        sort: "created",
        order: "desc",
        size: 6,
    });

    const mostExpensive = usePeriodProducts({
        periodId: period.periodId,
        sort: "price",
        order: "desc",
        size: 6,
    });

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-6 pt-6 pb-12 px-4 sm:px-8 lg:px-0">
            <PeriodBreadcrumbs periodName={periodName} />
            <PeriodBanner periodName={periodName} />

            {period.description.text && (
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
                    {period.description.text}
                </p>
            )}

            <div className="flex flex-col gap-12 mt-4">
                <PeriodProductSection
                    title={t("period.latestProducts")}
                    products={latestProducts.data?.products ?? []}
                    isLoading={latestProducts.isPending}
                />

                <PeriodProductSection
                    title={t("period.mostExpensive")}
                    products={mostExpensive.data?.products ?? []}
                    isLoading={mostExpensive.isPending}
                />
            </div>
        </div>
    );
}
