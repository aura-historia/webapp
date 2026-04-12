import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPeriodByIdOptions } from "@/client/@tanstack/react-query.gen.ts";
import { mapToPeriodDetail } from "@/data/internal/period/PeriodDetail.ts";
import { generatePeriodHeadMeta } from "@/lib/seo/periodHeadMeta.ts";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";
import { PeriodPageSkeleton } from "@/components/period/PeriodPageSkeleton.tsx";
import { PeriodHeader } from "@/components/period/PeriodHeader.tsx";
import { PeriodProductGrid } from "@/components/period/PeriodProductGrid.tsx";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/periods/$periodId")({
    loader: async ({ context: { queryClient }, params: { periodId } }) => {
        return await queryClient.ensureQueryData(
            getPeriodByIdOptions({
                path: { periodId },
                query: { language: parseLanguage(i18n.language) },
            }),
        );
    },
    head: ({ loaderData, params }) => generatePeriodHeadMeta(loaderData, params),
    pendingComponent: PeriodPageSkeleton,
    errorComponent: NotFoundComponent,
    component: PeriodDetailComponent,
});

function PeriodDetailComponent() {
    const { periodId } = Route.useParams();
    const { i18n: i18nInstance } = useTranslation();

    const { data } = useSuspenseQuery(
        getPeriodByIdOptions({
            path: { periodId },
            query: { language: parseLanguage(i18nInstance.language) },
        }),
    );

    const period = mapToPeriodDetail(data);

    return (
        <div className="bg-background">
            <PeriodHeader period={period} />
            <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-10">
                <div aria-hidden="true" className="border-t border-border/30 hidden md:block" />
                <div className="pt-8">
                    <PeriodProductGrid periodId={periodId} />
                </div>
            </div>
        </div>
    );
}
