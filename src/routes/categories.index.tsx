import { createFileRoute } from "@tanstack/react-router";
import { getCategoriesOptions } from "@/client/@tanstack/react-query.gen.ts";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import i18n from "@/i18n/i18n.ts";
import { CategoriesOverviewPage } from "@/components/category/CategoriesOverviewPage.tsx";

export const Route = createFileRoute("/categories/")({
    loader: async ({ context: { queryClient } }) => {
        return await queryClient.ensureQueryData(
            getCategoriesOptions({
                query: { language: parseLanguage(i18n.language) },
            }),
        );
    },
    head: () =>
        generatePageHeadMeta({
            pageKey: "categories",
            url: `${env.VITE_APP_URL}/categories`,
        }),
    component: CategoriesOverviewPage,
});
