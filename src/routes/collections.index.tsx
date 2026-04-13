import { createFileRoute } from "@tanstack/react-router";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env.ts";
import { CollectionsOverviewPage } from "@/components/combination/CollectionsOverviewPage.tsx";

export const Route = createFileRoute("/collections/")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "collections",
            url: `${env.VITE_APP_URL}/collections`,
        }),
    component: CollectionsOverviewPage,
});
