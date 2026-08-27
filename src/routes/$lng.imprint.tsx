import { createFileRoute } from "@tanstack/react-router";
import { ImprintPage } from "@/features/legal/pages/ImprintPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";

export const Route = createFileRoute("/$lng/imprint")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "imprint",
            url: `${env.VITE_APP_URL}/imprint`,
            noIndex: true,
        }),
    component: ImprintPage,
});
