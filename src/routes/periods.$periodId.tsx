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
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
            <PeriodHeader period={period} />
            <PeriodProductGrid periodId={periodId} />
        </div>
    );
}
