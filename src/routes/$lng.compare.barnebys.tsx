import { createFileRoute } from "@tanstack/react-router";

import { BARNEBYS_COMPARISON } from "@/features/comparison/config/barnebysComparison.ts";
import { buildComparisonHead } from "@/features/comparison/lib/comparisonHead.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";

export const Route = createFileRoute("/$lng/compare/barnebys")({
    head: () => buildComparisonHead(BARNEBYS_COMPARISON),
    component: () => <ComparisonPage definition={BARNEBYS_COMPARISON} />,
});
