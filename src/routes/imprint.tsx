import { createFileRoute } from "@tanstack/react-router";
import { Imprint } from "@/components/imprint/Imprint.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";

export const Route = createFileRoute("/imprint")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "imprint",
            url: `${env.VITE_APP_URL}/imprint`,
            noIndex: true,
        }),
    component: Imprint,
});
