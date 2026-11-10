import { createFileRoute } from "@tanstack/react-router";

import { AiAgentsPage } from "@/features/ai-agents/pages/AiAgentsPage";
import { env } from "@/env";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta";

const CANONICAL_URL = `${env.VITE_APP_URL}/ai-agents`;

export const Route = createFileRoute("/$lng/ai-agents")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "aiAgents",
            url: CANONICAL_URL,
        }),
    component: AiAgentsPage,
});
