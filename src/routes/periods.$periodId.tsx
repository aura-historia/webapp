import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getPeriodByIdOptions } from "@/client/@tanstack/react-query.gen";
import { PeriodPage } from "@/components/period/PeriodPage.tsx";
import { PeriodPageSkeleton } from "@/components/period/PeriodPageSkeleton.tsx";
import { PERIOD_BANNER_URL } from "@/components/period/PeriodBanner.tsx";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";
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
    head: ({ loaderData }) => {
        const periodName = loaderData?.name?.text ?? "";
        const description = loaderData?.description?.text ?? "";
        const title = periodName
            ? i18n.t("meta.period.title", { name: periodName })
            : i18n.t("common.auraHistoria");
        const metaDescription =
            description || i18n.t("meta.period.description", { name: periodName });
        const url = loaderData?.periodId
            ? `https://aura-historia.com/periods/${loaderData.periodId}`
            : undefined;

        return {
            meta: [
                { title },
                { name: "description", content: metaDescription },
                { property: "og:title", content: title },
                { property: "og:description", content: metaDescription },
                { property: "og:type", content: "website" },
                ...(url ? [{ property: "og:url" as const, content: url }] : []),
                { property: "og:image", content: PERIOD_BANNER_URL },
                { name: "twitter:card", content: "summary_large_image" },
                { name: "twitter:title", content: title },
                { name: "twitter:description", content: metaDescription },
                ...(url ? [{ name: "twitter:url" as const, content: url }] : []),
                { name: "twitter:image", content: PERIOD_BANNER_URL },
            ],
            links: url ? [{ rel: "canonical", href: url }] : [],
        };
    },
    pendingComponent: PeriodPageSkeleton,
    errorComponent: NotFoundComponent,
    component: PeriodComponent,
});

function PeriodComponent() {
    const { periodId } = Route.useParams();
    const { i18n } = useTranslation();

    const { data: period } = useSuspenseQuery(
        getPeriodByIdOptions({
            path: { periodId },
            query: { language: parseLanguage(i18n.language) },
        }),
    );

    return <PeriodPage period={period} />;
}
