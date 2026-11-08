import { createFileRoute } from "@tanstack/react-router";

import { ARTSY_COMPARISON } from "@/features/comparison/config/artsyComparison.ts";
import { buildComparisonHead } from "@/features/comparison/lib/comparisonHead.ts";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage.tsx";

export const Route = createFileRoute("/$lng/compare/artsy")({
    head: () => buildComparisonHead(ARTSY_COMPARISON),
    component: () => <ComparisonPage definition={ARTSY_COMPARISON} />,
});
