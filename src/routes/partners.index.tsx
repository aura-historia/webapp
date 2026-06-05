import PartnersPage from "@/features/partners/components/PartnersPage.tsx";
import { env } from "@/env";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/partners/")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "partners",
            url: `${env.VITE_APP_URL}/partners`,
        }),
    component: PartnersPage,
});
