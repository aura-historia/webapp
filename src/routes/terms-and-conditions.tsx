import { createFileRoute } from "@tanstack/react-router";
import { Terms } from "@/components/terms/Terms.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";

export const Route = createFileRoute("/terms-and-conditions")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "terms",
            url: `${env.VITE_APP_URL}/terms-and-conditions`,
            noIndex: true,
        }),
    component: Terms,
});
