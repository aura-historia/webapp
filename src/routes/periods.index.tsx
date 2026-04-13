import { createFileRoute } from "@tanstack/react-router";
import { getPeriodsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";
import { PeriodsOverviewPage } from "@/components/period/PeriodsOverviewPage.tsx";

export const Route = createFileRoute("/periods/")({
    loader: async ({ context: { queryClient } }) => {
        return await queryClient.ensureQueryData(
            getPeriodsOptions({
                query: { language: parseLanguage(i18n.language) },
            }),
        );
    },
    head: () =>
        generatePageHeadMeta({
            pageKey: "periods",
            url: `${env.VITE_APP_URL}/periods`,
        }),
    component: PeriodsOverviewPage,
});
