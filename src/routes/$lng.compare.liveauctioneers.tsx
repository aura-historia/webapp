import { createFileRoute } from "@tanstack/react-router";

import { LIVE_AUCTIONEERS_COMPARISON } from "@/features/comparison/config/liveAuctioneersComparison.ts";
import { buildComparisonHead } from "@/features/comparison/lib/comparisonHead.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";

export const Route = createFileRoute("/$lng/compare/liveauctioneers")({
    head: () => buildComparisonHead(LIVE_AUCTIONEERS_COMPARISON),
    component: () => <ComparisonPage definition={LIVE_AUCTIONEERS_COMPARISON} />,
});
