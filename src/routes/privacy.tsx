import { createFileRoute } from "@tanstack/react-router";
import { Privacy } from "@/components/privacy/Privacy.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";

export const Route = createFileRoute("/privacy")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "privacy",
            url: `${env.VITE_APP_URL}/privacy`,
            noIndex: true,
        }),
    component: Privacy,
});
