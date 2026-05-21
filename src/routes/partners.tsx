import { createFileRoute } from "@tanstack/react-router";
import PartnersPage from "@/components/partners/PartnersPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env";

export const Route = createFileRoute("/partners")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "partners",
            url: `${env.VITE_APP_URL}/partners`,
        }),
    component: PartnersPage,
});
