import { createFileRoute } from "@tanstack/react-router";

import { env } from "@/env";
import { PressPage } from "@/features/press/pages/PressPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta";

const CANONICAL_URL = `${env.VITE_APP_URL}/press`;

export const Route = createFileRoute("/$lng/press")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "press",
            url: CANONICAL_URL,
        }),
    component: PressPage,
});
